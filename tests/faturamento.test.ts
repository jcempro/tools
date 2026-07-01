import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPeriod,
  classifyMonth,
  distributeCents,
  formatMesAno,
  isRegimeAllowed,
  MEI_LIMIT_CENTS,
  parseCurrencyToCents,
  parseMesAno,
  SIMPLES_NACIONAL_LIMIT_CENTS,
  splitAnnualTargets,
  sumRows,
  type LinhaFaturamento
} from "../src/faturamento/regras";

test("faturamento builds exactly twelve consecutive months ending at reference", () => {
  const reference = parseMesAno("05/2026");
  assert.ok(reference);

  const period = buildPeriod(reference);

  assert.equal(period.length, 12);
  assert.equal(formatMesAno(period[0]!), "06/2025");
  assert.equal(formatMesAno(period[11]!), "05/2026");
});

test("faturamento classifies months from reference", () => {
  const reference = parseMesAno("05/2026");
  const before = parseMesAno("04/2026");
  const same = parseMesAno("05/2026");
  const after = parseMesAno("06/2026");

  assert.ok(reference);
  assert.ok(before);
  assert.ok(same);
  assert.ok(after);
  assert.equal(classifyMonth(before, reference), "REALIZADO");
  assert.equal(classifyMonth(same, reference), "REALIZADO");
  assert.equal(classifyMonth(after, reference), "PREVISTO");
});

test("faturamento distribution is deterministic and reconciles cents", () => {
  const first = distributeCents(674_784_44, 12);
  const second = distributeCents(674_784_44, 12);

  assert.deepEqual(first, second);
  assert.equal(first.reduce((sum, value) => sum + value, 0), 674_784_44);
  assert.equal(new Set(first).size > 1, true);
});

test("faturamento parses brazilian currency and rejects negatives", () => {
  assert.equal(parseCurrencyToCents("R$ 1.234,56"), 123_456);
  assert.equal(parseCurrencyToCents("1234.56"), 123_456);
  assert.equal(parseCurrencyToCents("-1,00"), null);
});

test("faturamento totals add vista and prazo columns", () => {
  const month = parseMesAno("05/2026");
  assert.ok(month);

  const rows: LinhaFaturamento[] = [
    { mesAno: month, prazoMedio: 30, situacao: "REALIZADO", vendasPrazo: 500, vendasVista: 1000 },
    { mesAno: month, prazoMedio: 30, situacao: "REALIZADO", vendasPrazo: 700, vendasVista: 300 }
  ];

  assert.deepEqual(sumRows(rows), {
    brutoAnual: 2500,
    prazo: 1200,
    vista: 1300
  });
});

test("faturamento splits annual target between vista and prazo", () => {
  assert.deepEqual(splitAnnualTargets(100_00, 100), { prazo: 0, vista: 100_00 });
  assert.deepEqual(splitAnnualTargets(100_00, 70), { prazo: 30_00, vista: 70_00 });
  assert.deepEqual(splitAnnualTargets(101_00, 50), { prazo: 50_50, vista: 50_50 });
});

test("faturamento blocks tax regimes above configured annual limits", () => {
  assert.equal(isRegimeAllowed("MEI", MEI_LIMIT_CENTS), true);
  assert.equal(isRegimeAllowed("MEI", MEI_LIMIT_CENTS + 1), false);
  assert.equal(isRegimeAllowed("Simples Nacional", SIMPLES_NACIONAL_LIMIT_CENTS), true);
  assert.equal(isRegimeAllowed("Simples Nacional", SIMPLES_NACIONAL_LIMIT_CENTS + 1), false);
  assert.equal(isRegimeAllowed("Lucro Presumido", SIMPLES_NACIONAL_LIMIT_CENTS + 1), true);
});
