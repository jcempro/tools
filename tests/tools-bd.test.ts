import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  convertDataset,
  inferModelKind,
  mergeDatasets,
  oppositeModel,
  parseCsv,
  serializeCsv
} from "../src/assets/js/tabular";

test("bd parser detects delimiter and preserves quoted line breaks", () => {
  const dataset = parseCsv("MCI;Nome;Fone;Obs\r\n1;'Maria Silva';11999990000;'linha 1\r\nlinha 2'\r\n");

  assert.equal(dataset.dialect.delimiter, ";");
  assert.deepEqual(dataset.columns, ["MCI", "Nome", "Fone", "Obs"]);
  assert.equal(dataset.rows.length, 1);
  assert.equal(dataset.rows[0]?.[3], "linha 1\r\nlinha 2");
});

test("bd converts modelo 1 to modelo 2 preserving unknown customer columns", () => {
  const source = parseCsv([
    "MCI;Nome;Fone;Nome 2;Fone 2;Segmento",
    "100;Ana;(11) 1111-0000;Ana Casa;+55 22 22;A",
    "200;Ana;11 1111-0000;;;B"
  ].join("\n"));

  const result = convertDataset(source, "modelo1", "modelo2");

  assert.equal(result.issues.some((issue) => issue.severity === "error"), false);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "MCI", "Segmento", "MCI 2", "Segmento 2"]);
  assert.deepEqual(result.dataset.rows[0], ["1111110000", "Ana", "100", "A", "200", "B"]);
  assert.deepEqual(result.dataset.rows[1], ["552222", "Ana Casa", "100", "A", "", ""]);
});

test("bd recognizes compact indexed phone/name columns in modelo 1", () => {
  const source = parseCsv([
    "MCI;Nome;Fone;Nome2;Fone2;Nome3;Fone3;Segmento",
    "100;Ana;(11) 1111-0000;Ana Casa;2222;Ana Trabalho;3333;A"
  ].join("\n"));

  const result = convertDataset(source, "modelo1", "modelo2");

  assert.equal(result.issues.some((issue) => issue.severity === "error"), false);
  assert.equal(result.dataset.columns.some((column) => /^fone\s*\d+$/i.test(column) || /^nome\s*\d+$/i.test(column)), false);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "MCI", "Segmento"]);
  assert.deepEqual(result.dataset.rows, [
    ["1111110000", "Ana", "100", "A"],
    ["2222", "Ana Casa", "100", "A"],
    ["3333", "Ana Trabalho", "100", "A"]
  ]);
});

test("bd ignores local id column unless explicitly marked as identifier", () => {
  const source = parseCsv([
    "id;MCI;Nome;Fone;Segmento",
    "local-1;100;Ana;1111;A"
  ].join("\n"));

  const defaultResult = convertDataset(source, "modelo1", "modelo2");
  assert.deepEqual(defaultResult.dataset.columns, ["Fone", "Nome", "MCI", "Segmento"]);
  assert.deepEqual(defaultResult.dataset.rows, [["1111", "Ana", "100", "A"]]);

  const explicitResult = convertDataset(source, "modelo1", "modelo2", {
    identifierColumns: ["id", "MCI"]
  });
  assert.deepEqual(explicitResult.dataset.columns, ["Fone", "Nome", "id", "MCI", "Segmento"]);
  assert.deepEqual(explicitResult.dataset.rows, [["1111", "Ana", "local-1", "100", "A"]]);
});

test("bd infers source model and uses the opposite model as target", () => {
  const modelo1 = parseCsv([
    "MCI;Nome;Fone;Nome2;Fone2",
    "100;Ana;1111;Ana Casa;2222"
  ].join("\n"));
  const modelo2 = parseCsv([
    "Fone;Nome;MCI;MCI 2",
    "1111;Ana;100;200"
  ].join("\n"));

  assert.equal(inferModelKind(modelo1), "modelo1");
  assert.equal(oppositeModel(inferModelKind(modelo1)), "modelo2");
  assert.equal(inferModelKind(modelo2), "modelo2");
  assert.equal(oppositeModel(inferModelKind(modelo2)), "modelo1");
});

test("bd rejects conversion with equal source and target models", () => {
  const source = parseCsv("MCI;Nome;Fone\n100;Ana;1111\n");
  const result = convertDataset(source, "modelo1", "modelo1");

  assert.equal(result.issues.some((issue) => issue.code === "same-model" && issue.severity === "error"), true);
});

test("bd asks for name decision when the same phone has divergent names", () => {
  const source = parseCsv([
    "MCI;Nome;Fone",
    "100;Ana Silva;(11) 1111-0000",
    "200;Maria Souza;11 1111-0000"
  ].join("\n"));

  const result = convertDataset(source, "modelo1", "modelo2");

  assert.equal(result.pendingNameDecisions.length, 1);
  assert.deepEqual(result.pendingNameDecisions[0]?.candidates, ["Ana Silva", "Maria Souza"]);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "MCI", "MCI 2"]);
  assert.deepEqual(result.dataset.rows, [
    ["1111110000", "Ana Silva", "100", "200"]
  ]);
});

test("bd applies manual name decisions using phone as the modelo 2 key", () => {
  const source = parseCsv([
    "MCI;Nome;Fone",
    "100;Ana Silva;(11) 1111-0000",
    "200;Maria Souza;11 1111-0000"
  ].join("\n"));

  const result = convertDataset(source, "modelo1", "modelo2", {
    nameDecisions: {
      "1111110000": "Maria Souza"
    }
  });

  assert.equal(result.pendingNameDecisions.length, 0);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "MCI", "MCI 2"]);
  assert.deepEqual(result.dataset.rows, [
    ["1111110000", "Maria Souza", "100", "200"]
  ]);
});

test("bd infers the longest contained name variation automatically", () => {
  const source = parseCsv([
    "MCI;Nome;Fone",
    "100;Ana;(11) 1111-0000",
    "200;Ana Silva;11 1111-0000"
  ].join("\n"));

  const result = convertDataset(source, "modelo1", "modelo2");

  assert.equal(result.pendingNameDecisions.length, 0);
  assert.deepEqual(result.dataset.rows, [
    ["1111110000", "Ana Silva", "100", "200"]
  ]);
});

test("bd reconstructs modelo 1 from modelo 2 many-to-many data", () => {
  const source = parseCsv([
    "Fone;Nome;MCI;Segmento;MCI 2;Segmento 2",
    "(11) 1111-0000;Ana;100;A;200;B",
    "2222;Ana Casa;100;A;;"
  ].join("\n"));

  const result = convertDataset(source, "modelo2", "modelo1");

  assert.equal(result.issues.some((issue) => issue.severity === "error"), false);
  assert.deepEqual(result.dataset.columns, ["MCI", "Segmento", "Fone", "Nome", "Fone 2", "Nome 2"]);
  assert.deepEqual(result.dataset.rows[0], ["100", "A", "1111110000", "Ana", "2222", "Ana Casa"]);
  assert.deepEqual(result.dataset.rows[1], ["200", "B", "1111110000", "Ana", "", ""]);
});

test("bd serializer emits UTF-8 BOM and deterministic semicolon CSV", () => {
  const source = parseCsv("MCI,Fone,Nome\n100,1111,Ana\n");
  const csv = serializeCsv(source);

  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(csv.slice(1), "MCI;Fone;Nome\r\n100;1111;Ana\r\n");
});

test("bd merges deterministically in the three row policies", () => {
  const previous = parseCsv("MCI;Nome;Cidade\n1;Ana;\n2;Bia;Recife\n");
  const complement = parseCsv("MCI;Nome;Cidade;Segmento\n1;Ana;Santos;A\n3;Caio;Manaus;B\n");

  const left = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "previous" });
  assert.deepEqual(left.dataset.columns, ["MCI", "Nome", "Cidade", "Segmento"]);
  assert.deepEqual(left.dataset.rows, [["1", "Ana", "Santos", "A"], ["2", "Bia", "Recife", ""]]);

  const mergeOnly = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "merge-only" });
  assert.deepEqual(mergeOnly.dataset.rows, [["1", "Ana", "Santos", "A"], ["3", "Caio", "Manaus", "B"]]);

  const summed = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "summed" });
  assert.deepEqual(summed.dataset.rows, [["1", "Ana", "Santos", "A"], ["2", "Bia", "Recife", ""], ["3", "Caio", "Manaus", "B"]]);
});

test("bd merge normalizes phone aliases and keeps one index column", () => {
  const previous = parseCsv("Fone;Nome\n(11) 9999-0000;Ana\n");
  const complement = parseCsv("Telefone;Cidade\n+55 11 9999-0000;Santos\n");
  const result = mergeDatasets(previous, complement, { mode: "summed" });

  assert.equal(result.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "Cidade"]);
  assert.deepEqual(result.dataset.rows, [["1199990000", "Ana", ""], ["551199990000", "", "Santos"]]);
});

test("bd merge blocks missing, multiple and conflicting index associations", () => {
  const noIndex = mergeDatasets(parseCsv("MCI;Nome\n1;Ana\n"), parseCsv("CID;Cidade\n1;Santos\n"), { identifierColumns: ["MCI", "CID"] });
  assert.equal(noIndex.issues.some(({ code }) => code === "invalid-common-index"), true);

  const multiple = mergeDatasets(parseCsv("MCI;Fone;Nome\n1;1111;Ana\n"), parseCsv("MCI;Telefone;Cidade\n1;1111;Santos\n"), { identifierColumns: ["MCI"] });
  assert.equal(multiple.issues.some(({ code }) => code === "invalid-common-index"), true);

  const conflict = mergeDatasets(parseCsv("MCI;Nome\n1;Ana\n"), parseCsv("MCI;Nome\n1;Bia\n"), { identifierColumns: ["MCI"] });
  assert.equal(conflict.issues.some(({ code }) => code === "merge-value-conflict"), true);
  assert.deepEqual(conflict.dataset.rows, [["1", "Ana"]]);
});

test("bd merge consolidates only exact duplicate rows and blocks distinct duplicate keys", () => {
  const previous = parseCsv("MCI;Nome\n1;Ana\n");
  const exact = mergeDatasets(previous, parseCsv("MCI;Cidade\n1;Santos\n1;Santos\n"), { identifierColumns: ["MCI"] });
  assert.equal(exact.issues.some(({ code, severity }) => code === "duplicate-merge-row" && severity === "warning"), true);
  assert.deepEqual(exact.dataset.rows, [["1", "Ana", "Santos"]]);

  const distinct = mergeDatasets(previous, parseCsv("MCI;Cidade\n1;Santos\n1;Recife\n"), { identifierColumns: ["MCI"] });
  assert.equal(distinct.issues.some(({ code, severity }) => code === "ambiguous-merge-key" && severity === "error"), true);
  assert.deepEqual(distinct.dataset, previous);
});

test("bd UI exposes optional file-backed merge and accessible exclusive policies", async () => {
  const [html, source] = await Promise.all([
    readFile("src/csv-bd/index.html", "utf8"),
    readFile("src/csv-bd/bd.ts", "utf8")
  ]);
  assert.match(html, /id="csv-merge"/);
  assert.match(html, /id="csv-merge-file"[^>]*type="file"/);
  assert.equal((html.match(/name="merge-mode"/g) ?? []).length, 3);
  assert.match(source, /mergeDatasets\(currentResult\.dataset, complement/);
  assert.match(source, /resultado prévio permaneceu inalterado/);
});
