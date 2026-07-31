/**
 * tools.jcem.pro - JeanCarloEM
 * https://github.com/JeanCarloEM/tools.jcem.pro
 * Mozilla Public License 2.0 - https://www.mozilla.org/MPL/2.0/
 * Este arquivo integra o gerador oficial de favicons ao build.
 */
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  generateFaviconFiles,
  generateFaviconHtml,
  initFaviconIconSettings,
  stringToSvg
} from "@realfavicongenerator/generate-favicon";
import { getNodeImageAdapter } from "@realfavicongenerator/image-adapter-node";
import { DefaultRemovedMarkupCssSelectors, injectMarkupInHtmlHead } from "@realfavicongenerator/inject-markups";
import { minifyHtmlText } from "./asset-optimizer.mjs";

const require = createRequire(import.meta.url);
const toolVersions = {
  generate: require("@realfavicongenerator/generate-favicon/package.json").version,
  adapter: require("@realfavicongenerator/image-adapter-node/package.json").version,
  inject: require("@realfavicongenerator/inject-markups/package.json").version
};

function normalizeRel(value) {
  return String(value).replace(/\\/g, "/").replace(/^\/+/, "");
}

function assertRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}: objeto esperado.`);
  return value;
}

function assertSafeRelative(value, label) {
  const normalized = normalizeRel(value);
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.split("/").includes("..")) {
    throw new Error(`${label}: caminho relativo seguro esperado.`);
  }
  return normalized;
}

function publicPath(basePath, rel, directory = false) {
  const joined = `/${path.posix.join(basePath, normalizeRel(rel))}`.replace(/\/+/g, "/");
  return directory ? `${joined.replace(/\/+$/g, "")}/` : joined;
}

async function loadContext({ root, srcRoot, publicBaseUrl }) {
  const configPath = path.join(srcRoot, "assets", "config", "favicons.json");
  const catalogPath = path.join(srcRoot, "assets", "config", "apps.json");
  const [configText, catalogText] = await Promise.all([readFile(configPath, "utf8"), readFile(catalogPath, "utf8")]);
  const config = assertRecord(JSON.parse(configText), "favicons.json");
  const catalog = assertRecord(JSON.parse(catalogText), "apps.json");
  if (config.schema !== 1) throw new Error(`favicons.json: schema nao suportado (${config.schema}).`);
  if (!Array.isArray(config.applications) || !Array.isArray(catalog.apps)) throw new Error("favicons/apps: listas de aplicacoes ausentes.");
  const common = assertRecord(config.common, "favicons.common");
  const web = assertRecord(config.web, "favicons.web");
  const offline = assertRecord(config.offline, "favicons.offline");
  const workspace = assertRecord(config.workspace, "favicons.workspace");
  const basePath = new URL(publicBaseUrl).pathname;
  const appsById = new Map(catalog.apps.map((app) => [app.id, app]));
  const targets = [];
  const workspaceEntries = Array.isArray(workspace.entries) ? workspace.entries.map((entry, index) => assertSafeRelative(entry, `workspace.entries[${index}]`)) : [];
  targets.push({
    id: "workspace",
    entries: workspaceEntries,
    logo: assertSafeRelative(workspace.logo, "workspace.logo"),
    name: `${workspace.name ?? ""}`.trim(),
    shortName: `${workspace.shortName ?? ""}`.trim(),
    outputDir: `assets/${assertSafeRelative(web.directory, "web.directory")}/workspace`,
    startPath: ""
  });
  for (const [index, itemValue] of config.applications.entries()) {
    const item = assertRecord(itemValue, `applications[${index}]`);
    const id = `${item.id ?? ""}`.trim();
    const app = appsById.get(id);
    if (!app) throw new Error(`favicon: aplicacao sem identidade no catalogo (${id}).`);
    const entry = assertSafeRelative(item.entry, `applications[${index}].entry`);
    const directory = path.posix.dirname(entry);
    targets.push({
      id,
      entries: [entry],
      logo: assertSafeRelative(app.logo, `apps.${id}.logo`),
      name: `${app.title ?? ""}`.trim(),
      shortName: `${app.title ?? ""}`.trim(),
      outputDir: `${directory}/${assertSafeRelative(web.directory, "web.directory")}`,
      startPath: directory
    });
  }
  const ids = new Set();
  const entries = new Set();
  for (const target of targets) {
    if (!target.name || !target.shortName || ids.has(target.id)) throw new Error(`favicon: alvo invalido ou duplicado (${target.id}).`);
    ids.add(target.id);
    for (const entry of target.entries) {
      if (entries.has(entry)) throw new Error(`favicon: entrada duplicada (${entry}).`);
      entries.add(entry);
    }
  }
  return { basePath, catalogText, common, config, configText, offline, root, srcRoot, targets, web };
}

function sanitizeSvgForGenerator(svg) {
  // FIX-BUG: svgdom rejeita a declaracao xmlns sem namespace criada pelo parser do adaptador.
  return svg.replace(/\s+xmlns=(['"])http:\/\/www\.w3\.org\/2000\/svg\1/u, "");
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (value instanceof Blob) return Buffer.from(await value.arrayBuffer());
  throw new Error("favicon: tipo de arquivo gerado nao suportado.");
}

async function exists(file) {
  return Boolean((await stat(file).catch(() => undefined))?.isFile());
}

function settingsFor(target, context) {
  const icon = initFaviconIconSettings();
  icon.touch.appTitle = target.name;
  icon.webAppManifest.name = target.name;
  icon.webAppManifest.shortName = target.shortName;
  icon.webAppManifest.backgroundColor = `${context.common.backgroundColor}`;
  icon.webAppManifest.themeColor = `${context.common.themeColor}`;
  return {
    icon,
    path: publicPath(context.basePath, target.outputDir, true),
    skipMetadataInjection: context.common.skipMetadataInjection === true
  };
}

function targetHash(target, context, logo) {
  return createHash("sha256").update(JSON.stringify({
    target,
    config: context.config,
    catalog: context.catalogText,
    logo: createHash("sha256").update(logo).digest("hex"),
    toolVersions,
    basePath: context.basePath
  })).digest("hex");
}

function withManifestScope(content, target, context) {
  const manifest = JSON.parse(content);
  const startUrl = publicPath(context.basePath, target.startPath, true);
  manifest.start_url = startUrl;
  manifest.scope = startUrl;
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function generateTarget(target, context, distRoot, cacheRoot) {
  const logoFile = path.join(context.srcRoot, target.logo);
  const logo = await readFile(logoFile, "utf8").catch(() => undefined);
  if (!logo || !/<svg\b/u.test(logo)) throw new Error(`favicon: logo SVG ausente ou invalido para ${target.id}: ${target.logo}`);
  const outputDir = path.join(distRoot, target.outputDir);
  const cacheFile = path.join(cacheRoot, `${target.id}.json`);
  const hash = targetHash(target, context, logo);
  const cached = JSON.parse(await readFile(cacheFile, "utf8").catch(() => "null"));
  const cachedFiles = Array.isArray(cached?.files) ? cached.files.map(normalizeRel) : [];
  const cacheHit = cached?.hash === hash && cachedFiles.length > 0 && (await Promise.all(cachedFiles.map((file) => exists(path.join(distRoot, file))))).every(Boolean);
  let files = cachedFiles;
  const settings = settingsFor(target, context);
  if (!cacheHit) {
    const adapter = await getNodeImageAdapter();
    const icon = stringToSvg(sanitizeSvgForGenerator(logo), adapter);
    const generated = await generateFaviconFiles({ icon }, settings, adapter);
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });
    files = [];
    for (const [name, value] of Object.entries(generated).sort(([a], [b]) => a.localeCompare(b))) {
      const safeName = path.posix.basename(name);
      let content = await toBuffer(value);
      if (safeName === "site.webmanifest") content = Buffer.from(withManifestScope(content.toString("utf8"), target, context), "utf8");
      const rel = normalizeRel(path.posix.join(target.outputDir, safeName));
      await writeFile(path.join(distRoot, rel), content);
      files.push(rel);
    }
    await mkdir(path.dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, `${JSON.stringify({ files, hash, toolVersions }, null, 2)}\n`, "utf8");
  }
  const generatedHtml = generateFaviconHtml(settings);
  const markups = [...generatedHtml.markups, `<meta name="theme-color" content="${context.common.themeColor}" />`];
  const selectors = [...generatedHtml.cssSelectors, 'meta[name="theme-color"]'];
  for (const entry of target.entries) {
    const htmlFile = path.join(distRoot, entry);
    const html = await readFile(htmlFile, "utf8");
    const injected = injectMarkupInHtmlHead(html, markups, selectors);
    await writeFile(htmlFile, await minifyHtmlText(injected), "utf8");
  }
  return files;
}

export async function buildFavicons({ cacheRoot, distRoot, publicBaseUrl, root, srcRoot }) {
  const context = await loadContext({ root, srcRoot, publicBaseUrl });
  const files = [];
  for (const target of context.targets) files.push(...await generateTarget(target, context, distRoot, cacheRoot));
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

export async function expectedFaviconOutputs({ publicBaseUrl, root, srcRoot }) {
  const context = await loadContext({ root, srcRoot, publicBaseUrl });
  const names = ["apple-touch-icon.png", "favicon-96x96.png", "favicon.ico", "favicon.svg", "site.webmanifest", "web-app-manifest-192x192.png", "web-app-manifest-512x512.png"];
  return context.targets.flatMap((target) => names.map((name) => normalizeRel(path.posix.join(target.outputDir, name)))).sort((a, b) => a.localeCompare(b));
}

export async function faviconValidationPlan({ publicBaseUrl, root, srcRoot }) {
  const context = await loadContext({ root, srcRoot, publicBaseUrl });
  return context.targets.map((target) => ({
    entries: [...target.entries],
    id: target.id,
    manifest: normalizeRel(path.posix.join(target.outputDir, "site.webmanifest")),
    outputPath: publicPath(context.basePath, target.outputDir, true),
    startUrl: publicPath(context.basePath, target.startPath, true),
    themeColor: `${context.common.themeColor}`
  }));
}

export async function embedOfflineFavicon({ html, indexRel, distRoot, publicBaseUrl, root, srcRoot }) {
  const context = await loadContext({ root, srcRoot, publicBaseUrl });
  const target = context.targets.find((candidate) => candidate.entries.includes(normalizeRel(indexRel)));
  if (!target || target.id === "workspace") return html;
  const preferred = path.posix.basename(`${context.offline.preferredFile ?? ""}`);
  if (!preferred) throw new Error("favicon offline: preferredFile ausente.");
  const file = path.join(distRoot, target.outputDir, preferred);
  const content = await readFile(file).catch(() => undefined);
  if (!content?.length) throw new Error(`favicon offline ausente para ${target.id}: ${preferred}`);
  const mime = preferred.endsWith(".svg") ? "image/svg+xml" : preferred.endsWith(".png") ? "image/png" : "image/x-icon";
  const markup = `<link rel="icon" href="data:${mime};base64,${content.toString("base64")}" type="${mime}" />`;
  return injectMarkupInHtmlHead(html, [markup], DefaultRemovedMarkupCssSelectors);
}
