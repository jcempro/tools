import { watch as watchFs } from "node:fs";
import { mkdir, readFile, readdir, rm, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import * as sass from "sass";
import { optimizeTextByPath } from "./asset-optimizer.mjs";
import { loadBuildConfig, loadProjectConfig } from "./config.mjs";
import { buildFavicons } from "./favicons.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectConfig = await loadProjectConfig();
const srcRoot = path.join(root, projectConfig.paths.source);
const distRoot = path.join(root, projectConfig.paths.distribution);
const watch = process.argv.includes("--watch");
const buildConfig = await loadBuildConfig();
const generatedFiles = new Set([
  ...buildConfig.browserScripts,
  ...buildConfig.bookmarklets
].map(({ output }) => normalizeRel(output)));
const staticSourceExtensions = new Set([
  ".avif",
  ".css",
  ".gif",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".json",
  ".png",
  ".svg",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2"
]);
const optimizableTextExtensions = new Set([".css", ".html", ".js", ".json"]);
const noscriptSource = "NOSCRIPT.html";
const declarationsIndex = "declaracoes/unificada/index.html";
const declarationsContentDir = path.join(srcRoot, "declaracoes", "unificada", "conteudo");
const declarationsManifestFile = path.join(declarationsContentDir, "manifest.json");
const declarationsConfigFile = path.join(srcRoot, "assets", "config", "declaracoes-unificada.json");
const buildVersion = process.env.JCEM_BUILD_VERSION?.trim() || "development";
let noscriptFragmentCache;
let declarationsFragmentCache;

async function ensureParent(file) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
}

function stripInternalSourcePathComments(code) {
  return code.replace(/^\s*\/\/\s*src[\\/][^\r\n]*(?:\r?\n)?/gm, "");
}

function normalizeRel(file) {
  return file.replace(/\\/g, "/");
}

function isStaticSource(file) {
  if (path.basename(file).toLowerCase() === "rcf.md") {
    return false;
  }
  if (normalizeRel(file).toLowerCase() === noscriptSource.toLowerCase()) {
    return false;
  }
  return staticSourceExtensions.has(path.extname(file).toLowerCase());
}

function extractTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

async function officialNoscriptFragment() {
  if (noscriptFragmentCache) {
    return noscriptFragmentCache;
  }

  const source = await readFile(path.join(srcRoot, noscriptSource), "utf8");
  const styleBlocks = [...source.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map((match) => match[0].trim());
  const body = extractTagContent(source, "body");

  if (!body) {
    throw new Error(`${noscriptSource} nao contem corpo renderizavel para <noscript>.`);
  }

  noscriptFragmentCache = `<noscript>${styleBlocks.join("")}${body}</noscript>`;
  return noscriptFragmentCache;
}

async function withOfficialNoscript(html, rel) {
  if (path.extname(rel).toLowerCase() !== ".html") {
    return html;
  }

  const fragment = await officialNoscriptFragment();
  const withoutNoscript = html.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "");

  if (/<\/body>/i.test(withoutNoscript)) {
    return withoutNoscript.replace(/<\/body>/i, `${fragment}</body>`);
  }

  return `${withoutNoscript}${fragment}`;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function assertSafeMarkdown(source, file) {
  if (/<\/?[a-z][^>]*>/i.test(source) || /(?:javascript|data|vbscript)\s*:/i.test(source) || /!\s*include|\{\{[^}]+\}\}/i.test(source)) {
    throw new Error(`Markdown declarativo contem HTML, include ou URL executavel proibida: ${file}`);
  }
}

function markdownTableRow(line, file) {
  if (!/^\|.*\|$/.test(line)) {
    throw new Error(`Linha de tabela Markdown invalida em ${file}: ${line}`);
  }
  const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
  if (cells.length !== 2 || cells.some((cell) => !cell)) {
    throw new Error(`Tabela Markdown deve possuir exatamente duas celulas preenchidas em ${file}.`);
  }
  return `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
}

function compileDeclarationMarkdown(source, unit) {
  assertSafeMarkdown(source, unit.file);
  const normalized = source.replaceAll("\r\n", "\n").replaceAll("\r", "\n").trimEnd();
  const lines = normalized.split("\n");
  const headings = lines.filter((line) => line.startsWith("# "));
  if (headings.length !== 1 || headings[0] !== `# ${unit.title}` || lines[0] !== headings[0]) {
    throw new Error(`Titulo Markdown diverge do manifesto em ${unit.file}.`);
  }
  const blocks = [];
  for (let index = 1; index < lines.length;) {
    if (!lines[index]?.trim()) {
      index += 1;
      continue;
    }
    if (lines[index]?.startsWith("|")) {
      const rows = [];
      while (lines[index]?.startsWith("|")) {
        rows.push(markdownTableRow(lines[index], unit.file));
        index += 1;
      }
      blocks.push(`<table><tbody>${rows.join("")}</tbody></table>`);
      continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index]?.trim() && !lines[index]?.startsWith("|")) {
      if (/^#{1,6}\s/.test(lines[index])) {
        throw new Error(`Subtitulo Markdown nao autorizado em ${unit.file}.`);
      }
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
  }
  return `<section class="du-unit" data-unit-id="${escapeHtml(unit.id)}" data-title="${escapeHtml(unit.title)}"><h2>${escapeHtml(unit.title.toLocaleUpperCase("pt-BR"))}</h2>${blocks.join("")}</section>`;
}

function assertDeclarationConfig(config) {
  const allowed = new Set(["numero", "nome", "documento", "representantes"]);
  const templates = [config.footer?.personTemplate, config.footer?.companyTemplate, config.footer?.representationTemplate];
  if (config.schema !== 1 || config.id !== "declaracoes-unificada" || !/^#[0-9a-f]{6}$/i.test(config.document?.background ?? "") || !(config.document?.paddingCm > 0)) {
    throw new Error("Configuracao de declaracoes unificadas invalida.");
  }
  for (const template of templates) {
    if (typeof template !== "string") throw new Error("Template de declaracoes unificadas ausente.");
    for (const token of template.matchAll(/\$\{([^}]+)\}/g)) {
      if (!allowed.has(token[1])) throw new Error(`Token desconhecido na configuracao de declaracoes: ${token[1]}`);
    }
  }
}

async function officialDeclarationsFragment() {
  if (declarationsFragmentCache) return declarationsFragmentCache;
  const manifest = JSON.parse(await readFile(declarationsManifestFile, "utf8"));
  const config = JSON.parse(await readFile(declarationsConfigFile, "utf8"));
  assertDeclarationConfig(config);
  const units = Array.isArray(manifest.units) ? [...manifest.units].sort((a, b) => a.order - b.order) : [];
  const expectedFiles = units.map((unit, index) => {
    if (unit.order !== index + 1 || !/^[a-z0-9-]+$/.test(unit.id ?? "") || !/^\d{2}-[a-z0-9-]+\.md$/.test(unit.file ?? "") || typeof unit.title !== "string" || !unit.title.trim()) {
      throw new Error("Manifesto de declaracoes unificadas possui identidade, ordem, arquivo ou titulo invalido.");
    }
    return unit.file;
  });
  if (manifest.schema !== 1 || manifest.id !== "declaracoes-unificada" || units.length !== 6 || new Set(expectedFiles).size !== units.length || new Set(units.map(({ id }) => id)).size !== units.length) {
    throw new Error("Manifesto de declaracoes unificadas incompleto ou ambiguo.");
  }
  const actualFiles = (await readdir(declarationsContentDir)).filter((file) => file.endsWith(".md")).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify([...expectedFiles].sort())) {
    throw new Error("Conjunto de Markdown diverge do manifesto de declaracoes unificadas.");
  }
  const compiled = [];
  for (const unit of units) {
    const safe = path.resolve(declarationsContentDir, unit.file);
    if (path.dirname(safe) !== path.resolve(declarationsContentDir)) throw new Error(`Path Markdown inseguro: ${unit.file}`);
    compiled.push(compileDeclarationMarkdown(await readFile(safe, "utf8"), unit));
  }
  declarationsFragmentCache = compiled.join("");
  return declarationsFragmentCache;
}

async function withCompiledDeclarations(html, rel) {
  if (normalizeRel(rel) !== declarationsIndex) return html;
  const marker = '<template id="declaracoes-source"></template>';
  if (!html.includes(marker)) throw new Error(`Marcador de conteudo compilado ausente em ${rel}.`);
  return html.replace(marker, `<template id="declaracoes-source">${await officialDeclarationsFragment()}</template>`);
}

function bundleForIndex(rel) {
  const normalized = normalizeRel(rel);
  if (path.posix.basename(normalized).toLowerCase() !== "index.html") {
    return undefined;
  }

  const dir = path.posix.dirname(normalized);
  if (!dir || dir === ".") {
    return undefined;
  }

  return `${dir}/${path.posix.basename(dir)}.bundle.zip`;
}

async function collectFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const rel = prefix ? path.join(prefix, entry.name) : entry.name;
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(full, rel));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }

  return files;
}

async function copyChangedData(data, dest) {
  const current = await readFile(dest).catch(() => undefined);

  if (current && Buffer.compare(data, current) === 0) {
    return false;
  }

  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, data);
  return true;
}

async function readStaticOutput(src, rel) {
  if (!optimizableTextExtensions.has(path.extname(rel).toLowerCase())) {
    return await readFile(src);
  }

  const source = await readFile(src, "utf8");
  const withDeclarations = await withCompiledDeclarations(source, rel);
  const prepared = await withOfficialNoscript(withDeclarations, rel);
  return Buffer.from(await optimizeTextByPath(rel, prepared), "utf8");
}

async function copyStaticSources() {
  let changed = 0;

  for (const rel of await collectFiles(srcRoot)) {
    if (!isStaticSource(rel)) {
      continue;
    }

    generatedFiles.add(normalizeRel(rel));
    const source = path.join(srcRoot, rel);
    const output = await readStaticOutput(source, rel);
    if (await copyChangedData(output, path.join(distRoot, rel))) {
      changed += 1;
    }
  }

  for (const rel of buildConfig.rootPassthroughFiles) {
    generatedFiles.add(normalizeRel(rel));
    if (await copyChangedData(await readFile(path.join(root, rel)), path.join(distRoot, rel))) {
      changed += 1;
    }
  }

  for (const { output, content } of buildConfig.generatedRootFiles) {
    generatedFiles.add(normalizeRel(output));
    const dest = path.join(distRoot, output);
    const current = await readFile(dest, "utf8").catch(() => undefined);
    if (current !== content) {
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, content, "utf8");
      changed += 1;
    }
  }

  return changed;
}

async function pruneDist() {
  const generated = new Set([...generatedFiles].map((file) => normalizeRel(file)));
  for (const file of [...generated]) {
    const bundle = bundleForIndex(file);
    if (bundle) {
      generated.add(bundle);
    }
  }

  for (const rel of await collectFiles(distRoot)) {
    if (generated.has(normalizeRel(rel))) {
      continue;
    }
    await rm(path.join(distRoot, rel), { force: true });
  }
}

async function pruneEmptyDirectories(dir = distRoot) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    await pruneEmptyDirectories(path.join(dir, entry.name));
  }

  if (dir !== distRoot) {
    await rmdir(dir).catch(() => undefined);
  }
}

async function buildBrowserScripts() {
  for (const { source, output } of buildConfig.browserScripts) {
    const outfile = path.join(projectConfig.paths.distribution, output);
    await ensureParent(outfile);
    const result = await esbuild.build({
      entryPoints: [path.join(root, source)],
      bundle: true,
      define: { __JCEM_BUILD_VERSION__: JSON.stringify(buildVersion) },
      format: "iife",
      legalComments: "none",
      logLevel: "silent",
      mangleProps: /^__p\d+$/,
      minify: true,
      sourcemap: false,
      target: "es2020",
      write: false
    });
    const code = result.outputFiles?.[0]?.text;
    if (!code) {
      throw new Error(`Falha ao compilar script: ${source}`);
    }
    await writeFile(path.join(root, outfile), stripInternalSourcePathComments(code), "utf8");
  }
}

async function buildStyles() {
  for (const rel of await collectFiles(srcRoot)) {
    if (!rel.endsWith(".scss") || path.basename(rel).startsWith("_")) continue;
    const output = normalizeRel(rel.replace(/\.scss$/i, ".css"));
    const result = await sass.compileAsync(path.join(srcRoot, rel), { loadPaths: [srcRoot], style: "compressed" });
    await ensureParent(path.join("dist", output));
    await writeFile(path.join(distRoot, output), result.css, "utf8");
    generatedFiles.add(output);
  }
}

async function buildBookmarklets() {
  for (const { source, output } of buildConfig.bookmarklets) {
    const outfile = path.join(projectConfig.paths.distribution, output);
    await ensureParent(outfile);
    const result = await esbuild.build({
      bundle: true,
      entryPoints: [path.join(root, source)],
      format: "iife",
      legalComments: "none",
      minify: true,
      target: "es2020",
      write: false
    });
    const code = result.outputFiles?.[0]?.text?.trim();
    if (!code) {
      throw new Error(`Falha ao compilar bookmarklet: ${source}`);
    }
    await writeFile(path.join(root, outfile), `javascript:${code}\n`, "utf8");
  }
}

async function buildAll() {
  const copied = await copyStaticSources();
  await buildStyles();
  await buildBrowserScripts();
  await buildBookmarklets();
  const faviconOutputs = await buildFavicons({
    cacheRoot: path.join(root, projectConfig.paths.cache, "favicons"),
    distRoot,
    publicBaseUrl: projectConfig.site.publicBaseUrl,
    root,
    srcRoot
  });
  for (const output of faviconOutputs) generatedFiles.add(output);
  await pruneDist();
  await pruneEmptyDirectories();
  return copied;
}

if (watch) {
  await buildAll();
  console.log("Watch ativo. dist/ sera reconstruido ao alterar src/.");
  let timer;
  watchFs(srcRoot, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const copied = await buildAll();
        console.log(`[${new Date().toLocaleTimeString()}] dist atualizado (${copied} estaticos alterados)`);
      } catch (error) {
        console.error(error);
      }
    }, 150);
  });
} else {
  await buildAll();
  for (const { output } of buildConfig.browserScripts) {
    await readFile(path.join(distRoot, output), "utf8");
  }
}
