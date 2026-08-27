import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

async function collectIndexFiles(dir = "src"): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectIndexFiles(full));
    } else if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
      files.push(full);
    }
  }

  return files;
}

async function collectAllFiles(dir = "src"): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectAllFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

test("package exposes the full development lifecycle", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };

  for (const script of ["build", "build:web", "build:offline-bundles", "check", "validate:all", "publish", "publish:pages", "dev", "dev-live", "lint", "test", "type-check", "validate:publication", "agent:publish"]) {
    assert.ok(pkg.scripts[script], `missing npm script: ${script}`);
  }
  assert.equal(pkg.scripts.publish, "npm run shared:lifecycle:publish --");
  assert.match(pkg.scripts["shared:lifecycle:publish"] ?? "", /shared-lifecycle\.js publish/);
});

test("Pages deploy owns the ephemeral version index", async () => {
  const workflow = await readFile(".github/workflows/ci.yml", "utf8");
  const generator = await readFile("scripts/generate-version-index.mjs", "utf8");
  const publisher = await readFile("scripts/publish-pages.mjs", "utf8");
  const config = JSON.parse(await readFile("scripts/config.json", "utf8"));
  const { createVersionIndex, generateVersionIndex } = await import("../scripts/generate-version-index.mjs");
  const hash = "a".repeat(40);

  assert.deepEqual(createVersionIndex(hash.toUpperCase(), 123456789), { hash, timestamp: 123456789 });
  assert.throws(() => createVersionIndex("short", 123), /SHA Git completo/);
  await assert.rejects(() => generateVersionIndex({ GITHUB_ACTIONS: "false", GITHUB_REF: "refs/heads/master", JCEM_DEPLOY_VERSION: hash }), /deploy oficial/);
  assert.match(workflow, /JCEM_BUILD_VERSION:\s*\$\{\{ github\.sha \}\}/);
  assert.equal(config.publication.primaryBranch, "master");
  assert.equal(config.publication.developmentBranch, "dev");
  assert.equal(config.publication.remote, "origin");
  assert.equal(config.publication.deploymentRequestTimeoutMs, 15000);
  assert.doesNotMatch(workflow, /refs\/heads\/master|path:\s*dist/);
  assert.match(workflow, /npm run publish:pages/);
  assert.match(workflow, /steps\.publish\.outputs\.artifact-path/);
  assert.match(publisher, /config\.publication\.primaryBranch/);
  assert.match(publisher, /generateVersionIndex/);
  assert.match(generator, /Math\.floor\(Date\.now\(\) \/ 1000\)/);
});

test("local publish hook integrates dev and confirms the deployed SHA", async () => {
  const hook = await readFile(".ia.rules/hooks/publish.js", "utf8");
  const config = JSON.parse(await readFile("scripts/config.json", "utf8"));
  // @ts-expect-error Build scripts are JavaScript-only and do not publish declarations.
  const { publishRepository } = await import("../scripts/publish-project.mjs");
  const hash = "b".repeat(40);
  const calls: string[] = [];
  const responses = new Map<string, { status?: number; stdout?: string }>([
    ["branch --show-current", { stdout: "dev" }],
    ["status --porcelain", { stdout: "" }],
    ["merge-base --is-ancestor origin/dev dev", { status: 0 }],
    ["merge-base --is-ancestor origin/master master", { status: 0 }],
    ["merge-base --is-ancestor dev master", { status: 1 }],
    ["merge-base --is-ancestor master dev", { status: 0 }],
    ["rev-parse HEAD", { stdout: hash }]
  ]);
  const run = (_command: string, args: string[]) => {
    const key = args.join(" ");
    calls.push(key);
    return { status: responses.get(key)?.status ?? 0, stdout: responses.get(key)?.stdout ?? "", stderr: "" };
  };
  const result = await publishRepository({
    config,
    run,
    validate: async () => calls.push("validate"),
    fetchImpl: async () => ({ ok: true, json: async () => ({ hash }) }),
    now: () => 1,
    sleep: async () => undefined
  });

  assert.match(hook, /scripts["',\s]+publish-project\.mjs/);
  assert.equal(result.expectedHash, hash);
  assert.equal(result.integration, "fast-forward");
  assert.ok(calls.indexOf("validate") < calls.indexOf("fetch origin --prune"));
  assert.ok(calls.indexOf("push origin dev:dev") < calls.indexOf("switch master"));
  assert.ok(calls.includes("merge --ff-only dev"));
  assert.ok(calls.indexOf("push origin master:master") < calls.lastIndexOf("switch dev"));
});

test("local publish performs a real fast-forward against an isolated Git remote", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "jcem-publish-"));
  const remote = path.join(directory, "remote.git");
  const repository = path.join(directory, "work");
  const git = (args: string[], cwd = repository) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

  try {
    git(["init", "--bare", remote], directory);
    git(["init", "--initial-branch=master", repository], directory);
    git(["config", "user.name", "Publication Test"]);
    git(["config", "user.email", "publication@example.test"]);
    await writeFile(path.join(repository, "state.txt"), "master\n", "utf8");
    git(["add", "state.txt"]);
    git(["commit", "-m", "initial"]);
    git(["switch", "-c", "dev"]);
    await writeFile(path.join(repository, "state.txt"), "dev\n", "utf8");
    git(["commit", "-am", "development"]);
    const expectedHash = git(["rev-parse", "HEAD"]);
    git(["remote", "add", "origin", remote]);
    git(["push", "origin", "master", "dev"]);

    // @ts-expect-error Build scripts are JavaScript-only and do not publish declarations.
    const { publishRepository } = await import("../scripts/publish-project.mjs");
    const result = await publishRepository({
      config: {
        site: { publicBaseUrl: "https://example.test/" },
        publication: {
          developmentBranch: "dev",
          primaryBranch: "master",
          remote: "origin",
          deploymentPollMs: 1,
          deploymentRequestTimeoutMs: 10,
          deploymentTimeoutMs: 10,
          versionIndex: "version.json"
        }
      },
      rootDir: repository,
      validate: async () => undefined,
      fetchImpl: async () => ({ ok: true, json: async () => ({ hash: expectedHash }) }),
      sleep: async () => undefined
    });

    assert.equal(result.integration, "fast-forward");
    assert.equal(git(["branch", "--show-current"]), "dev");
    assert.equal(git(["rev-parse", "master"]), expectedHash);
    assert.equal(git(["rev-parse", "origin/master"]), expectedHash);
    assert.equal(git(["status", "--porcelain"]), "");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("local publish rejects a dirty tree before validation or remote mutation", async () => {
  // @ts-expect-error Build scripts are JavaScript-only and do not publish declarations.
  const { publishRepository } = await import("../scripts/publish-project.mjs");
  let validated = false;
  const calls: string[] = [];
  const run = (_command: string, args: string[]) => {
    calls.push(args.join(" "));
    return { status: 0, stdout: args[0] === "branch" ? "dev" : " M local.txt", stderr: "" };
  };

  await assert.rejects(() => publishRepository({
    config: { site: { publicBaseUrl: "https://example.test/" }, publication: { developmentBranch: "dev" } },
    run,
    validate: async () => { validated = true; }
  }), /PUBLICACAO_EXIGE_ARVORE_LIMPA/);
  assert.equal(validated, false);
  assert.deepEqual(calls, ["branch --show-current", "status --porcelain"]);
});

test("shared chrome checks updates once and delegates presentation to CSS", async () => {
  const sharedTs = await readFile("src/assets/js/documentos.ts", "utf8");
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");
  const compile = await readFile("scripts/compile.mjs", "utf8");

  assert.match(compile, /__JCEM_BUILD_VERSION__:\s*JSON\.stringify\(buildVersion\)/);
  assert.match(sharedTs, /let updateCheckStarted = false/);
  assert.match(sharedTs, /fetchVersionIndex\(endpoint, "no-cache"\)/);
  assert.match(sharedTs, /fetchVersionIndex\(`\$\{endpoint\}\?t=\$\{Date\.now\(\)\}`, "no-store"\)/);
  assert.match(sharedTs, /container\.classList\.toggle\("has-update"/);
  assert.doesNotMatch(sharedTs, /setInterval\(/);
  assert.match(sharedTs, /há atualização disponível, baixe e substitua/);
  assert.match(sharedTs, /collection: "game-icons", name: "upgrade", provider: "iconify"/);
  assert.doesNotMatch(sharedTs, /unicode: "f019"|faDownload/);
  assert.match(sharedCss, /\.jcem-chrome-meta\.has-update \.jcem-update-indicator\s*{\s*display:\s*inline-grid/);
  assert.match(sharedCss, /@keyframes jcem-update-pulse/);
  assert.match(sharedCss, /@keyframes jcem-update-button-pulse/);
  assert.match(sharedCss, /\.jcem-chrome-meta\.has-update \.jcem-update-indicator\s*{[^}]*animation:\s*jcem-update-button-pulse 1\.65s ease-in-out infinite/s);
  assert.match(sharedCss, /\.jcem-update-indicator \.jcem-fa-icon\s*{[^}]*transform-box:\s*fill-box;[^}]*animation:\s*jcem-update-pulse 1\.65s ease-in-out infinite/s);
  assert.match(sharedCss, /:root\[data-theme="dark"\] \.jcem-update-indicator/);
  assert.match(sharedCss, /prefers-reduced-motion[\s\S]*\.jcem-update-indicator,[\s\S]*\.jcem-update-indicator \.jcem-fa-icon\s*{\s*animation:\s*none !important/);
});

test("TypeScript target is ES2020 or newer", async () => {
  const tsconfig = JSON.parse(await readFile("tsconfig.json", "utf8")) as {
    compilerOptions: { target: string };
  };

  assert.match(tsconfig.compilerOptions.target, /^ES20(2\d|[3-9]\d)$/);
});

test("source index pages use stable local asset paths", async () => {
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  const relativeLocalReferences: string[] = [];

  for (const file of await collectIndexFiles()) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(attributePattern)) {
      const value = match[1] ?? "";
      if (/^(?:https?:|\/\/|\/|#|data:|mailto:|tel:)/i.test(value)) {
        continue;
      }
      relativeLocalReferences.push(`${file}: ${value}`);
    }
  }

  assert.deepEqual(relativeLocalReferences, []);
});

test("build config keeps source and public paths explicit", async () => {
  const config = JSON.parse(await readFile("scripts/config.json", "utf8")) as {
    build: {
      browserScripts: Array<{ source: string; output: string }>;
      bookmarklets: Array<{ source: string; output: string }>;
      rootPassthroughFiles: string[];
      generatedRootFiles: Record<string, string>;
    };
  };
  const entries = [...config.build.browserScripts, ...config.build.bookmarklets];

  for (const entry of entries) {
    assert.match(entry.source, /^src\/.+\.ts$/);
    assert.doesNotMatch(entry.output, /^(?:src|dist)\//);
    assert.doesNotMatch(entry.output, /(?:^|\/)\.\.(?:\/|$)/);
  }

  assert.ok(config.build.rootPassthroughFiles.includes("CNAME"));
  assert.equal(config.build.generatedRootFiles[".nojekyll"], "");
});

test("compile pruning preserves bundle zips for current index pages", async () => {
  const compile = await readFile("scripts/compile.mjs", "utf8");

  assert.match(compile, /function bundleForIndex/);
  assert.match(compile, /path\.posix\.basename\(dir\)\}\.bundle\.zip/);
  assert.match(compile, /generated\.add\(bundle\)/);
});

test("NOSCRIPT source is incorporated without direct publication", async () => {
  const compile = await readFile("scripts/compile.mjs", "utf8");
  const validate = await readFile("scripts/validate-publication.mjs", "utf8");

  assert.match(compile, /const noscriptSource = "NOSCRIPT\.html"/);
  assert.match(compile, /officialNoscriptFragment/);
  assert.match(compile, /withOfficialNoscript/);
  assert.match(validate, /distSet\.has\(noscriptSource\)/);
  assert.match(validate, /assertOfficialNoscript/);
});

test("application modules use shared institutional chrome except declared special pages", async () => {
  const violations: string[] = [];

  for (const file of await collectIndexFiles()) {
    const normalized = file.split(path.sep).join("/");
    if (normalized === "src/index.html") {
      continue;
    }

    const html = await readFile(file, "utf8");
    if (!html.includes('/assets/js/documentos.js')) {
      violations.push(`${normalized}: missing shared documentos.js`);
    }
    if (!html.includes("data-jcem-actions")) {
      violations.push(`${normalized}: missing shared chrome action slot`);
    }
    if (/<\s*(?:header|footer)\b/i.test(html)) {
      violations.push(`${normalized}: declares local header/footer`);
    }
  }

  assert.deepEqual(violations, []);
});

test("shared printable surface stays light under forced dark modes", async () => {
  const css = await readFile("src/assets/css/documentos.scss", "utf8");

  assert.match(css, /\.print-page,\s*div\.main\s*{/);
  assert.match(css, /color-scheme:\s*only light;/);
  assert.match(css, /forced-color-adjust:\s*none;/);
});

test("print page sizing does not constrain application chrome globally", async () => {
  const ts = await readFile("src/assets/js/documentos.ts", "utf8");

  assert.doesNotMatch(ts, /\*\{max-width:/);
  assert.match(ts, /body:not\(\.imprimir\) \.jcem-print-sheet/);
  assert.match(ts, /body\.imprimir \.jcem-print-sheet/);
});

test("printable modules consume the shared document workspace layout", async () => {
  const sharedTs = await readFile("src/assets/js/documentos.ts", "utf8");
  const faturamentoTs = await readFile("src/faturamento/faturamento.ts", "utf8");
  const admissionalTs = await readFile("src/oficios/admissional/admissional.ts", "utf8");
  const faturamentoCss = await readFile("src/faturamento/faturamento.scss", "utf8");
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");

  assert.match(sharedTs, /renderPrintableLayout/);
  assert.match(sharedTs, /jcem-document-workspace/);
  assert.match(sharedCss, /body\.jcem-printable-layout\s*{[^}]*min-height:\s*100vh;/s);
  assert.match(sharedCss, /body\.jcem-printable-layout\s*{[^}]*margin:\s*0;/s);
  assert.match(sharedCss, /body\.jcem-printable-layout\s*{[^}]*overflow-x:\s*clip[^}]*overflow-y:\s*visible;/s);
  assert.match(sharedCss, /html\s*{[^}]*overflow-x:\s*clip;/s);
  assert.doesNotMatch(sharedCss, /body\.jcem-printable-layout\s*{[^}]*overflow:\s*hidden;/s);
  assert.match(sharedCss, /\.jcem-document-workspace\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
  assert.match(sharedCss, /\.jcem-document-workspace\s*{[^}]*overflow:\s*clip;/s);
  assert.match(sharedCss, /\.jcem-chrome-toolbar-row::before\s*{[^}]*border-top:\s*1px solid/s);
  assert.match(sharedCss, /body\.jcem-has-app-nav:not\(\.imprimir\) \.jcem-chrome-toolbar-row::before\s*{[^}]*left:\s*3\.5rem;/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[^}]*\.jcem-document-workspace\s*{[^}]*grid-template-columns:/s);
  assert.match(sharedCss, /\.jcem-document-workspace\.jcem-document-workspace--document-only\s*{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(sharedCss, /\.jcem-document-preview-region\s*{[^}]*padding:\s*1rem;/s);
  assert.match(sharedCss, /\.jcem-document-preview-region\s*{[^}]*contain:\s*inline-size layout paint;/s);
  assert.match(sharedCss, /\.jcem-document-form-region\.no-print,\s*\.jcem-document-form-region\s*{[^}]*--jcem-form-toggle-bg:\s*#9a4b00;/s);
  assert.match(sharedCss, /\.jcem-document-form-toggle\s*{[^}]*font-size:\s*1\.05rem;[^}]*text-shadow:/s);
  assert.match(sharedTs, /className = "jcem-form-drawer-state"/);
  assert.match(sharedTs, /className = "jcem-document-form-scroll"/);
  assert.match(sharedTs, /Campos preenchíveis/);
  assert.match(sharedTs, /renderIcon\(\{ unicode: "f054" \}\)/);
  assert.match(sharedTs, /renderIcon\(\{ unicode: "f053" \}\)/);
  assert.match(sharedTs, /renderIcon\(\{ unicode: "f078" \}\)/);
  assert.match(sharedTs, /renderIcon\(\{ unicode: "f077" \}\)/);
  assert.match(sharedTs, /syncChromeHeaderOffset\(header\)/);
  assert.match(sharedCss, /\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:not\(:checked\)\) \.jcem-document-form-region\s*{[^}]*max-block-size:\s*44px/s);
  assert.match(sharedCss, /body\.jcem-printable-layout \.jcem-document-workspace:has\(> \.jcem-form-drawer-state:checked\)\s*{[^}]*grid-template-columns:\s*clamp\(21rem,\s*32vw,\s*31rem\) minmax\(0,\s*1fr\) !important/s);
  assert.match(sharedCss, /\.jcem-form-toggle-icon\s*{[^}]*inline-size:\s*1\.45rem;[^}]*block-size:\s*1\.45rem;[^}]*box-shadow:/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[\s\S]*\.jcem-document-form-region\s*{[^}]*position:\s*sticky;[^}]*top:\s*var\(--jcem-chrome-header-block-size,\s*0\);[^}]*min-block-size:\s*calc\(100svh - var\(--jcem-chrome-header-block-size,\s*0px\)\);[\s\S]*linear-gradient\(/s);
  assert.match(sharedCss, /\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:checked\) \.jcem-document-form-scroll\s*{[^}]*visibility:\s*visible;[^}]*opacity:\s*1;[^}]*pointer-events:\s*auto;/s);
  assert.match(sharedCss, /\.jcem-document-form-scroll\s*{[^}]*overflow:\s*auto;[^}]*overscroll-behavior:\s*contain;/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[\s\S]*\.jcem-document-form-region\s*{[^}]*overflow:\s*hidden;/s);
  assert.match(sharedCss, /\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:not\(:checked\)\) \.jcem-form-toggle-icon--expand-top\s*{[^}]*display:\s*inline-grid;/s);
  assert.match(sharedCss, /\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:checked\) \.jcem-form-toggle-icon--collapse-top\s*{[^}]*display:\s*inline-grid;/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[\s\S]*\.jcem-document-form-toggle\s*{[^}]*gap:\s*0\.72rem;[\s\S]*\.jcem-document-form-toggle \.jcem-form-toggle-copy\s*{[^}]*max-inline-size:\s*calc\(100svh - var\(--jcem-chrome-header-block-size,\s*0px\) - 5rem\);/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[\s\S]*\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:not\(:checked\)\) \.jcem-form-toggle-icon--expand-side\s*{[^}]*display:\s*inline-grid;/s);
  assert.match(sharedCss, /@media\s*\(min-width:\s*1120px\)\s*{[\s\S]*\.jcem-document-workspace:has\(> \.jcem-form-drawer-state:checked\) \.jcem-form-toggle-icon--collapse-side\s*{[^}]*display:\s*inline-grid;/s);
  assert.doesNotMatch(sharedTs, /jcem-form-drawer-state[\s\S]{0,300}addEventListener\("click"/);
  assert.doesNotMatch(sharedCss, /background:\s*#ff3333/);
  assert.doesNotMatch(sharedCss, /\.jcem-chrome-footer\s*{[^}]*position:\s*fixed;/s);
  assert.match(faturamentoTs, /api\.layout\.printable/);
  assert.match(admissionalTs, /api\.layout\.printable/);
  assert.doesNotMatch(faturamentoCss, /\.faturamento-shell\s*{/);
  assert.doesNotMatch(faturamentoCss, /\.preview-wrap\s*{/);
});

test("print profiles centralize A4 geometry and asynchronous PDF completion", async () => {
  const config = JSON.parse(await readFile("src/assets/config/printing.json", "utf8")) as {
    schema: number;
    profiles: Record<string, { orientation: string; size: number[]; unit: string; margins: Record<string, number> }>;
  };
  const sharedTs = await readFile("src/assets/js/documentos.ts", "utf8");
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");
  const faturamentoTs = await readFile("src/faturamento/faturamento.ts", "utf8");
  const admissionalTs = await readFile("src/oficios/admissional/admissional.ts", "utf8");
  const faturamentoCss = await readFile("src/faturamento/faturamento.scss", "utf8");

  assert.equal(config.schema, 1);
  assert.deepEqual(Object.keys(config.profiles).sort(), ["admissional", "declaracoes-unificada", "faturamento"]);
  for (const profile of Object.values(config.profiles)) {
    assert.equal(profile.orientation, "portrait");
    assert.deepEqual(profile.size, [21, 29.7]);
    assert.equal(profile.unit, "cm");
    assert.deepEqual(Object.keys(profile.margins).sort(), ["bottom", "left", "right", "top"]);
  }
  assert.deepEqual(config.profiles["declaracoes-unificada"]?.margins, { bottom: 1, left: 1, right: 1, top: 1 });
  assert.match(sharedTs, /@media print\{body \.jcem-print-sheet/);
  assert.match(sharedTs, /calc\(\$\{height\}\$\{unit\} - 1px\)/);
  assert.match(sharedTs, /calc\(\$\{height\}\$\{unit\} - 4px\)/);
  assert.match(sharedTs, /if \(result && typeof result\.then === "function"\)\s*{\s*await result;/);
  assert.match(sharedTs, /if \(!source\)\s*{\s*w\.alert\("Folha imprimivel nao configurada\."\);/);
  assert.match(sharedCss, /@media print[\s\S]*\.jcem-app-shell-content\s*{[\s\S]*display:\s*block !important/s);
  assert.match(sharedCss, /@media print[\s\S]*\.jcem-document-preview-region\s*{[\s\S]*padding:\s*0 !important;[\s\S]*background:\s*#fff !important;/s);
  assert.match(faturamentoTs, /api\.print\.profile\("faturamento"\)/);
  assert.match(admissionalTs, /api\.print\.profile\("admissional"\)/);
  assert.doesNotMatch(`${faturamentoTs}\n${admissionalTs}`, /const pageConfig\s*=\s*\{/);
  assert.doesNotMatch(faturamentoCss, /@page|\bwidth:\s*21cm|\bheight:\s*29\.7cm/);
  assert.match(sharedCss, /div\.main > div\.versao\s*{\s*display:\s*block !important;/);
  assert.match(admissionalTs, /source:\s*api\.one\("\.main"\)/);
  assert.match(admissionalTs, /mountBefore:\s*"\.main"/);
});

test("admissional keeps the vertical version mark inside the captured sheet", async () => {
  const css = await readFile("src/oficios/admissional/admissional.scss", "utf8");

  assert.match(css, /div\.main\s*{[^}]*padding-right:\s*\.45cm;/s);
  assert.match(css, /div\.main\s*>\s*div\.versao\s*{[^}]*right:\s*\.3cm;/s);
});

test("favicon build uses official tooling with target isolation and pinned svgdom compatibility", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8")) as { devDependencies: Record<string, string> };
  const config = JSON.parse(await readFile("src/assets/config/favicons.json", "utf8")) as {
    applications: Array<{ id: string; entry: string }>;
    offline: { manifest: boolean; preferredFile: string; touchIcon: boolean };
    web: { manifest: boolean; touchIcon: boolean };
  };
  const compile = await readFile("scripts/compile.mjs", "utf8");
  const bundles = await readFile("scripts/build-bundles-core.mjs", "utf8");
  const validate = await readFile("scripts/validate-publication.mjs", "utf8");
  // @ts-expect-error Build scripts are JavaScript-only and do not publish declarations.
  const { faviconValidationPlan } = await import("../scripts/favicons.mjs");
  const plan = await faviconValidationPlan({
    publicBaseUrl: "https://example.test/tools/",
    root: process.cwd(),
    srcRoot: path.join(process.cwd(), "src")
  });

  assert.equal(pkg.devDependencies["@realfavicongenerator/generate-favicon"], "^0.8.4");
  assert.equal(pkg.devDependencies["@realfavicongenerator/image-adapter-node"], "^0.8.4");
  assert.equal(pkg.devDependencies["@realfavicongenerator/inject-markups"], "^0.8.0");
  assert.equal(pkg.devDependencies.svgdom, "0.1.22");
  assert.deepEqual(config.applications.map(({ id }) => id).sort(), ["admissional", "csv-bd", "declaracoes-unificada", "faturamento"]);
  assert.deepEqual(config.web, { directory: "favicons", manifest: true, touchIcon: true });
  assert.deepEqual(config.offline, { preferredFile: "favicon.svg", manifest: false, touchIcon: false });
  assert.equal(plan.find(({ id }: { id: string }) => id === "faturamento")?.startUrl, "/tools/faturamento/");
  assert.match(compile, /buildFavicons/);
  assert.match(bundles, /embedOfflineFavicon/);
  assert.match(validate, /assertWebFavicons/);
  assert.match(validate, /exatamente um favicon autocontido/);
});

test("shared toolbar uses a declarative multi-provider icon catalog and portable data actions", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
    devDependencies: Record<string, string>;
  };
  const sharedTs = await readFile("src/assets/js/documentos.ts", "utf8");
  const iconsTs = await readFile("src/assets/js/icons.ts", "utf8");
  const iconConfig = JSON.parse(await readFile("src/assets/config/icons.json", "utf8")) as { icons: Array<{ identity: string }>; licenses: Record<string, unknown> };
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");
  const faturamentoTs = await readFile("src/faturamento/faturamento.ts", "utf8");
  const admissionalTs = await readFile("src/oficios/admissional/admissional.ts", "utf8");

  assert.ok(pkg.devDependencies["@fortawesome/free-solid-svg-icons"]);
  assert.ok(pkg.devDependencies["@lucide/icons"]);
  assert.ok(pkg.devDependencies["@iconify-icons/game-icons"]);
  assert.ok(pkg.devDependencies["@iconify-icons/streamline-sharp"]);
  assert.ok(pkg.devDependencies["@floating-ui/dom"]);
  assert.equal(pkg.devDependencies["@fortawesome/fontawesome-free"], undefined);
  assert.equal(pkg.devDependencies["@fortawesome/fontawesome-svg-core"], undefined);
  assert.match(sharedTs, /renderIcon/);
  assert.match(sharedTs, /<span>Local e <\/span><strong>automático<\/strong>/);
  assert.match(sharedTs, /ToolbarItemConfig/);
  assert.match(sharedTs, /toolbarLegacyBlueprints/);
  assert.match(sharedTs, /toolbarFillItems/);
  assert.match(sharedTs, /toolbarActionHooks/);
  assert.match(sharedTs, /hook:\s*"document\.export"/);
  assert.match(sharedTs, /hook:\s*"document\.import"/);
  assert.match(sharedTs, /toolbarRuntime\.actions/);
  assert.match(sharedTs, /id:\s*"blank-pdf"/);
  assert.match(sharedTs, /exportFilling/);
  assert.match(sharedTs, /importFilling/);
  assert.match(sharedTs, /computePosition/);
  assert.match(sharedCss, /--jcem-toolbar-icon-color:\s*#425b70/);
  assert.match(sharedCss, /\.jcem-chrome-actions\.menu \.jcem-fa-icon,[\s\S]*\.jcem-chrome-toolbar-overflow\.menu \.jcem-fa-icon\s*{[^}]*var\(--jcem-toolbar-icon-color\)/s);
  assert.match(sharedTs, /unicode:\s*"f0c7"[^\n]*id:\s*"export-fill"/);
  assert.match(sharedTs, /unicode:\s*"f07c"[^\n]*id:\s*"import-fill"/);
  assert.match(sharedTs, /collection: "streamline-sharp", name: "download-box-1-solid", provider: "iconify"/);
  assert.doesNotMatch(sharedTs, /box-open/);
  assert.match(sharedTs, /separator-print-clear/);
  assert.match(sharedTs, /item\.icons/);
  assert.match(sharedTs, /name: target === "dark" \? "moon" : "sun", provider: "lucide"/);
  assert.match(sharedTs, /renderIcon\(\{ unicode: "f142" \}\)/);
  assert.match(iconsTs, /faEllipsisVertical/);
  assert.match(iconsTs, /@iconify-icons\/game-icons\/upgrade/);
  assert.match(iconsTs, /@iconify-icons\/streamline-sharp\/download-box-1-solid/);
  assert.doesNotMatch(iconsTs, /faBoxOpen/);
  assert.match(iconsTs, /Moon as moonIcon, Sun as sunIcon/);
  assert.match(iconsTs, /const fontAwesomeAliases = new Map/);
  assert.match(iconsTs, /throw new Error\(`Icone nao cadastrado:/);
  assert.match(iconsTs, /jcem-icon--\$\{definition\.provider\}/);
  assert.ok(iconConfig.icons.some(({ identity }) => identity === "iconify:game-icons:upgrade"));
  assert.ok(iconConfig.icons.some(({ identity }) => identity === "iconify:streamline-sharp:download-box-1-solid"));
  assert.equal(iconConfig.icons.some(({ identity }) => identity === "fontawesome:box-open"), false);
  assert.ok(Object.keys(iconConfig.licenses).includes("lucide"));
  assert.match(sharedTs, /class="jcem-header-menu-state"/);
  assert.match(sharedTs, /class="jcem-toolbar-menu-state"/);
  assert.match(sharedTs, /initOverflowGroup\(header, headerActions, headerOverflow, "\.jcem-header-menu-state", \{ compactAutosave: true, compactBrand: true \}\)/);
  assert.match(sharedTs, /jcem-brand-name/);
  assert.match(sharedTs, /jcem-header-brand-short/);
  assert.match(sharedTs, /initOverflowGroup\(toolbarRow, actions, toolbarOverflow, "\.jcem-toolbar-menu-state"\)/);
  assert.match(sharedTs, /ResizeObserver/);
  assert.match(sharedTs, /addEventListener\("orientationchange", schedule/);
  assert.doesNotMatch(sharedTs, /addEventListener\("scroll"/);
  assert.match(sharedCss, /\.jcem-has-overflow \.jcem-header-menu-state:checked ~ \.jcem-chrome-header-overflow\.menu/);
  assert.match(sharedCss, /\.jcem-has-overflow \.jcem-toolbar-menu-state:checked ~ \.jcem-chrome-toolbar-overflow\.menu/);
  assert.match(sharedCss, /\.jcem-chrome-header\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto auto auto/s);
  assert.match(sharedCss, /\.jcem-theme-toggle \.jcem-fa-icon\s*{[^}]*width:\s*1\.8rem[^}]*height:\s*1\.8rem/s);
  assert.match(sharedCss, /\.jcem-author-badge:hover[\s\S]*transform:\s*translateY\(-0\.08rem\)/);
  assert.match(sharedCss, /\.jcem-theme-toggle\s*{[^}]*place-items:\s*center[^}]*padding:\s*0/s);
  assert.doesNotMatch(sharedCss, /\[data-jcem-toolbar-id="bundle"\][^{]*\.jcem-fa-icon:nth-child/);
  assert.match(sharedCss, /@keyframes jcem-autosave-breathe/);
  assert.match(sharedCss, /@keyframes jcem-autosave-glow/);
  assert.match(sharedCss, /\.jcem-autosave \.jcem-autosave-icon,[\s\S]*\.jcem-autosave\[data-jcem-autosave-indicator="true"\] \.jcem-autosave-icon\s*{[^}]*animation:\s*jcem-autosave-glow/s);
  assert.match(sharedCss, /\.jcem-autosave \.jcem-autosave-icon \.jcem-fa-icon,[\s\S]*\.jcem-autosave\[data-jcem-autosave-indicator="true"\] \.jcem-autosave-icon \.jcem-fa-icon\s*{[^}]*animation:\s*jcem-autosave-breathe/s);
  assert.match(sharedCss, /\.jcem-autosave-icon \.jcem-fa-icon\s*{[^}]*transform-box:\s*fill-box;/s);
  assert.match(sharedCss, /animation:\s*jcem-autosave-breathe 1\.2s cubic-bezier\(\.4, 0, \.2, 1\) infinite/);
  assert.match(sharedCss, /prefers-reduced-motion[\s\S]*\.jcem-autosave-icon,[\s\S]*\.jcem-autosave-icon \.jcem-fa-icon\s*{\s*animation:\s*none !important/);
  assert.match(sharedCss, /\.jcem-theme-toggle, \.jcem-nav-toggle, \.jcem-header-menu-toggle, \.jcem-toolbar-menu-toggle\s*{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
  assert.match(sharedCss, /\.jcem-license-badge\s*{[^}]*min-width:\s*44px[^}]*height:\s*44px[^}]*border:\s*0/s);
  assert.match(sharedCss, /\.jcem-chrome-actions\.menu > \*,[\s\S]*\.jcem-chrome-toolbar-overflow\.menu > \*\s*{[^}]*min-height:\s*44px[^}]*border:\s*0/s);
  assert.match(sharedTs, /const mpl2BadgeMarkup = `<img class="jcem-mpl2-icon" src="\/assets\/img\/mpl2\.svg" alt="">`;/);
  assert.match(sharedTs, /licenseBadge\.innerHTML = mpl2BadgeMarkup;/);
  assert.doesNotMatch(sharedTs, /licenseBadge\.innerHTML = `\$\{mpl2BadgeSvg\}<span>MPL 2\.0<\/span>`;/);
  assert.doesNotMatch(sharedTs, /MPL2\.svg/);
  assert.doesNotMatch(sharedTs, /setTimeout\(\(\) => tick/);
  assert.match(faturamentoTs, /actions:\s*{/);
  assert.match(admissionalTs, /actions:\s*{/);
  assert.doesNotMatch(faturamentoTs, /api\.toolbar\.bind|api\.share\.bindToolbar/);
  assert.doesNotMatch(admissionalTs, /api\.toolbar\.bind|api\.share\.bindToolbar/);
  assert.doesNotMatch(sharedCss, /\\27A6|\\1F5B6|\\1F5BC|\\232B|\\21E9/);
});

test("institutional chrome protects author, license and legal notices", async () => {
  const sharedTs = await readFile("src/assets/js/documentos.ts", "utf8");
  const guardTs = await readFile("src/assets/js/guard.ts", "utf8");
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");
  const compile = await readFile("scripts/compile.mjs", "utf8");
  const validate = await readFile("scripts/validate-publication.mjs", "utf8");
  const { g } = await import("../src/assets/js/guard");
  const seal = g();
  const protectedSources = [sharedTs, guardTs];
  const protectedTerms = [
    "JeanCarloEM",
    "jeancarloem",
    "tools.jcem.pro",
    "Mozilla Public License",
    "mozilla.org/MPL",
    "Código disponibilizado sob",
    "Os recursos não substituem",
    "único instrumento normativo",
    "Nada constitui consultoria",
    "serviço gerenciado",
    "assunção de responsabilidade",
    "responsabilidades civis"
  ];

  for (const source of protectedSources) {
    for (const term of protectedTerms) {
      assert.ok(!source.includes(term), `protected term leaked in source: ${term}`);
    }
  }

  assert.equal(seal.__p0, "JeanCarloEM");
  assert.equal(seal.__p1, "https://www.jeancarloem.com");
  assert.equal(seal.__p2, "Tools JeanCarloEM");
  assert.equal(seal.__p3, "tools.jcem.pro");
  assert.equal(seal.__p4, "Mozilla Public License 2.0");
  assert.equal(seal.__p5, "https://www.mozilla.org/MPL/2.0/");
  assert.match(seal.__p21, /Os recursos não substituem/);
  assert.match(seal.__p22, /único instrumento normativo/);
  assert.match(seal.__p23, /Nada constitui consultoria/);
  assert.match(seal.__p23, /assunção de responsabilidade/);
  assert.match(seal.__p23, /responsabilidades civis/);
  assert.match(sharedTs, /guard\(\)/);
  assert.doesNotMatch(sharedTs, /chromeDefaults|chromeCopy/);
  assert.doesNotMatch(sharedTs, /Tools JCEM/);
  assert.doesNotMatch(sharedTs, /author:\s*"JCEM"/);
  assert.match(sharedTs, /target="_blank"/);
  assert.match(sharedTs, /rel="\$\{escapeHtml\(rel\)\}"/);
  assert.match(sharedTs, /jcem-footer-legal/);
  assert.match(compile, /mangleProps:\s*\/\^__p\\d\+\$\/,/);
  assert.match(validate, /protectedChromeTerms/);
  assert.match(validate, /assertNoSourceMapReference/);
  assert.match(validate, /assertNoProtectedChromeText/);
  assert.match(sharedCss, /\.jcem-chrome-footer\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(sharedCss, /\.jcem-chrome-footer\s*{[^}]*padding:\s*2rem 1rem 2\.25rem;/s);
});

test("dashboard catalog, themes and consent remain centralized", async () => {
  const catalog = JSON.parse(await readFile("src/assets/config/apps.json", "utf8"));
  const consent = JSON.parse(await readFile("src/assets/config/consent.json", "utf8"));
  const dashboard = await readFile("src/index.html", "utf8");
  const shared = await readFile("src/assets/js/documentos.ts", "utf8");
  assert.equal(catalog.defaultApp, null);
  assert.equal(catalog.siteNameFull, "Tools JeanCarloEM");
  assert.equal(catalog.siteNameShort, "Tools JCEM");
  assert.equal(catalog.apps.length, 4);
  assert.equal(consent.cdnVersion, "2.0.0");
  assert.match(dashboard, /data-app-grid/);
  assert.match(dashboard, /data-dashboard-theme/);
  assert.ok(catalog.apps.every((app: { logo?: string }) => app.logo?.endsWith("/logo.svg")));
  assert.ok(catalog.apps.every((app: { offlineLogo?: string }) => typeof app.offlineLogo === "undefined"));
  assert.equal(catalog.workspaceOfflineLogo, undefined);
  assert.doesNotMatch(JSON.stringify(catalog), /data:image/);
  assert.match(shared, /jcem-theme/);
  assert.match(shared, /assets\/config\/apps\.json/);
  assert.match(shared, /jcem-app-shell-content/);
  assert.match(shared, /jcem-nav-state/);
  const sharedCss = await readFile("src/assets/css/documentos.scss", "utf8");
  assert.match(sharedCss, /\.jcem-app-shell\s*{[^}]*grid-template-columns:\s*3\.5rem minmax\(0, 1fr\)/s);
  assert.match(sharedCss, /\.jcem-app-shell::before\s*{[^}]*inset:\s*0 auto 0 0[^}]*background:\s*#d6e0e7/s);
  assert.match(sharedCss, /\.jcem-app-nav\s*{[^}]*position:\s*sticky[^}]*height:\s*max-content/s);
  assert.match(sharedCss, /\.jcem-app-nav::before\s*{[^}]*content:\s*none/s);
  assert.doesNotMatch(sharedCss, /\.jcem-app-nav::before\s*{[^}]*100vh/s);
  assert.match(sharedCss, /:root\[data-theme="dark"\] \.jcem-app-shell::before\s*{[^}]*background:\s*#25272a/s);
  assert.match(sharedCss, /\.jcem-nav-state:checked\s*~\s*\.jcem-app-shell \.jcem-app-nav/);
  assert.match(shared, /renderIcon\(\{ unicode: "f0c9" \}\)/);
  assert.match(sharedCss, /\.jcem-app-shell::before\s*{[^}]*transition:\s*width \.18s ease/s);
  assert.match(sharedCss, /body\.jcem-has-app-nav:not\(\.imprimir\) \.jcem-chrome-header\s*{[^}]*animation-timeline:\s*scroll\(root block\)[^}]*animation-range:\s*0 7rem/s);
  assert.match(sharedCss, /@keyframes jcem-header-nav-clearance\s*{[^}]*padding-left:\s*1rem[\s\S]*padding-left:\s*4\.5rem/s);
  assert.doesNotMatch(sharedCss, /@keyframes jcem-toolbar-nav-clearance/);
  assert.match(sharedCss, /:root\[data-theme="light"\] \.jcem-nav-toggle\s*{[^}]*color:\s*#29465b/s);
  assert.match(sharedCss, /:root\[data-theme="light"\] \.jcem-theme-toggle\s*{[^}]*color:\s*#526a7a/s);
  assert.match(sharedCss, /\.jcem-dashboard-footer p\s*{[^}]*color:\s*inherit/s);
  assert.match(sharedCss, /:root\[data-theme="dark"\] \.jcem-dashboard-footer p\s*{[^}]*color:\s*#b6bac0/s);
  assert.match(sharedCss, /\.jcem-nav-state:checked\s*~\s*\.jcem-app-shell::before\s*{[^}]*width:\s*min\(18rem/s);
  assert.doesNotMatch(shared, /addEventListener\("scroll"/);
  assert.match(shared, /initOverflowGroup/);
  assert.match(shared, /ResizeObserver/);
  assert.match(sharedCss, /:root\[data-theme="dark"\] \.jcem-chrome-actions\.menu > \*/);
  assert.match(sharedCss, /body\.jcem-has-app-nav:not\(\.imprimir\)\s*{\s*background:\s*#18191b/);
  assert.match(sharedCss, /\.jcem-license-badge/);
  assert.match(sharedCss, /\.jcem-app-nav a > span:last-child\s*{[^}]*visibility:\s*hidden/s);
  assert.match(sharedCss, /\.jcem-app-nav img\s*{[^}]*justify-self:\s*center/s);
  assert.match(sharedCss, /:root\[data-theme="dark"\] \.jcem-document-form-region fieldset\s*{[^}]*background:\s*#292b2f/s);
});

test("CSV module preserves readable local surfaces in both themes", async () => {
  const css = await readFile("src/csv-bd/bd.scss", "utf8");
  const html = await readFile("src/csv-bd/index.html", "utf8");
  const ts = await readFile("src/csv-bd/bd.ts", "utf8");
  const shared = await readFile("src/assets/js/documentos.ts", "utf8");

  assert.match(css, /:root\[data-theme="dark"\]\s*{[^}]*--panel:\s*#292c30[^}]*--ink:\s*#eef0f2/s);
  assert.match(css, /:root\[data-theme="dark"\] \.bd-app input,[\s\S]*background:\s*#35383d[^}]*color:\s*var\(--ink\)/s);
  assert.match(css, /:root\[data-theme="dark"\] \.bd-app \.summary-grid div\s*{[^}]*background:\s*#32353a/s);
  assert.match(css, /:root\[data-theme="dark"\] \.bd-app \.decisions\s*{[^}]*background:\s*#3a3525/s);
  assert.match(html, /class="ico csv-open"/);
  assert.match(html, /<div data-jcem-actions hidden>[\s\S]*<input id="csv-file" type="file"/);
  assert.doesNotMatch(html, /<label for="csv-file">/);
  assert.match(html, /class="ico csv-download"/);
  assert.match(html, /class="ico clear"/);
  assert.match(ts, /"csv-open":\s*\(\)\s*=>\s*input\("#csv-file"\)\.click\(\)/);
  assert.match(ts, /"csv-download":\s*downloadCsv/);
  assert.match(ts, /chrome\.render\(\{[^}]*autosave:\s*false/s);
  assert.match(shared, /selector:\s*"\.csv-open"/);
  assert.match(shared, /selector:\s*"\.csv-download"/);
  assert.match(shared, /options\.autosave === false \? ""/);
});

test("all published applications have SVG identity and SCSS sources", async () => {
  const monograms = new Map([["csv-bd", "CS"], ["declaracoes/unificada", "DU"], ["faturamento", "Fa"], ["oficios/admissional", "OA"]]);
  for (const [directory, monogram] of monograms) {
    const logo = await readFile(`src/${directory}/logo.svg`, "utf8");
    assert.match(logo, /<svg/);
    assert.match(logo, new RegExp(`<title[^>]*>${monogram} —`));
    assert.doesNotMatch(logo, /<text\b|data:image\//i);
  }
  const files = await collectAllFiles("src");
  assert.equal(files.some((file) => file.endsWith(".css")), false);
  assert.equal(files.filter((file) => file.endsWith(".scss")).length, 5);
});

test("public attributions are inventory-driven, linked and Web-only", async () => {
  const config = JSON.parse(await readFile("src/assets/config/attributions.json", "utf8")) as {
    entries: Array<Record<string, unknown> & { id: string; name: string }>;
    schema: number;
  };
  const html = await readFile("src/atribuicoes/index.html", "utf8");
  const dashboard = await readFile("src/index.html", "utf8");
  const shared = await readFile("src/assets/js/documentos.ts", "utf8");
  const compile = await readFile("scripts/compile.mjs", "utf8");
  const validate = await readFile("scripts/validate-publication.mjs", "utf8");
  const catalog = JSON.parse(await readFile("src/assets/config/apps.json", "utf8")) as { apps: Array<{ id: string }> };

  assert.equal(config.schema, 1);
  assert.equal(config.entries.length, 7);
  assert.deepEqual(config.entries.map(({ name }) => name), [...config.entries.map(({ name }) => name)].sort((left, right) => left.localeCompare(right, "pt-BR", { sensitivity: "base" })));
  assert.ok(config.entries.every((entry) => ["id", "name", "class", "version", "source", "authors", "licenseTitle", "spdx", "licenseUrl", "notice", "transformations", "consumers", "evidence"].every((key) => key in entry)));
  assert.equal((html.match(/class="jcem-attributions-intro"/g) ?? []).length, 1);
  assert.match(html, /data-attributions/);
  assert.match(html, /assets\/js\/icons\.js[\s\S]*assets\/js\/documentos\.js/);
  assert.doesNotMatch(JSON.stringify(catalog), /atribuicoes/i);
  assert.match(dashboard, /href="\/atribuicoes\/">Atribuições/);
  assert.match(shared, /class="jcem-attributions-link" href="\/atribuicoes\/"/);
  assert.match(compile, /withCompiledAttributions/);
  assert.match(compile, /assertAttributionsConfig/);
  assert.match(validate, /webOnlyIndexes = new Set\(buildConfig\.webOnlyIndexes\)/);
  assert.match(compile, /buildConfig\.webOnlyIndexes\.includes\(normalized\)/);
  assert.match(validate, /assertAttributions/);
});

test("dev-live builds before serving and keeps Web plus bundles synchronized", async () => {
  const live = await readFile("scripts/dev-live.mjs", "utf8");
  assert.match(live, /await runBuild\(\);[\s\S]*server\.listen/);
  assert.match(live, /watchFs\(srcRoot/);
  assert.match(live, /scripts\/compile\.mjs/);
  assert.match(live, /scripts\/build-bundles\.mjs/);
  assert.match(live, /JCEM_DEV_LIVE:\s*"1"/);
  assert.doesNotMatch(live, /64-yellow\.png/);
  assert.doesNotMatch(live, /assets", "brand", "logo\.svg"/);
  assert.doesNotMatch(live, /localAuthorLogoFallback/);
  assert.match(live, /config\.development\.vendor/);
  assert.match(live, /vendorResources/);
  assert.match(live, /integrity=\(\["'\]\)\.\*\?\\3/);
  assert.match(live, /buildQueued/);
  assert.match(live, /EADDRINUSE/);
  assert.match(live, /<\\\/body>\\s\*<\\\/html>\\s\*\$/i);
});

test("offline bundles embed the app catalog as metadata with absolute upstream routes", async () => {
  const bundleEntry = await readFile("scripts/build-bundles.mjs", "utf8");
  const bundleCore = await readFile("scripts/build-bundles-core.mjs", "utf8");
  const bundles = `${bundleEntry}\n${bundleCore}`;
  const shared = await readFile("src/assets/js/documentos.ts", "utf8");
  assert.match(bundles, /jcem-app-catalog/);
  assert.match(bundles, /charCodeAt\(0\)/);
  assert.match(bundles, /replace\(\/<head\\b\[\^>\]\*>\/i/);
  assert.match(bundles, /replace\(\/<script\/gi, "<\\\\x73cript"\)/);
  assert.match(shared, /__JCEM_APP_CATALOG__/);
  assert.match(shared, /meta\[name="jcem-app-catalog"\]/);
  assert.match(shared, /offlineLogo/);
  assert.match(bundleCore, /workspaceOfflineLogo:\s*await dataUrlFromCatalogRef\(source\.workspaceLogo\)/);
  assert.match(bundleCore, /offlineLogo:\s*await dataUrlFromCatalogRef\(app\.logo\)/);
  assert.match(bundleCore, /toDataUrl\(file\)/);
  assert.match(bundleEntry, /config\.paths\.catalog/);
  assert.match(bundleEntry, /author-logo\.png/);
  assert.doesNotMatch(bundleEntry, /src", "assets", "brand", "logo\.svg"/);
  assert.doesNotMatch(bundleEntry, /data:image\/svg\+xml;base64/);
  assert.match(bundleEntry, /const configuredAuthorLogoUrl\s*=/);
  assert.match(bundleEntry, /const authorLogo\s*=\s*await authorLogoDataUrl\(configuredAuthorLogoUrl\)/);
  assert.match(bundleEntry, /readFile\(authorLogoCachePath\)/);
  assert.match(bundleEntry, /process\.env\.JCEM_DEV_LIVE === "1"/);
  assert.match(bundleEntry, /catalog\.authorLogo\s*=\s*authorLogo/);
  assert.match(bundleEntry, /originalSharedScript\.replaceAll\(configuredAuthorLogoUrl, authorLogo\)/);
  assert.doesNotMatch(shared, /defaultAuthorLogoUrl/);
  assert.match(shared, /authorLogoUrl = options\.authorLogoUrl/);
  assert.match(shared, /if \(authorLogoUrl\) authorImage\.src = authorLogoUrl/);
  assert.match(shared, /catalog\.authorLogoUrl/);
  assert.match(await readFile("src/assets/config/apps.json", "utf8"), /"authorLogoUrl":\s*"https:\/\/jcem\.pro\/logo\/64\.png"/);
  assert.match(shared, /authorLogo\?\.startsWith\("data:image\/png;base64,"\)/);
});
