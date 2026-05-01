/**
 * Parity audit between the LiteLLM proxy OpenAPI spec and this SDK's
 * resource methods.
 *
 * Run:
 *   curl -sf http://localhost:14000/openapi.json -o /tmp/proxy-openapi.json
 *   npx ts-node scripts/parity-audit.ts /tmp/proxy-openapi.json [--out=docs/audit/PARITY.md]
 *
 * Outputs three lists:
 *   - missing: in proxy, not in SDK
 *   - orphan:  in SDK, not in proxy
 *   - matched: in both (path + method)
 */
import { readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

interface OpenApiSpec {
  paths: Record<string, Record<string, { operationId?: string; tags?: string[] }>>;
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
type Method = (typeof HTTP_METHODS)[number];

function normalizePath(p: string): string {
  // /v1/videos/{video_id} → /v1/videos/:p
  // /v1/videos/${encodeURIComponent(videoId)} → /v1/videos/:p
  // Also collapse trailing slashes.
  return p
    .replace(/\$\{[^}]+\}/g, ':p')
    .replace(/\{[^}]+\}/g, ':p')
    .replace(/\/$/, '');
}

/**
 * Catch-all proxy routes (`/anthropic/{endpoint}`, `/openai/{endpoint}`, etc.)
 * match any path under that prefix. The SDK's passThrough resource composes
 * the suffix at runtime, so we treat any SDK path with the same provider
 * prefix as covered.
 */
const PASSTHROUGH_PREFIXES = [
  '/anthropic',
  '/assemblyai',
  '/eu.assemblyai',
  '/azure',
  '/azure_ai',
  '/bedrock',
  '/cohere',
  '/cursor',
  '/gemini',
  '/langfuse',
  '/milvus',
  '/mistral',
  '/openai',
  '/vertex_ai',
  '/vllm',
];

function isPassthroughPath(p: string): boolean {
  // Static prefix match (proxy side): /anthropic, /openai, ...
  if (PASSTHROUGH_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    return true;
  }
  // SDK side: passThrough resources build paths as `${this.prefix}/...`,
  // which my normalizer renders as `:p/...`.
  return p.startsWith(':p/') || p === ':p';
}

function readProxyEndpoints(specPath: string): Map<string, Set<Method>> {
  const spec = JSON.parse(readFileSync(specPath, 'utf8')) as OpenApiSpec;
  const map = new Map<string, Set<Method>>();
  for (const [path, ops] of Object.entries(spec.paths)) {
    const norm = normalizePath(path);
    if (!map.has(norm)) map.set(norm, new Set());
    for (const m of HTTP_METHODS) if (ops[m]) map.get(norm)!.add(m);
  }
  return map;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

function readSdkEndpoints(resourcesDir: string): Map<string, Set<Method>> {
  const files = walk(resourcesDir);
  const map = new Map<string, Set<Method>>();

  // Match a `this.request({ ... })` call block (greedy enough to capture the
  // full options object, including method + path). Type parameters optional.
  // The generic group permits nested `<...>` brackets (e.g. `<Record<string,
  // unknown>>`) by matching one level of nesting.
  const callRe =
    /this\.(?:request|streamRequest|rawRequest|multipartRequest)(?:<(?:[^<>]|<[^<>]*>)*>)?\(\s*\{([\s\S]*?)\}\s*[,)]/g;

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    // Pre-extract all `const path = '/...'` or `path = '/...'` literal
    // assignments so we can resolve variable-form `path` references.
    const localPaths: string[] = [];
    const constRe = /\bpath\s*=\s*(?:'([^']+)'|`([^`]+)`)/g;
    let cm: RegExpExecArray | null;
    while ((cm = constRe.exec(src)) !== null) localPaths.push(cm[1] ?? cm[2]);

    // Extract both branches of `const path = X ? <literal> : <literal>` and
    // `const path = X !== undefined ? `/x/${...}` : '/x'` style ternaries.
    // The ternary may span lines; we look for `path =` followed by a
    // condition, a `?`, then any quoted/template string, a `:`, then another
    // quoted/template string. Each branch is appended to `localPaths`.
    const ternaryRe =
      /\bpath\s*=\s*[\s\S]*?\?\s*(?:'([^']+)'|`([^`]+)`)\s*:\s*(?:'([^']+)'|`([^`]+)`)/g;
    let tm: RegExpExecArray | null;
    while ((tm = ternaryRe.exec(src)) !== null) {
      const left = tm[1] ?? tm[2];
      const right = tm[3] ?? tm[4];
      if (left) localPaths.push(left);
      if (right) localPaths.push(right);
    }

    let match: RegExpExecArray | null;
    while ((match = callRe.exec(src)) !== null) {
      const body = match[1];
      const methodMatch = body.match(/method:\s*'(GET|POST|PUT|PATCH|DELETE)'/i);
      if (!methodMatch) continue;
      const method = methodMatch[1].toLowerCase() as Method;

      const pathLiteral =
        body.match(/path:\s*'([^']+)'/) ?? body.match(/path:\s*`([^`]+)`/);
      // If `path:` is a literal, use it. If the body just references `path,`
      // (shorthand or variable), fall back to all `const path = ...` literals
      // found in the file — covers conditional/ternary path construction.
      const paths: string[] = pathLiteral
        ? [pathLiteral[1]]
        : /path[,\s}]/.test(body)
          ? localPaths.slice()
          : [];

      for (const p of paths) {
        const np = normalizePath(p);
        if (!map.has(np)) map.set(np, new Set());
        map.get(np)!.add(method);
      }
    }
  }
  return map;
}

/** Return the set of equivalent paths for a given path (handles /v1 alias). */
function aliasesOf(p: string): string[] {
  if (p.startsWith('/v1/')) return [p, p.slice(3)];
  return [p, `/v1${p}`];
}

function sdkHas(
  sdk: Map<string, Set<Method>>,
  path: string,
  method: Method,
): boolean {
  return aliasesOf(path).some((p) => sdk.get(p)?.has(method));
}

function proxyHas(
  proxy: Map<string, Set<Method>>,
  path: string,
  method: Method,
): boolean {
  return aliasesOf(path).some((p) => proxy.get(p)?.has(method));
}

function diff(
  proxy: Map<string, Set<Method>>,
  sdk: Map<string, Set<Method>>,
): {
  missing: Array<{ path: string; method: Method }>;
  orphan: Array<{ path: string; method: Method }>;
  matched: Array<{ path: string; method: Method }>;
  passthrough: { proxy: number; sdk: number };
} {
  const missing: Array<{ path: string; method: Method }> = [];
  const orphan: Array<{ path: string; method: Method }> = [];
  const matched: Array<{ path: string; method: Method }> = [];
  let passProxy = 0;
  let passSdk = 0;

  // Track which proxy paths have been matched via an alias so we don't
  // double-count the alias as missing.
  const proxyMatchedAliases = new Set<string>();

  for (const [path, methods] of proxy) {
    for (const m of methods) {
      if (isPassthroughPath(path)) {
        passProxy++;
        continue;
      }
      if (sdkHas(sdk, path, m)) {
        matched.push({ path, method: m });
        for (const alias of aliasesOf(path)) proxyMatchedAliases.add(`${m} ${alias}`);
      } else {
        missing.push({ path, method: m });
      }
    }
  }
  // Filter out missing entries whose alias is matched.
  const missingFiltered = missing.filter(
    ({ path, method }) => !proxyMatchedAliases.has(`${method} ${path}`),
  );
  for (const [path, methods] of sdk) {
    for (const m of methods) {
      if (isPassthroughPath(path)) {
        passSdk++;
        continue;
      }
      if (!proxyHas(proxy, path, m)) orphan.push({ path, method: m });
    }
  }
  return {
    missing: missingFiltered,
    orphan,
    matched,
    passthrough: { proxy: passProxy, sdk: passSdk },
  };
}

function main() {
  const args = process.argv.slice(2);
  const specPath = args.find((a) => !a.startsWith('--')) ?? '/tmp/proxy-openapi.json';
  const outArg = args.find((a) => a.startsWith('--out='));
  const out = outArg ? outArg.slice('--out='.length) : null;

  const proxy = readProxyEndpoints(specPath);
  const sdk = readSdkEndpoints(resolve(__dirname, '..', 'src', 'resources'));
  const { missing, orphan, matched, passthrough } = diff(proxy, sdk);

  const sorter = (
    a: { path: string; method: Method },
    b: { path: string; method: Method },
  ) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method);
  missing.sort(sorter);
  orphan.sort(sorter);
  matched.sort(sorter);

  const fmt = (x: { path: string; method: Method }) =>
    `- \`${x.method.toUpperCase()} ${x.path}\``;

  const proxyTotal = [...proxy.values()].reduce((n, s) => n + s.size, 0);
  const sdkTotal = [...sdk.values()].reduce((n, s) => n + s.size, 0);

  const structuredProxy = proxyTotal - passthrough.proxy;
  const structuredSdk = sdkTotal - passthrough.sdk;
  const lines = [
    '# Proxy ↔ SDK parity audit',
    '',
    `Generated against \`/openapi.json\`.`,
    '',
    `**Structured endpoints**: proxy=${structuredProxy}, SDK=${structuredSdk}, matched=${matched.length}.`,
    `**Passthrough wildcard routes**: proxy=${passthrough.proxy} (catch-all under \`/{provider}/{endpoint}\`), SDK=${passthrough.sdk} (typed methods covered by passThrough resource).`,
    '',
    `Passthrough paths are excluded from the missing/orphan deltas — the proxy uses wildcard handlers under each provider prefix, so any SDK call composed against that prefix routes correctly. Per-provider typed methods (\`passThrough.openai.chatCompletions\` etc.) are validated by the unit tests in \`tests/unit/resources/pass_through.test.ts\`.`,
    '',
    `## Missing (${missing.length}) — in proxy, not in SDK`,
    '',
    missing.length ? missing.map(fmt).join('\n') : '_(none)_',
    '',
    `## Orphan (${orphan.length}) — in SDK, not in proxy`,
    '',
    orphan.length ? orphan.map(fmt).join('\n') : '_(none)_',
    '',
    `## Matched (${matched.length})`,
    '',
    matched.map(fmt).join('\n'),
    '',
  ];
  const md = lines.join('\n');

  if (out) {
    mkdirSync(resolve(__dirname, '..', out, '..'), { recursive: true });
    writeFileSync(resolve(__dirname, '..', out), md);
    console.log(
      `wrote ${out} — proxy=${structuredProxy} sdk=${structuredSdk} matched=${matched.length} missing=${missing.length} orphan=${orphan.length} (passthrough excluded: proxy=${passthrough.proxy} sdk=${passthrough.sdk})`,
    );
  } else {
    process.stdout.write(md);
  }
}

main();
