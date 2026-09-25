import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  analyzeSimilarRows,
  combinationStrategies,
  combineDatasets,
  convertDataset,
  defaultSimilarityThreshold,
  eligibleCombinationColumns,
  eligibleSimilarityColumns,
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
  const complement = parseCsv("Telefone;Cidade\n11 9999 0000;Santos\n+55 11 9999-0000;Brasilia\n");
  const result = mergeDatasets(previous, complement, { mode: "summed" });

  assert.equal(result.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(result.dataset.columns, ["Fone", "Nome", "Cidade"]);
  assert.deepEqual(result.dataset.rows, [["1199990000", "Ana", "Santos"], ["551199990000", "", "Brasilia"]]);
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

test("bd merge consolidates only exact canonical rows and preserves distinct rows with the same key", () => {
  const previous = parseCsv("MCI;Nome\n1;Ana\n");
  const exact = mergeDatasets(previous, parseCsv("MCI;Cidade\n1;Santos\n(1);Santos\n"), { identifierColumns: ["MCI"] });
  assert.equal(exact.issues.some(({ code, severity }) => code === "duplicate-merge-row" && severity === "warning"), true);
  assert.deepEqual(exact.dataset.rows, [["1", "Ana", "Santos"]]);

  const distinct = mergeDatasets(previous, parseCsv("MCI;Cidade\n1;Santos\n1;Recife\n"), { identifierColumns: ["MCI"] });
  assert.equal(distinct.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(distinct.dataset.rows, [["1", "Ana", "Santos"], ["1", "Ana", "Recife"]]);
});

test("bd merge preserves 1:N, N:1 and N:N relations in all row policies", () => {
  const previous = parseCsv([
    "MCI;Pessoa",
    "1;Ana",
    "2;Bia",
    "2;Bruna",
    "3;Caio",
    "3;Cris"
  ].join("\n"));
  const complement = parseCsv([
    "MCI;Cidade",
    "1;Santos",
    "1;Recife",
    "2;Manaus",
    "3;Salvador",
    "3;Belem",
    "4;Natal"
  ].join("\n"));

  const left = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "previous" });
  assert.equal(left.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(left.dataset.rows, [
    ["1", "Ana", "Santos"],
    ["1", "Ana", "Recife"],
    ["2", "Bia", "Manaus"],
    ["2", "Bruna", "Manaus"],
    ["3", "Caio", "Salvador"],
    ["3", "Caio", "Belem"],
    ["3", "Cris", "Salvador"],
    ["3", "Cris", "Belem"]
  ]);

  const mergeOnly = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "merge-only" });
  assert.equal(mergeOnly.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(mergeOnly.dataset.rows, [
    ["1", "Ana", "Santos"],
    ["1", "Ana", "Recife"],
    ["2", "Bia", "Manaus"],
    ["2", "Bruna", "Manaus"],
    ["3", "Caio", "Salvador"],
    ["3", "Cris", "Salvador"],
    ["3", "Caio", "Belem"],
    ["3", "Cris", "Belem"],
    ["4", "", "Natal"]
  ]);

  const summed = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "summed" });
  assert.equal(summed.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(summed.dataset.rows, [...left.dataset.rows, ["4", "", "Natal"]]);
});

test("bd merge normalizes generic indexers bilaterally without crossing distinct keys", () => {
  const previous = parseCsv("MCI;Nome\n12.345-6;Ana\nAB (12);Bia\nA-1;Caio\n");
  const complement = parseCsv("MCI;Cidade\n12 345 6;Santos\nab-12;Recife\nA 11;Manaus\n");
  const result = mergeDatasets(previous, complement, { identifierColumns: ["MCI"], mode: "summed" });

  assert.equal(result.issues.some(({ severity }) => severity === "error"), false);
  assert.deepEqual(result.dataset.rows, [
    ["123456", "Ana", "Santos"],
    ["ab12", "Bia", "Recife"],
    ["a1", "Caio", ""],
    ["a11", "", "Manaus"]
  ]);
});

test("bd merge retains unrelated blockers", () => {
  const invalid = mergeDatasets(parseCsv("MCI;Nome\n();Ana\n"), parseCsv("MCI;Cidade\n1;Santos\n"), { identifierColumns: ["MCI"] });
  assert.equal(invalid.issues.some(({ code, severity }) => code === "invalid-merge-key" && severity === "error"), true);
});

test("bd combines three files deterministically with every keyed strategy", () => {
  const first = parseCsv("ID;Nome\n1;Ana\n2;Bia\n");
  const second = parseCsv("ID;Cidade\n1;Santos\n3;Recife\n");
  const third = parseCsv("ID;Status\n1;Ativo\n4;Novo\n");
  const datasets = [first, second, third];
  const names = ["clientes.csv", "cidades.csv", "status.csv"];

  assert.deepEqual(eligibleCombinationColumns(datasets), ["ID"]);
  assert.deepEqual(combinationStrategies.map(({ value }) => value), ["left", "right", "inner", "full", "append"]);
  const left = combineDatasets(datasets, { keyColumn: "ID", sourceNames: names, strategy: "left" });
  assert.deepEqual(left.dataset.rows, [["1", "Ana", "Santos", "Ativo"], ["2", "Bia", "", ""]]);
  const right = combineDatasets(datasets, { keyColumn: "ID", sourceNames: names, strategy: "right" });
  assert.deepEqual(right.dataset.rows, [["1", "Ana", "Santos", "Ativo"], ["4", "", "", "Novo"]]);
  const inner = combineDatasets(datasets, { keyColumn: "ID", sourceNames: names, strategy: "inner" });
  assert.deepEqual(inner.dataset.rows, [["1", "Ana", "Santos", "Ativo"]]);
  const full = combineDatasets(datasets, { keyColumn: "ID", sourceNames: names, strategy: "full" });
  assert.deepEqual(full.dataset.rows, [
    ["1", "Ana", "Santos", "Ativo"],
    ["2", "Bia", "", ""],
    ["3", "", "Recife", ""],
    ["4", "", "", "Novo"]
  ]);
  assert.deepEqual(full.sourceNames, names);
  assert.equal(full.steps.length, 2);
});

test("bd append preserves schema order and consolidates only exact final vectors", () => {
  const first = parseCsv("ID;Nome\n1;Ana\n");
  const second = parseCsv("ID;Cidade\n2;Santos\n");
  const third = parseCsv("Cidade\nRecife\nRecife\n");
  const result = combineDatasets([first, second, third], { strategy: "append" });

  assert.deepEqual(result.dataset.columns, ["ID", "Nome", "Cidade"]);
  assert.deepEqual(result.dataset.rows, [["1", "Ana", ""], ["2", "", "Santos"], ["", "", "Recife"]]);
  assert.equal(result.issues.some(({ code }) => code === "duplicate-append-row"), true);
});

test("bd keyed combination requires one confirmed common field and reports traceable conflicts", () => {
  const first = parseCsv("ID;Nome\n1;Ana\n");
  const second = parseCsv("ID;Nome\n(1);Bia\n");
  const missing = combineDatasets([first, second], { strategy: "full" });
  assert.equal(missing.issues.some(({ code }) => code === "missing-combination-key"), true);

  const conflict = combineDatasets([first, second], { keyColumn: "ID", sourceNames: ["a.csv", "b.csv"], strategy: "full" });
  assert.equal(conflict.issues.some(({ message }) => /a\.csv, linha 2.*b\.csv, linha 2/.test(message)), true);
  assert.deepEqual(conflict.dataset.rows, [["1", "Ana"]]);
});

test("bd keyed combination preserves duplicate cardinalities and blocks an absent field", () => {
  const first = parseCsv("ID;Pessoa\n1;Ana\n1;Bia\n");
  const second = parseCsv("ID;Cidade\n(1);Santos\n1;Recife\n");
  const result = combineDatasets([first, second], { keyColumn: "ID", strategy: "inner" });
  assert.deepEqual(result.dataset.rows, [
    ["1", "Ana", "Santos"], ["1", "Ana", "Recife"],
    ["1", "Bia", "Santos"], ["1", "Bia", "Recife"]
  ]);
  const invalid = combineDatasets([first, parseCsv("Codigo;Cidade\n1;Santos\n")], { keyColumn: "ID", strategy: "left" });
  assert.equal(invalid.issues.some(({ code }) => code === "invalid-combination-key"), true);
});

test("bd detects probable duplicates deterministically without mutating the dataset", () => {
  const dataset = parseCsv([
    "MCI;Nome;Cidade;Data",
    "1;João da Silva;São Paulo;01/01/2026",
    "2;Joao da Silv;Sao-Paulo;02/01/2026",
    "3;Joana Silva;Recife;03/01/2026",
    "4;;Sao Paulo;04/01/2026"
  ].join("\n"));
  const before = structuredClone(dataset);

  assert.equal(defaultSimilarityThreshold, 0.9);
  assert.deepEqual(eligibleSimilarityColumns(dataset, ["MCI"]), ["Nome", "Cidade"]);
  const analysis = analyzeSimilarRows(dataset, ["Nome", "Cidade"]);

  assert.deepEqual(dataset, before);
  assert.equal(analysis.totalPairs, 6);
  assert.deepEqual(analysis.pairs.map(({ leftRow, rightRow }) => [leftRow, rightRow]), [[2, 3]]);
  assert.equal(analysis.pairs[0]?.fields[0]?.leftNormalized, "joao da silva");
  assert.equal(analysis.pairs[0]?.fields[0]?.distance, 1);
  assert.equal(analysis.pairs[0]?.score >= analysis.threshold, true);
});

test("bd similarity skips exact normalized vectors and validates eligibility and limits", () => {
  const dataset = parseCsv("MCI;Nome;Cidade\n1;Ágata;São Paulo\n2;agata;Sao-Paulo\n3;Agatha;Sao Paulo\n");
  const result = analyzeSimilarRows(dataset, ["Nome", "Cidade"], { threshold: 0.8 });
  assert.deepEqual(result.pairs.map(({ leftRow, rightRow }) => [leftRow, rightRow]), [[2, 4], [3, 4]]);
  assert.throws(() => analyzeSimilarRows(dataset, ["MCI"]), /inelegível/);
  assert.throws(() => analyzeSimilarRows(dataset, ["Nome"], { maxPairs: 2 }), /excede o limite/);
  assert.throws(() => analyzeSimilarRows(dataset, ["Nome", "Cidade", "Nome", "Outra"]), /inelegível/);
});

test("bd UI exposes three accessible operations and contextual combination controls", async () => {
  const [html, source, styles] = await Promise.all([
    readFile("src/csv-bd/index.html", "utf8"),
    readFile("src/csv-bd/bd.ts", "utf8"),
    readFile("src/csv-bd/bd.scss", "utf8")
  ]);
  assert.match(html, /id="csv-merge"/);
  assert.match(html, /id="csv-merge-file"[^>]*type="file"[^>]*multiple/);
  assert.equal((html.match(/name="operation"/g) ?? []).length, 3);
  assert.match(html, /O que deseja fazer\?/);
  assert.match(html, /Somente converter/);
  assert.match(html, /Converter e combinar arquivos/);
  assert.match(html, /Somente combinar arquivos/);
  assert.match(source, /combineDatasets\(datasets/);
  assert.match(source, /renderStrategies\(\)/);
  assert.match(styles, /:has\(#operation-convert:checked\) \.combination-group/);
  assert.match(styles, /combination-strategy.*append.*\.key-group/);
});

test("bd UI requires opt-in and explicit textual columns for the advisory similarity report", async () => {
  const [html, source, config] = await Promise.all([
    readFile("src/csv-bd/index.html", "utf8"),
    readFile("src/csv-bd/bd.ts", "utf8"),
    readFile("src/assets/config/tabular.json", "utf8")
  ]);
  assert.match(html, /id="similarity-enabled"[^>]*type="checkbox"/);
  assert.match(html, /id="similarity-columns"[^>]*multiple/);
  assert.match(html, /falsos positivos e falsos negativos/);
  assert.match(source, /analyzeSimilarRows\(currentResult\.dataset, columns\)/);
  assert.equal(JSON.parse(config).similarity.defaultThreshold, 0.9);
});
