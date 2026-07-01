"use strict";
(() => {
  // src/faturamento/regras.ts
  var currencyFormatter = new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" });
  var percentFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "percent"
  });
  function parseCurrencyToCents(value) {
    const raw = `${value ?? ""}`.trim();
    if (!raw) {
      return 0;
    }
    if (/^-/.test(raw) || /\(\s*R?\$?/.test(raw)) {
      return null;
    }
    const cleaned = raw.replace(/[^\d,.-]/g, "");
    const hasComma = cleaned.includes(",");
    const decimalSeparator = hasComma ? "," : cleaned.lastIndexOf(".") > -1 ? "." : "";
    let normalized = cleaned;
    if (decimalSeparator === ",") {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (decimalSeparator === ".") {
      const lastDot = cleaned.lastIndexOf(".");
      normalized = `${cleaned.slice(0, lastDot).replace(/\./g, "")}.${cleaned.slice(lastDot + 1)}`;
    }
    const parsed = Number.parseFloat(normalized.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return Math.round(parsed * 100);
  }
  function formatCurrencyFromCents(value) {
    return currencyFormatter.format(Math.max(0, Math.round(value)) / 100);
  }
  function parsePercent(value) {
    const raw = `${value ?? ""}`.trim();
    if (!raw) {
      return 0;
    }
    if (/^-/.test(raw)) {
      return null;
    }
    const normalized = raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return null;
    }
    return parsed;
  }
  function formatPercent(value) {
    return percentFormatter.format(Math.min(100, Math.max(0, value)) / 100);
  }
  function parseMesAno(value) {
    const match = /^(\d{1,2})\/(\d{4})$/.exec(`${value ?? ""}`.trim());
    if (!match) {
      return null;
    }
    const mes = Number.parseInt(match[1] ?? "", 10);
    const ano = Number.parseInt(match[2] ?? "", 10);
    if (mes < 1 || mes > 12 || ano < 1900 || ano > 2999) {
      return null;
    }
    return { ano, mes };
  }
  function formatMesAno(value) {
    return `${`${value.mes}`.padStart(2, "0")}/${value.ano}`;
  }
  function compareMesAno(left, right) {
    return left.ano * 12 + left.mes - (right.ano * 12 + right.mes);
  }
  function addMonths(value, amount) {
    const zeroBased = value.ano * 12 + (value.mes - 1) + amount;
    const ano = Math.floor(zeroBased / 12);
    const mes = zeroBased % 12 + 1;
    return { ano, mes };
  }
  function previousClosedMonth(date) {
    const candidate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return { ano: candidate.getFullYear(), mes: candidate.getMonth() + 1 };
  }
  function buildPeriod(reference, count = 12) {
    if (count < 1) {
      return [];
    }
    const start = addMonths(reference, -(count - 1));
    return Array.from({ length: count }, (_item, index) => addMonths(start, index));
  }
  function classifyMonth(month, reference) {
    return compareMesAno(month, reference) <= 0 ? "REALIZADO" : "PREVISTO";
  }
  function distributeCents(total, count = 12) {
    const normalizedTotal = Math.max(0, Math.round(total));
    if (count < 1) {
      return [];
    }
    if (normalizedTotal === 0) {
      return Array.from({ length: count }, () => 0);
    }
    const weights = Array.from({ length: count }, (_item, index) => {
      const trend = 0.86 + index * 0.025;
      const wave = [0.02, -0.035, 0.045, -0.025, 0.03, -0.015][index % 6] ?? 0;
      const late = index > count * 0.65 ? 0.035 : 0;
      return Math.max(0.1, trend + wave + late);
    });
    const weightTotal = weights.reduce((sum, item) => sum + item, 0);
    const exact = weights.map((weight) => normalizedTotal * weight / weightTotal);
    const cents = exact.map(Math.floor);
    let remainder = normalizedTotal - cents.reduce((sum, item) => sum + item, 0);
    const order = exact.map((value, index) => ({ fraction: value - Math.floor(value), index })).sort((left, right) => right.fraction - left.fraction);
    for (const item of order) {
      if (remainder <= 0) {
        break;
      }
      cents[item.index] = (cents[item.index] ?? 0) + 1;
      remainder -= 1;
    }
    return cents;
  }
  function sumRows(rows) {
    const totals = rows.reduce(
      (acc, row) => ({
        brutoAnual: acc.brutoAnual + row.vendasVista + row.vendasPrazo,
        prazo: acc.prazo + row.vendasPrazo,
        vista: acc.vista + row.vendasVista
      }),
      { brutoAnual: 0, prazo: 0, vista: 0 }
    );
    return {
      brutoAnual: Math.round(totals.brutoAnual),
      prazo: Math.round(totals.prazo),
      vista: Math.round(totals.vista)
    };
  }

  // src/faturamento/faturamento.ts
  (function bootstrapFaturamento(w) {
    "use strict";
    const documentos = w.JCEMDocumentos;
    if (!documentos) {
      w.alert("Infraestrutura documental indisponivel.");
      return;
    }
    const api = documentos;
    const pageConfig = {
      bottom: 0.9,
      left: 0.9,
      right: 0.9,
      size: [21, 29.7],
      top: 1,
      unit: "cm"
    };
    const ufs = /* @__PURE__ */ new Set([
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO"
    ]);
    const validation = {
      emptyFieldMessage: "Campo '${0}' vazio ou invalido",
      fieldRules: [
        { hint: "Raz\xE3o Social", required: true, selector: "#razao-social" },
        { hint: "CNPJ", required: true, selector: "#cnpj", validator: "cnpj" },
        { hint: "Cidade", required: true, selector: "#cidade" },
        { hint: "UF", required: true, selector: "#uf", validate: validateUf },
        { hint: "Data de Assinatura", required: true, selector: "#data-assinatura" },
        { hint: "M\xEAs/Ano de Refer\xEAncia", required: true, selector: "#mes-referencia", validate: validateMesAno },
        { hint: "Faturamento Bruto Anual", required: false, selector: "#faturamento-alvo", validate: validateCurrency },
        { hint: "Valor monet\xE1rio", required: false, selector: ".month-money", validate: validateCurrency },
        { hint: "Prazo m\xE9dio", required: true, selector: ".prazo-medio", validate: validateNonNegativeInteger },
        { hint: "Percentual", required: false, selector: ".percent", validate: validatePercentField },
        { hint: "Nome do assinante", required: true, selector: "#assinante-1-nome" },
        { hint: "CPF do assinante", required: true, selector: "#assinante-1-cpf", validator: "cpf" },
        { hint: "CPF do assinante", required: false, selector: "#assinante-2-cpf", validator: "cpf" },
        { hint: "CPF do assinante", required: false, selector: "#assinante-3-cpf", validator: "cpf" }
      ]
    };
    let currentReference = null;
    let isHydrating = false;
    function validateCurrency(value) {
      const parsed = parseCurrencyToCents(value);
      return parsed === null ? -1 : formatCurrencyFromCents(parsed);
    }
    function validatePercentField(value) {
      const parsed = parsePercent(value);
      return parsed === null ? -1 : formatPercent(parsed);
    }
    function validateMesAno(value) {
      const parsed = parseMesAno(value);
      return parsed ? formatMesAno(parsed) : -1;
    }
    function validateUf(value) {
      const normalized = value.trim().toUpperCase();
      return ufs.has(normalized) ? normalized : -1;
    }
    function validateNonNegativeInteger(value) {
      const normalized = value.trim();
      if (!/^\d+$/.test(normalized)) {
        return -1;
      }
      return `${Number.parseInt(normalized, 10)}`;
    }
    function input(id) {
      const element = api.one(`#${id}`);
      if (!element) {
        throw new Error(`Campo obrigatorio ausente: ${id}`);
      }
      return element;
    }
    function text(id, value) {
      const element = api.one(`#${id}`);
      if (element) {
        element.textContent = value;
      }
    }
    function todayIso() {
      const today = /* @__PURE__ */ new Date();
      const month = `${today.getMonth() + 1}`.padStart(2, "0");
      const day = `${today.getDate()}`.padStart(2, "0");
      return `${today.getFullYear()}-${month}-${day}`;
    }
    function dateFromInput(value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year = "0", month = "1", day = "1"] = value.split("-");
        return new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, Number.parseInt(day, 10));
      }
      return /* @__PURE__ */ new Date();
    }
    function formatDatePtBr(value) {
      const date = dateFromInput(value);
      const day = `${date.getDate()}`.padStart(2, "0");
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      return `${day}/${month}/${date.getFullYear()}`;
    }
    function defaultReference() {
      return previousClosedMonth(dateFromInput(input("data-assinatura").value || todayIso()));
    }
    function setValue(id, value) {
      const element = input(id);
      element.value = value;
      api.storage.setItem(id, value);
    }
    function normalizeDefaults() {
      if (!input("data-assinatura").value) {
        setValue("data-assinatura", todayIso());
      }
      if (!input("cidade").value) {
        setValue("cidade", "Pirassununga");
      }
      if (!input("uf").value) {
        setValue("uf", "SP");
      }
      if (!input("mes-referencia").value) {
        setValue("mes-referencia", formatMesAno(defaultReference()));
      }
      if (!input("assinante-1-papel").value) {
        setValue("assinante-1-papel", "PROPRIET\xC1RIO/S\xD3CIO/MANDAT\xC1RIO");
      }
    }
    function renderMonthRows(reference) {
      const editor = api.one("#editor-meses");
      const print = api.one("#print-meses");
      if (!editor || !print) {
        return;
      }
      const months = buildPeriod(reference);
      editor.innerHTML = "";
      print.innerHTML = "";
      months.forEach((month, index) => {
        const label = formatMesAno(month);
        const status = classifyMonth(month, reference);
        const editorRow = document.createElement("tr");
        editorRow.innerHTML = `
        <td class="month-label" data-month="${label}">${label}</td>
        <td><input id="mes-${index}-vista" class="money month-money" data-column="vista" type="text" inputmode="decimal"></td>
        <td><input id="mes-${index}-prazo" class="money month-money" data-column="prazo" data-locked="true" type="text" inputmode="decimal"></td>
        <td><input id="mes-${index}-prazo-medio" class="prazo-medio" type="text" inputmode="numeric" value="30"></td>
        <td class="month-status">${status}</td>
      `;
        editor.appendChild(editorRow);
        const printRow = document.createElement("tr");
        printRow.innerHTML = `
        <td data-print-month="${index}">${label}</td>
        <td data-print-vista="${index}">R$ 0,00</td>
        <td data-print-prazo="${index}">R$ 0,00</td>
        <td data-print-prazo-medio="${index}">30</td>
        <td data-print-status="${index}">${status}</td>
      `;
        print.appendChild(printRow);
      });
    }
    function monthRows() {
      const reference = parseMesAno(input("mes-referencia").value) ?? defaultReference();
      return api.$("#editor-meses tr").map((row) => {
        const monthText = row.querySelector("[data-month]")?.dataset.month ?? formatMesAno(reference);
        const mesAno = parseMesAno(monthText) ?? reference;
        const vista = parseCurrencyToCents(row.querySelector('[data-column="vista"]')?.value ?? "") ?? 0;
        const prazo = parseCurrencyToCents(row.querySelector('[data-column="prazo"]')?.value ?? "") ?? 0;
        const prazoMedio = Number.parseInt(row.querySelector(".prazo-medio")?.value || "30", 10);
        return {
          mesAno,
          prazoMedio: Number.isFinite(prazoMedio) && prazoMedio >= 0 ? prazoMedio : 0,
          situacao: classifyMonth(mesAno, reference),
          vendasPrazo: prazo,
          vendasVista: vista
        };
      });
    }
    function joinedValues(ids, prefix = "") {
      const values = ids.map((id) => input(id).value.trim()).filter((value) => value.length > 0);
      return values.length > 0 ? `${prefix}${values.join(" ou ")}` : "";
    }
    function primaryRole() {
      const roles = ["assinante-1-papel", "assinante-2-papel", "assinante-3-papel"].map((id) => input(id).value.trim()).filter((value) => value.length > 0);
      return roles[0] ?? "";
    }
    function renderPreview() {
      const rows = monthRows();
      const totals = sumRows(rows);
      const reference = parseMesAno(input("mes-referencia").value) ?? defaultReference();
      const city = input("cidade").value.trim() || "Pirassununga";
      const uf = input("uf").value.trim().toUpperCase() || "SP";
      text("print-razao-social", input("razao-social").value);
      text("print-cnpj", input("cnpj").value);
      text("print-faturamento-anual", formatCurrencyFromCents(totals.brutoAnual));
      text("print-mes-referencia", formatMesAno(reference));
      text("print-total-vista", formatCurrencyFromCents(totals.vista));
      text("print-total-prazo", formatCurrencyFromCents(totals.prazo));
      text("print-cartoes", input("percentual-cartoes").value);
      text("print-cheques", input("percentual-cheques").value);
      text("print-titulos", input("percentual-titulos").value);
      text("print-regime", input("regime-tributacao").value);
      text("print-cidade-uf", `${city}-${uf}`);
      text("print-data", formatDatePtBr(input("data-assinatura").value));
      text("print-assinantes", joinedValues(["assinante-1-nome", "assinante-2-nome", "assinante-3-nome"]));
      text("print-papel", primaryRole());
      text("print-cpfs", joinedValues(["assinante-1-cpf", "assinante-2-cpf", "assinante-3-cpf"], "CPF: "));
      text("print-comite", input("comite").value);
      rows.forEach((row, index) => {
        textBySelector(`[data-print-month="${index}"]`, formatMesAno(row.mesAno));
        textBySelector(`[data-print-vista="${index}"]`, formatCurrencyFromCents(row.vendasVista));
        textBySelector(`[data-print-prazo="${index}"]`, formatCurrencyFromCents(row.vendasPrazo));
        textBySelector(`[data-print-prazo-medio="${index}"]`, `${row.prazoMedio}`);
        textBySelector(`[data-print-status="${index}"]`, row.situacao);
      });
    }
    function textBySelector(selector, value) {
      const element = api.one(selector);
      if (element) {
        element.textContent = value;
      }
    }
    function refreshPeriodIfNeeded() {
      const reference = parseMesAno(input("mes-referencia").value) ?? defaultReference();
      if (currentReference && compareMesAno(currentReference, reference) === 0) {
        renderPreview();
        return;
      }
      currentReference = reference;
      renderMonthRows(reference);
      api.autosave.init({ selector: "#editor-meses input", validation });
      ensureDefaultMonthlyValues();
      bindDynamicInputs();
      renderPreview();
    }
    function ensureDefaultMonthlyValues() {
      api.$(".prazo-medio").forEach((element) => {
        if (!element.value) {
          element.value = "30";
        }
      });
    }
    function distributeAnnual() {
      const target = parseCurrencyToCents(input("faturamento-alvo").value);
      const status = api.one("#status-faturamento");
      if (target === null || target <= 0) {
        if (status) {
          status.textContent = "Informe um faturamento anual v\xE1lido para distribuir.";
        }
        return;
      }
      const values = distributeCents(target, 12);
      isHydrating = true;
      values.forEach((value, index) => {
        const vista = input(`mes-${index}-vista`);
        const prazo = input(`mes-${index}-prazo`);
        vista.value = formatCurrencyFromCents(value);
        prazo.value = formatCurrencyFromCents(0);
        delete vista.dataset.locked;
        prazo.dataset.locked = "true";
        api.storage.setItem(vista.id, vista.value);
        api.storage.setItem(prazo.id, prazo.value);
      });
      isHydrating = false;
      if (status) {
        status.textContent = "";
      }
      renderPreview();
    }
    function normalizeMonthlyInput(element) {
      const result = validateCurrency(element.value);
      if (typeof result === "string") {
        element.value = result;
        api.storage.setItem(element.id, element.value);
      }
    }
    function sumMoneyInputs(inputs) {
      return inputs.reduce((sum, element) => sum + (parseCurrencyToCents(element.value) ?? 0), 0);
    }
    function reconcileAnnual(changed) {
      const target = parseCurrencyToCents(input("faturamento-alvo").value);
      const status = api.one("#status-faturamento");
      if (target === null || target <= 0) {
        if (status) {
          status.textContent = "";
        }
        return;
      }
      changed.dataset.locked = "true";
      const inputs = api.$(".month-money");
      const locked = inputs.filter((element) => element.dataset.locked === "true");
      const unlocked = inputs.filter((element) => element.dataset.locked !== "true");
      const lockedTotal = sumMoneyInputs(locked);
      if (lockedTotal > target) {
        if (status) {
          status.textContent = "Valores bloqueados superam o faturamento anual informado.";
        }
        return;
      }
      if (unlocked.length === 0) {
        if (status && lockedTotal !== target) {
          status.textContent = "Todos os valores mensais est\xE3o bloqueados; ajuste algum m\xEAs para reconciliar o total.";
        }
        return;
      }
      const values = distributeCents(target - lockedTotal, unlocked.length);
      isHydrating = true;
      unlocked.forEach((element, index) => {
        element.value = formatCurrencyFromCents(values[index] ?? 0);
        api.storage.setItem(element.id, element.value);
      });
      isHydrating = false;
      if (status) {
        status.textContent = "";
      }
    }
    function bindDynamicInputs() {
      api.$("#editor-meses input").forEach((element) => {
        api.on(element, "input", () => {
          if (!isHydrating) {
            renderPreview();
          }
        });
        api.on(element, "blur", () => {
          if (element.classList.contains("month-money")) {
            normalizeMonthlyInput(element);
            reconcileAnnual(element);
          }
          renderPreview();
        });
      });
    }
    function clearForm() {
      if (!w.confirm("Limpar dados salvos deste formul\xE1rio?")) {
        return;
      }
      api.$("#faturamento-app input").forEach((element) => {
        api.storage.removeItem(element.id);
        element.value = "";
      });
      normalizeDefaults();
      refreshPeriodIfNeeded();
      renderPreview();
    }
    function payload() {
      return {
        assinantes: [1, 2, 3].map((index) => ({
          cpf: input(`assinante-${index}-cpf`).value,
          nome: input(`assinante-${index}-nome`).value,
          papel: input(`assinante-${index}-papel`).value
        })),
        cidade: input("cidade").value,
        cnpj: input("cnpj").value,
        comite: input("comite").value,
        dataAssinatura: input("data-assinatura").value,
        faturamentoBrutoAnual: input("faturamento-alvo").value,
        meses: monthRows().map((row, index) => ({
          mesAno: formatMesAno(row.mesAno),
          prazoMedio: row.prazoMedio,
          vendasPrazo: input(`mes-${index}-prazo`).value,
          vendasVista: input(`mes-${index}-vista`).value
        })),
        mesReferencia: input("mes-referencia").value,
        percentuais: {
          cartoes: input("percentual-cartoes").value,
          cheques: input("percentual-cheques").value,
          titulos: input("percentual-titulos").value
        },
        razaoSocial: input("razao-social").value,
        regimeTributacao: input("regime-tributacao").value,
        uf: input("uf").value
      };
    }
    function shareUrl() {
      const url = `${w.location.origin}${w.location.pathname}?data=${api.base64.encode(JSON.stringify(payload()))}`;
      void api.clipboard.copy(url).then(() => {
        w.alert("Endereco da relacao preenchida copiado para a area de transferencia.");
      });
    }
    function assignIfPresent(id, value) {
      if (typeof value !== "string" && typeof value !== "number") {
        return;
      }
      const element = api.one(`#${id}`);
      if (!element) {
        return;
      }
      element.value = `${value}`;
      api.storage.setItem(element.id, element.value);
    }
    function applyJsonPayload() {
      const data = api.query.json();
      if (!data) {
        return;
      }
      assignIfPresent("razao-social", data.razaoSocial ?? data.empresa ?? data.nomeEmpresa);
      assignIfPresent("cnpj", data.cnpj);
      assignIfPresent("cidade", data.cidade);
      assignIfPresent("uf", data.uf);
      assignIfPresent("data-assinatura", data.dataAssinatura);
      assignIfPresent("mes-referencia", data.mesReferencia);
      assignIfPresent("faturamento-alvo", data.faturamentoBrutoAnual);
      assignIfPresent("regime-tributacao", data.regimeTributacao);
      assignIfPresent("comite", data.comite);
      if (isRecord(data.percentuais)) {
        assignIfPresent("percentual-cartoes", data.percentuais.cartoes);
        assignIfPresent("percentual-cheques", data.percentuais.cheques);
        assignIfPresent("percentual-titulos", data.percentuais.titulos);
      }
      if (Array.isArray(data.assinantes)) {
        data.assinantes.slice(0, 3).forEach((item, index) => {
          if (!isRecord(item)) {
            return;
          }
          const number = index + 1;
          assignIfPresent(`assinante-${number}-nome`, item.nome);
          assignIfPresent(`assinante-${number}-cpf`, item.cpf);
          assignIfPresent(`assinante-${number}-papel`, item.papel);
        });
      }
      refreshPeriodIfNeeded();
      if (Array.isArray(data.meses)) {
        data.meses.slice(0, 12).forEach((item, index) => {
          if (!isRecord(item)) {
            return;
          }
          assignIfPresent(`mes-${index}-vista`, item.vendasVista);
          assignIfPresent(`mes-${index}-prazo`, item.vendasPrazo);
          assignIfPresent(`mes-${index}-prazo-medio`, item.prazoMedio);
        });
      }
    }
    function isRecord(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }
    function filename() {
      const company = input("razao-social").value.trim() || "Relacao de Faturamento";
      return `${company}.pdf`;
    }
    function printPdf() {
      refreshPeriodIfNeeded();
      if (!api.validate.all({ selector: "#faturamento-app input", validation })) {
        return;
      }
      api.print.pdf({
        filename,
        pageConfig,
        source: inputDocument()
      });
    }
    function inputDocument() {
      return api.one("#documento-faturamento") ?? document.documentElement;
    }
    function bindStaticInputs() {
      api.$("#faturamento-app input").forEach((element) => {
        api.on(element, "input", () => {
          if (element.id === "mes-referencia") {
            return;
          }
          renderPreview();
        });
        api.on(element, "blur", () => {
          if (element.id === "mes-referencia" || element.id === "data-assinatura") {
            refreshPeriodIfNeeded();
            return;
          }
          renderPreview();
        });
      });
    }
    api.ready(() => {
      api.print.createPageStyle(pageConfig);
      api.autosave.indicator(".autosave");
      renderMonthRows(defaultReference());
      api.autosave.init({ selector: "#faturamento-app input", validation });
      normalizeDefaults();
      applyJsonPayload();
      refreshPeriodIfNeeded();
      bindStaticInputs();
      api.toolbar.bind({
        ".browser-print": () => w.print(),
        ".clear-form": clearForm,
        ".pdf.print": printPdf,
        ".share-url": shareUrl
      });
      const distribute = api.one("#distribuir-faturamento");
      api.on(distribute, "click", distributeAnnual);
      renderPreview();
    });
  })(window);
})();
