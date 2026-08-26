import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import {
  DECLARATIONS_SCHEMA,
  moveDeclarant,
  orderedDeclarants,
  parseDeclarationsState,
  removeDeclarantAndReferences,
  representativesArePrior,
  type Declarant,
  type DeclarationsState
} from "../src/declaracoes/unificada/unificada";

const contentRoot = "src/declaracoes/unificada/conteudo";

function declarant(id: string, type: "PF" | "PJ", representativeIds: string[] = []): Declarant {
  return { document: type === "PF" ? "52998224725" : "11222333000181", id, name: id, representativeIds, type };
}

test("manifest selects exactly the six gray ODT tables and audits syntax corrections", async () => {
  const manifest = JSON.parse(await readFile(`${contentRoot}/manifest.json`, "utf8")) as {
    source: { file: string; sha256: string; tables: string[] };
    syntaxCorrections: Array<{ markdown: string; origin: string; reason: string; table: string }>;
    units: Array<{ file: string; order: number; title: string }>;
  };
  const evidence = await readFile(manifest.source.file);
  assert.equal(createHash("sha256").update(evidence).digest("hex").toUpperCase(), manifest.source.sha256);
  assert.deepEqual(manifest.source.tables, ["Tabela1", "Tabela2", "Tabela4", "Tabela6", "Tabela8", "Tabela9"]);
  assert.equal(manifest.units.length, 6);
  assert.deepEqual(manifest.units.map(({ order }) => order), [1, 2, 3, 4, 5, 6]);
  assert.ok(manifest.syntaxCorrections.length >= 9);
  assert.ok(manifest.syntaxCorrections.every(({ markdown, origin, reason, table }) => markdown && origin && reason && manifest.source.tables.includes(table)));
  assert.ok(manifest.syntaxCorrections.some(({ origin, markdown }) => origin === "poderão se r obtidas" && markdown === "poderão ser obtidas"));
});

test("Markdown set is closed, structurally valid and preserves material source wording", async () => {
  const manifest = JSON.parse(await readFile(`${contentRoot}/manifest.json`, "utf8")) as { units: Array<{ file: string; title: string }> };
  const actual = (await readdir(contentRoot)).filter((file) => file.endsWith(".md")).sort();
  assert.deepEqual(actual, manifest.units.map(({ file }) => file).sort());
  for (const unit of manifest.units) {
    const markdown = await readFile(`${contentRoot}/${unit.file}`, "utf8");
    assert.equal(markdown.match(/^# /gm)?.length, 1);
    assert.ok(markdown.startsWith(`# ${unit.title}\n`));
    assert.doesNotMatch(markdown, /<\/?[a-z][^>]*>|(?:javascript|data|vbscript)\s*:/i);
  }
  const domicile = await readFile(`${contentRoot}/03-domicilio-fiscal.md`, "utf8");
  const rendeFacil = await readFile(`${contentRoot}/04-bb-rende-facil.md`, "utf8");
  const receivables = await readFile(`${contentRoot}/06-agenda-recebiveis.md`, "utf8");
  assert.match(domicile, /DECLARAÇÔES E ASSINATURAS/);
  assert.match(domicile, /SISBB 24275 – mpa Declaração de Domicílio Fiscal – NIF um equivalente funcional/);
  assert.match(rendeFacil, /BB Rende Facil/);
  assert.match(receivables, /arranjo\(s\) de pagamento\(s\)/);
  assert.match(receivables, /Brasil \(Bacen\)/);
  assert.match(receivables, /poderão ser obtidas/);
});

test("stable identities, PF/PJ footer order and prior-representative invariant are deterministic", () => {
  const pf1 = declarant("d-1", "PF");
  const pj = declarant("d-2", "PJ", ["d-1"]);
  const pf2 = declarant("d-3", "PF");
  const source = [pf1, pj, pf2];
  assert.deepEqual(orderedDeclarants(source).map(({ id }) => id), ["d-1", "d-3", "d-2"]);
  assert.equal(representativesArePrior(source), true);
  assert.equal(moveDeclarant(source, "d-2", -1), null);
  assert.deepEqual(moveDeclarant(source, "d-3", -1)?.map(({ id }) => id), ["d-1", "d-3", "d-2"]);
  assert.deepEqual(removeDeclarantAndReferences(source, "d-1").find(({ id }) => id === "d-2")?.representativeIds, []);
});

test("portable schema rejects incompatible version, duplicate IDs and future references", () => {
  const valid: DeclarationsState = {
    city: "Pirassununga",
    date: "2026-08-26",
    declarants: [declarant("d-1", "PF"), declarant("d-2", "PJ", ["d-1"])],
    nextSequence: 3,
    schema: DECLARATIONS_SCHEMA,
    uf: "SP",
    version: 1
  };
  assert.deepEqual(parseDeclarationsState(valid), valid);
  assert.equal(parseDeclarationsState({ ...valid, schema: "outro" }), null);
  assert.equal(parseDeclarationsState({ ...valid, version: 2 }), null);
  assert.equal(parseDeclarationsState({ ...valid, declarants: [declarant("d-1", "PF"), declarant("d-1", "PF")] }), null);
  assert.equal(parseDeclarationsState({ ...valid, declarants: [declarant("d-1", "PJ", ["d-2"]), declarant("d-2", "PF")] }), null);
});

test("module integrates compiled content, DU identity, central config and multipage output", async () => {
  const [html, source, css, logo, compile, bundles, validator, appConfig] = await Promise.all([
    readFile("src/declaracoes/unificada/index.html", "utf8"),
    readFile("src/declaracoes/unificada/unificada.ts", "utf8"),
    readFile("src/declaracoes/unificada/unificada.scss", "utf8"),
    readFile("src/declaracoes/unificada/logo.svg", "utf8"),
    readFile("scripts/compile.mjs", "utf8"),
    readFile("scripts/build-bundles-core.mjs", "utf8"),
    readFile("scripts/validate-publication.mjs", "utf8"),
    readFile("src/assets/config/declaracoes-unificada.json", "utf8")
  ]);
  const runtimeConfig = JSON.parse(appConfig) as { document: { background: string }; footer: Record<string, unknown> };
  assert.match(html, /<template id="declaracoes-source"><\/template>/);
  assert.doesNotMatch(html, /AUTORIZAÇÃO PARA CONSULTA AO SCR/);
  assert.match(compile, /withCompiledDeclarations/);
  assert.match(compile, /compileDeclarationMarkdown/);
  assert.match(source, /api\.print\.profile\("declaracoes-unificada"\)/);
  assert.match(source, /representativesArePrior/);
  assert.match(source, /declarant\.document\.length !== expectedLength/);
  assert.match(source, /\^\(\\d\)\\1\+\$/);
  assert.match(source, /Página <span data-page-current>/);
  assert.match(source, /Ctrl|event\.key\.toLowerCase\(\) === "p"/);
  assert.match(css, /grid-template-rows:\s*auto minmax\(0, 1fr\) auto/);
  assert.match(css, /\.du-page:last-child/);
  assert.match(logo, /<title[^>]*>DU — Declarações Unificadas<\/title>/);
  assert.match(logo, /#302a64/i);
  assert.match(logo, /#63d6d1/i);
  assert.equal(runtimeConfig.document.background, "#d9d9d9");
  assert.match(JSON.stringify(runtimeConfig.footer), /\$\{numero\}/);
  assert.match(bundles, /fonte Markdown proibida/);
  assert.match(validator, /Fontes Markdown nao podem integrar dist/);
});
