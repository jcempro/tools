import {
  analyzeSimilarRows,
  convertDataset,
  decodeTextBuffer,
  eligibleSimilarityColumns,
  inferModelKind,
  mergeDatasets,
  oppositeModel,
  parseCsv,
  serializeCsv,
  type ConversionIssue,
  type ConversionResult,
  type DatasetMergeMode,
  type NameDecision,
  type TabularDataset,
  type TabularModelKind
} from "../assets/js/tabular";

(function bootstrapBd(w: Window, d: Document): void {
  "use strict";

  const inferenceDelayMs = 350;
  const maxHeaderScanChars = 128 * 1024;
  let sourceDataset: TabularDataset | null = null;
  let currentResult: ConversionResult | null = null;
  let inferenceTimer = 0;
  let inferenceRun = 0;
  const nameDecisions: Record<string, string> = {};

  function one<T extends Element = Element>(selector: string): T {
    const element = d.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Elemento obrigatorio ausente: ${selector}`);
    }
    return element;
  }

  function ready(handler: () => void): void {
    if (d.readyState === "loading") {
      d.addEventListener("DOMContentLoaded", handler);
      return;
    }
    handler();
  }

  function input(selector: string): HTMLInputElement {
    return one<HTMLInputElement>(selector);
  }

  function textarea(selector: string): HTMLTextAreaElement {
    return one<HTMLTextAreaElement>(selector);
  }

  function select(selector: string): HTMLSelectElement {
    return one<HTMLSelectElement>(selector);
  }

  function button(selector: string): HTMLButtonElement {
    return one<HTMLButtonElement>(selector);
  }

  function identifiers(): string[] {
    const values = input("#identifier-columns").value.split(",").map((value) => value.trim()).filter(Boolean);
    return values.length > 0 ? values : ["MCI", "CID", "MGI"];
  }

  function log(message: string, severity: ConversionIssue["severity"] = "info"): void {
    const item = d.createElement("li");
    item.className = severity;
    item.textContent = `[${new Date().toLocaleTimeString("pt-BR")}] ${message}`;
    one<HTMLOListElement>("#logs").appendChild(item);
    item.scrollIntoView({ block: "nearest" });
  }

  function clearLogs(): void {
    one<HTMLOListElement>("#logs").innerHTML = "";
  }

  function setOutput(value: string): void {
    textarea("#csv-output").value = value;
    button("#download").disabled = value.length === 0;
  }

  function updateSummary(source: string, target: string, dataset: TabularDataset | null): void {
    const cells = Array.from(one<HTMLElement>("#summary").querySelectorAll("span"));
    const values = [
      source,
      target,
      `${dataset?.rows.length ?? 0}`,
      `${dataset?.columns.length ?? 0}`
    ];

    cells.forEach((cell, index) => {
      cell.textContent = values[index] ?? "-";
    });
  }

  function updateDirection(from: TabularModelKind, to = oppositeModel(from)): void {
    select("#source-model").value = from;
    select("#target-model").value = to;
  }

  function readSourceText(): string {
    return textarea("#csv-text").value.trim();
  }

  function mergeMode(): DatasetMergeMode {
    return one<HTMLInputElement>('input[name="merge-mode"]:checked').value as DatasetMergeMode;
  }

  function invalidateResult(): void {
    currentResult = null;
    setOutput("");
    hideDecisions();
    invalidateSimilarityReport();
  }

  function parseSource(): TabularDataset | null {
    const text = readSourceText();
    if (!text) {
      log("Nenhum CSV informado.", "error");
      return null;
    }

    try {
      const dataset = parseCsv(text);
      if (dataset.columns.length === 0) {
        log("CSV sem cabecalho identificavel.", "error");
        return null;
      }
      log(`CSV carregado: ${dataset.rows.length} linhas, ${dataset.columns.length} colunas, separador "${labelDelimiter(dataset.dialect.delimiter)}".`);
      return dataset;
    } catch (error) {
      log(error instanceof Error ? error.message : "Falha ao interpretar CSV.", "error");
      return null;
    }
  }

  function convert(): void {
    cancelPendingInference();
    clearLogs();
    setOutput("");
    hideDecisions();
    log("Inicio da conversao.");

    sourceDataset = parseSource();
    if (!sourceDataset) {
      updateSummary("-", "-", null);
      return;
    }

    const from = inferModelKind(sourceDataset);
    const to = oppositeModel(from);
    updateDirection(from, to);
    log(`Modelo de origem inferido: ${modelLabel(from)}. Saida definida automaticamente: ${modelLabel(to)}.`);
    currentResult = convertDataset(sourceDataset, from, to, {
      identifierColumns: identifiers(),
      nameDecisions
    });

    for (const issue of currentResult.issues) {
      log(issue.message, issue.severity);
    }

    if (currentResult.issues.some((issue) => issue.severity === "error")) {
      setOutput("");
      updateSummary(from, to, null);
      log("Conversao interrompida por erro recuperavel.", "error");
      return;
    }

    if (currentResult.pendingNameDecisions.length > 0) {
      renderDecisions(currentResult.pendingNameDecisions);
      log("Existem divergencias de nome aguardando revisao do usuario.", "decision");
      setOutput("");
      updateSummary(from, to, null);
      log("Confirme os nomes canonicos antes de gerar o CSV final.", "decision");
      return;
    }

    const mergeText = textarea("#csv-merge").value.trim();
    if (mergeText) {
      let complement: TabularDataset;
      try {
        complement = parseCsv(mergeText);
      } catch (error) {
        log(error instanceof Error ? error.message : "Falha ao interpretar o CSV complementar.", "error");
        setOutput("");
        updateSummary(from, to, null);
        return;
      }
      if (complement.columns.length === 0) {
        log("CSV complementar sem cabecalho identificavel.", "error");
        setOutput("");
        updateSummary(from, to, null);
        return;
      }
      log(`Mesclagem iniciada no modo ${mergeModeLabel(mergeMode())}: ${complement.rows.length} linhas complementares.`);
      const merged = mergeDatasets(currentResult.dataset, complement, { identifierColumns: identifiers(), mode: mergeMode() });
      merged.issues.forEach((issue) => log(issue.message, issue.severity));
      if (merged.issues.some(({ severity }) => severity === "error")) {
        setOutput("");
        updateSummary(from, to, null);
        log("Mesclagem bloqueada; o resultado prévio permaneceu inalterado.", "error");
        return;
      }
      currentResult = { ...currentResult, dataset: merged.dataset, issues: [...currentResult.issues, ...merged.issues] };
      log(`Mesclagem concluída pelo indexador ${merged.indexColumn ?? "comum"}.`);
    }

    const csv = serializeCsv(currentResult.dataset);
    setOutput(csv);
    updateSummary(from, to, currentResult.dataset);
    populateSimilarityColumns(currentResult.dataset);
    log(`Conclusao: ${currentResult.dataset.rows.length} linhas exportaveis em UTF-8 com BOM.`);
  }

  function invalidateSimilarityReport(): void {
    const report = one<HTMLElement>("#similarity-report");
    report.hidden = true;
    report.replaceChildren();
  }

  function populateSimilarityColumns(dataset: TabularDataset | null): void {
    const chooser = select("#similarity-columns");
    const previous = new Set(Array.from(chooser.selectedOptions, (option) => option.value));
    chooser.replaceChildren();
    for (const column of dataset ? eligibleSimilarityColumns(dataset, identifiers()) : []) {
      const option = d.createElement("option");
      option.value = column;
      option.textContent = column;
      option.selected = previous.has(column);
      chooser.appendChild(option);
    }
    syncSimilarityControls();
  }

  function syncSimilarityControls(): void {
    const enabled = input("#similarity-enabled").checked;
    const chooser = select("#similarity-columns");
    chooser.disabled = !enabled || !currentResult || chooser.options.length === 0;
    button("#analyze-similarity").disabled = chooser.disabled;
    if (!enabled) invalidateSimilarityReport();
  }

  function analyzeSimilarity(): void {
    invalidateSimilarityReport();
    if (!currentResult || !input("#similarity-enabled").checked) return;
    const columns = Array.from(select("#similarity-columns").selectedOptions, (option) => option.value);
    try {
      const analysis = analyzeSimilarRows(currentResult.dataset, columns);
      const report = one<HTMLElement>("#similarity-report");
      const heading = d.createElement("h3");
      heading.textContent = `Prováveis duplicidades: ${analysis.pairs.length}`;
      const summary = d.createElement("p");
      summary.textContent = `${analysis.totalPairs} pares avaliados; limiar ${(analysis.threshold * 100).toFixed(0)}%. Revise cada ocorrência: nenhuma ação foi aplicada.`;
      report.append(heading, summary);
      const list = d.createElement("ol");
      analysis.pairs.forEach((pair) => {
        const item = d.createElement("li");
        const title = d.createElement("strong");
        title.textContent = `Linhas ${pair.leftRow} e ${pair.rightRow}: ${(pair.score * 100).toFixed(2)}%`;
        const details = d.createElement("ul");
        pair.fields.forEach((field) => {
          const detail = d.createElement("li");
          detail.textContent = `${field.column}: “${field.leftOriginal}” → “${field.leftNormalized}” × “${field.rightOriginal}” → “${field.rightNormalized}”; distância ${field.distance}; ${(field.score * 100).toFixed(2)}%.`;
          details.appendChild(detail);
        });
        item.append(title, details);
        list.appendChild(item);
      });
      if (analysis.pairs.length === 0) {
        const empty = d.createElement("p");
        empty.textContent = "Nenhum par atingiu o limiar com a seleção atual.";
        report.appendChild(empty);
      } else {
        report.appendChild(list);
      }
      report.hidden = false;
      log(`Análise consultiva concluída: ${analysis.pairs.length} provável(is) duplicidade(s), sem alterar a saída.`);
    } catch (error) {
      log(error instanceof Error ? error.message : "Falha na análise de similaridade.", "error");
    }
  }

  function labelDelimiter(value: string): string {
    if (value === "\t") {
      return "TAB";
    }
    return value;
  }

  function modelLabel(value: TabularModelKind): string {
    return value === "modelo1" ? "Modelo 1" : "Modelo 2";
  }

  function mergeModeLabel(value: DatasetMergeMode): string {
    if (value === "merge-only") return "Somente mesclar";
    if (value === "summed") return "Somadas";
    return "Resultado prévio";
  }

  function cancelPendingInference(): void {
    inferenceRun += 1;
    if (inferenceTimer) {
      w.clearTimeout(inferenceTimer);
      inferenceTimer = 0;
    }
  }

  function scheduleInference(reason: "arquivo" | "texto"): void {
    cancelPendingInference();
    const run = inferenceRun;
    inferenceTimer = w.setTimeout(() => {
      inferenceTimer = 0;
      void inferDirectionPreview(run, reason);
    }, inferenceDelayMs);
  }

  async function inferDirectionPreview(run: number, reason: "arquivo" | "texto"): Promise<void> {
    const text = textarea("#csv-text").value;
    if (!text.trim()) {
      updateDirection("modelo1");
      updateSummary("-", "-", null);
      return;
    }

    await yieldToBrowser();
    if (run !== inferenceRun) {
      return;
    }

    const preview = csvHeaderPreview(text);
    if (!preview) {
      return;
    }

    try {
      const dataset = parseCsv(preview);
      if (run !== inferenceRun || dataset.columns.length === 0) {
        return;
      }
      const from = inferModelKind(dataset);
      const to = oppositeModel(from);
      updateDirection(from, to);
      updateSummary(from, to, null);
      if (reason === "arquivo") {
        log(`Modelo de origem inferido apos leitura do arquivo: ${modelLabel(from)}.`);
      }
    } catch (_error) {
      // Conteudo ainda incompleto durante digitacao; a conversao final emitira erro se persistir.
    }
  }

  function yieldToBrowser(): Promise<void> {
    return new Promise((resolve) => {
      w.setTimeout(resolve, 0);
    });
  }

  function csvHeaderPreview(text: string): string {
    const limit = Math.min(text.length, maxHeaderScanChars);
    let quote: string | null = null;

    for (let index = 0; index < limit; index += 1) {
      const char = text[index] ?? "";
      const next = text[index + 1] ?? "";

      if ((char === "\"" || char === "'") && (!quote || quote === char)) {
        if (quote === char && next === char) {
          index += 1;
          continue;
        }
        quote = quote ? null : char;
        continue;
      }

      if (!quote && (char === "\n" || char === "\r")) {
        const end = char === "\r" && next === "\n" ? index + 2 : index + 1;
        return `${text.slice(0, end)}\n`;
      }
    }

    return `${text.slice(0, limit)}\n`;
  }

  function renderDecisions(decisions: NameDecision[]): void {
    const container = one<HTMLElement>("#decisions");
    container.innerHTML = "<strong>Consolidacao de nomes</strong>";
    container.hidden = false;

    decisions.forEach((decision) => {
      const row = d.createElement("div");
      row.className = "decision-row";
      const label = d.createElement("strong");
      label.textContent = decision.phone;
      const chooser = d.createElement("select");
      chooser.dataset.phone = decision.phone;
      decision.candidates.forEach((candidate) => {
        const option = d.createElement("option");
        option.value = candidate;
        option.textContent = candidate;
        option.selected = candidate === (nameDecisions[decision.phone] ?? decision.chosenName);
        chooser.appendChild(option);
      });
      row.append(label, chooser);
      container.appendChild(row);
    });

    const actions = d.createElement("div");
    actions.className = "decision-actions";
    const apply = d.createElement("button");
    apply.type = "button";
    apply.textContent = "Confirmar nomes";
    apply.addEventListener("click", () => {
      const choices = Array.from(container.querySelectorAll<HTMLSelectElement>("select[data-phone]"));
      choices.forEach((choice) => {
        const phone = choice.dataset.phone ?? "";
        if (phone && choice.value.trim()) {
          nameDecisions[phone] = choice.value;
        }
      });
      log("Escolhas de nomes aplicadas.");
      convert();
    });
    actions.appendChild(apply);
    container.appendChild(actions);
  }

  function hideDecisions(): void {
    const container = one<HTMLElement>("#decisions");
    container.hidden = true;
    container.innerHTML = "";
  }

  async function loadFile(file: File): Promise<void> {
    clearLogs();
    setOutput("");
    hideDecisions();
    log(`Lendo arquivo ${file.name}.`);
    const decoded = decodeTextBuffer(await file.arrayBuffer());
    textarea("#csv-text").value = decoded.text;
    log(`Codificacao detectada: ${decoded.dialect.encoding}.`);
    scheduleInference("arquivo");
  }

  async function loadMergeFile(file: File): Promise<void> {
    invalidateResult();
    log(`Lendo arquivo complementar ${file.name}.`);
    const decoded = decodeTextBuffer(await file.arrayBuffer());
    textarea("#csv-merge").value = decoded.text;
    log(`Codificacao complementar detectada: ${decoded.dialect.encoding}.`);
  }

  function clearAll(): void {
    sourceDataset = null;
    currentResult = null;
    for (const key of Object.keys(nameDecisions)) {
      delete nameDecisions[key];
    }
    textarea("#csv-text").value = "";
    textarea("#csv-merge").value = "";
    one<HTMLInputElement>('input[name="merge-mode"][value="previous"]').checked = true;
    setOutput("");
    select("#source-model").value = "modelo1";
    select("#target-model").value = "modelo2";
    updateSummary("-", "-", null);
    hideDecisions();
    input("#similarity-enabled").checked = false;
    populateSimilarityColumns(null);
    invalidateSimilarityReport();
    clearLogs();
    log("Estado limpo.");
  }

  function downloadCsv(): void {
    const content = textarea("#csv-output").value;
    if (!content || !currentResult) {
      log("Nao ha CSV convertido para baixar.", "warning");
      return;
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = d.createElement("a");
    link.href = url;
    link.download = `modelo-convertido-${new Date().toISOString().slice(0, 10)}.csv`;
    d.body.appendChild(link);
    link.click();
    d.body.removeChild(link);
    URL.revokeObjectURL(url);
    log("Arquivo CSV preparado para download.");
  }

  async function copyLog(): Promise<void> {
    const text = Array.from(one<HTMLOListElement>("#logs").querySelectorAll("li")).map((item) => item.textContent ?? "").join("\n");
    try {
      await w.navigator.clipboard.writeText(text);
      log("Logs copiados para a area de transferencia.");
    } catch (_error) {
      log("Nao foi possivel copiar os logs.", "warning");
    }
  }

  ready(() => {
    const shared = w.JCEMDocumentos;
    shared?.toolbar.configure({
      actions: {
        "csv-open": () => input("#csv-file").click(),
        "csv-download": downloadCsv,
        clear: clearAll
      }
    });
    shared?.chrome.render({ actionsSelector: "[data-jcem-actions]", autosave: false, mountBefore: ".bd-app" });
    shared?.bundle.bindDownload();

    input("#csv-file").addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.files?.[0]) {
        return;
      }
      void loadFile(target.files[0]);
    });
    input("#csv-merge-file").addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.files?.[0]) return;
      void loadMergeFile(target.files[0]);
    });
    button("#merge-file-button").addEventListener("click", () => input("#csv-merge-file").click());
    textarea("#csv-text").addEventListener("input", () => {
      sourceDataset = null;
      invalidateResult();
      scheduleInference("texto");
    });
    textarea("#csv-merge").addEventListener("input", invalidateResult);
    input("#identifier-columns").addEventListener("input", invalidateResult);
    d.querySelectorAll<HTMLInputElement>('input[name="merge-mode"]').forEach((radio) => radio.addEventListener("change", invalidateResult));
    button("#convert").addEventListener("click", convert);
    button("#clear").addEventListener("click", clearAll);
    button("#download").addEventListener("click", downloadCsv);
    input("#similarity-enabled").addEventListener("change", syncSimilarityControls);
    select("#similarity-columns").addEventListener("change", () => {
      const options = Array.from(select("#similarity-columns").selectedOptions);
      if (options.length > 3) {
        const last = options.at(-1);
        if (last) last.selected = false;
        log("Selecione no máximo três colunas para a análise.", "warning");
      }
      invalidateSimilarityReport();
    });
    button("#analyze-similarity").addEventListener("click", analyzeSimilarity);
    button("#copy-log").addEventListener("click", () => void copyLog());
    log("Ferramenta pronta para conversao local.");
  });
})(window, document);
