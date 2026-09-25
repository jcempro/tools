import {
  analyzeSimilarRows,
  combinationStrategies,
  combineDatasets,
  convertDataset,
  decodeTextBuffer,
  eligibleCombinationColumns,
  eligibleSimilarityColumns,
  inferModelKind,
  oppositeModel,
  parseCsv,
  serializeCsv,
  type ConversionIssue,
  type ConversionResult,
  type DatasetCombinationStrategy,
  type NameDecision,
  type TabularDataset,
  type TabularModelKind
} from "../assets/js/tabular";

type OperationKind = "convert" | "convert-combine" | "combine";
type AdditionalSource = Readonly<{ name: string; text: string }>;

(function bootstrapBd(w: Window, d: Document): void {
  "use strict";

  const inferenceDelayMs = 350;
  const maxHeaderScanChars = 128 * 1024;
  let sourceDataset: TabularDataset | null = null;
  let currentResult: ConversionResult | null = null;
  let primaryName = "Primeiro arquivo";
  let additionalSources: AdditionalSource[] = [];
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

  function operation(): OperationKind {
    return one<HTMLInputElement>('input[name="operation"]:checked').value as OperationKind;
  }

  function combinationStrategy(): DatasetCombinationStrategy {
    return one<HTMLInputElement>('input[name="combination-strategy"]:checked').value as DatasetCombinationStrategy;
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
    const selectedOperation = operation();
    log(`Início: ${operationLabel(selectedOperation)}.`);

    sourceDataset = parseSource();
    if (!sourceDataset) {
      updateSummary("-", "-", null);
      return;
    }

    let direction = "Sem conversão";
    if (selectedOperation === "combine") {
      currentResult = { dataset: sourceDataset, issues: [], pendingNameDecisions: [] };
      log("Os arquivos originais serão combinados sem inferência nem transformação de modelo.");
    } else {
      const from = inferModelKind(sourceDataset);
      const to = oppositeModel(from);
      direction = `${modelLabel(from)} → ${modelLabel(to)}`;
      updateDirection(from, to);
      log(`Modelo de origem inferido: ${modelLabel(from)}. Saída definida automaticamente: ${modelLabel(to)}.`);
      currentResult = convertDataset(sourceDataset, from, to, {
        identifierColumns: identifiers(),
        nameDecisions
      });
    }

    for (const issue of currentResult.issues) {
      log(issue.message, issue.severity);
    }

    if (currentResult.issues.some((issue) => issue.severity === "error")) {
      setOutput("");
      updateSummary(operationLabel(selectedOperation), direction, null);
      log("Operação interrompida por erro recuperável.", "error");
      return;
    }

    if (currentResult.pendingNameDecisions.length > 0) {
      renderDecisions(currentResult.pendingNameDecisions);
      log("Existem divergências de nome aguardando revisão do usuário.", "decision");
      setOutput("");
      updateSummary(operationLabel(selectedOperation), direction, null);
      log("Confirme os nomes canônicos antes de gerar o CSV final.", "decision");
      return;
    }

    let resultContext = direction;
    if (selectedOperation !== "convert") {
      const inputs = readAdditionalSources();
      if (inputs.length === 0) {
        log("Informe ao menos um arquivo adicional para combinar.", "error");
        updateSummary(operationLabel(selectedOperation), "Aguardando arquivos", null);
        return;
      }
      const parsed = parseAdditionalDatasets(inputs);
      if (!parsed) {
        updateSummary(operationLabel(selectedOperation), "Arquivos inválidos", null);
        return;
      }
      const datasets = [currentResult.dataset, ...parsed];
      const strategy = combinationStrategy();
      const key = strategy === "append" ? undefined : populateCombinationKeys(datasets);
      if (strategy !== "append" && !key) {
        log("Confirme o campo de correspondência antes de combinar.", "decision");
        updateSummary(operationLabel(selectedOperation), strategyLabel(strategy), null);
        return;
      }
      const sourceNames = [primaryName, ...inputs.map(({ name }) => name)];
      log(`Arquivos na ordem efetiva: ${sourceNames.join(" → ")}.`);
      log(`Estratégia: ${strategyLabel(strategy)}${key ? `; campo confirmado: ${key}` : "; sem cruzamento por chave"}.`);
      const combined = combineDatasets(datasets, { keyColumn: key, sourceNames, strategy });
      combined.issues.forEach((issue) => log(issue.message, issue.severity));
      combined.steps.forEach((step) => log(`${step.source}: ${step.matches} correspondências, ${step.leftOnly} exclusivas anteriores, ${step.rightOnly} exclusivas do arquivo e ${step.exactDuplicates} duplicatas exatas consolidadas.`));
      if (combined.issues.some(({ severity }) => severity === "error")) {
        setOutput("");
        updateSummary(operationLabel(selectedOperation), strategyLabel(strategy), null);
        log("Combinação bloqueada; nenhum resultado parcial foi exportado.", "error");
        return;
      }
      currentResult = { ...currentResult, dataset: combined.dataset, issues: [...currentResult.issues, ...combined.issues] };
      resultContext = strategyLabel(strategy);
    }

    const csv = serializeCsv(currentResult.dataset);
    setOutput(csv);
    updateSummary(operationLabel(selectedOperation), resultContext, currentResult.dataset);
    populateSimilarityColumns(currentResult.dataset);
    log(`Conclusão: ${currentResult.dataset.rows.length} linhas exportáveis em UTF-8 com BOM.`);
  }

  function readAdditionalSources(): AdditionalSource[] {
    const pasted = textarea("#csv-merge").value.trim();
    return pasted ? [{ name: "Conteúdo adicional", text: pasted }] : [...additionalSources];
  }

  function parseAdditionalDatasets(inputs: AdditionalSource[]): TabularDataset[] | null {
    const datasets: TabularDataset[] = [];
    for (const source of inputs) {
      try {
        const dataset = parseCsv(source.text);
        if (dataset.columns.length === 0) throw new Error("CSV sem cabeçalho identificável.");
        datasets.push(dataset);
        log(`${source.name}: ${dataset.rows.length} linhas e ${dataset.columns.length} colunas.`);
      } catch (error) {
        log(`${source.name}: ${error instanceof Error ? error.message : "falha ao interpretar CSV"}`, "error");
        return null;
      }
    }
    return datasets;
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

  function operationLabel(value: OperationKind): string {
    if (value === "convert-combine") return "Converter e combinar arquivos";
    if (value === "combine") return "Somente combinar arquivos";
    return "Somente converter";
  }

  function strategyLabel(value: DatasetCombinationStrategy): string {
    return combinationStrategies.find((strategy) => strategy.value === value)?.label ?? value;
  }

  function populateCombinationKeys(datasets: TabularDataset[]): string | undefined {
    const chooser = select("#combination-key");
    const previous = chooser.value;
    const candidates = eligibleCombinationColumns(datasets);
    chooser.replaceChildren();
    const placeholder = d.createElement("option");
    placeholder.value = "";
    placeholder.textContent = candidates.length === 0 ? "Nenhum campo comum elegível" : "Escolha um campo comum";
    chooser.appendChild(placeholder);
    candidates.forEach((column) => {
      const option = d.createElement("option");
      option.value = column;
      option.textContent = column;
      chooser.appendChild(option);
    });
    const preserved = candidates.find((column) => column === previous);
    if (preserved) chooser.value = preserved;
    else if (candidates.length === 1) chooser.value = candidates[0] ?? "";
    if (candidates.length > 1 && !chooser.value) {
      log(`Foram encontrados ${candidates.length} campos comuns; escolha explicitamente um deles.`, "decision");
    }
    return chooser.value || undefined;
  }

  function renderStrategies(): void {
    const container = one<HTMLFieldSetElement>("#combination-strategies");
    combinationStrategies.forEach((strategy, index) => {
      const label = d.createElement("label");
      const radio = d.createElement("input");
      radio.type = "radio";
      radio.name = "combination-strategy";
      radio.value = strategy.value;
      radio.checked = index === 0;
      const copy = d.createElement("span");
      copy.className = "strategy-copy";
      copy.textContent = strategy.label;
      const help = d.createElement("small");
      help.textContent = `${strategy.help} (${strategy.value})`;
      copy.appendChild(help);
      label.append(radio, copy);
      container.appendChild(label);
    });
  }

  function syncContext(): void {
    const selectedOperation = operation();
    const conversion = one<HTMLFieldSetElement>(".conversion-group");
    const combination = one<HTMLFieldSetElement>(".combination-group");
    conversion.setAttribute("aria-hidden", String(selectedOperation === "combine"));
    combination.setAttribute("aria-hidden", String(selectedOperation === "convert"));
    const keyGroup = one<HTMLElement>(".key-group");
    const usesKey = selectedOperation !== "convert" && combinationStrategy() !== "append";
    keyGroup.setAttribute("aria-hidden", String(!usesKey));
    select("#combination-key").disabled = !usesKey;
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
    if (operation() === "combine") {
      updateSummary(operationLabel("combine"), "Sem conversão", null);
      return;
    }
    const run = inferenceRun;
    inferenceTimer = w.setTimeout(() => {
      inferenceTimer = 0;
      void inferDirectionPreview(run, reason);
    }, inferenceDelayMs);
  }

  async function inferDirectionPreview(run: number, reason: "arquivo" | "texto"): Promise<void> {
    if (operation() === "combine") return;
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
      updateSummary(operationLabel(operation()), `${modelLabel(from)} → ${modelLabel(to)}`, null);
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
    primaryName = file.name;
    log(`Codificacao detectada: ${decoded.dialect.encoding}.`);
    scheduleInference("arquivo");
  }

  async function loadMergeFiles(files: File[]): Promise<void> {
    invalidateResult();
    textarea("#csv-merge").value = "";
    additionalSources = [];
    for (const file of files) {
      log(`Lendo arquivo adicional ${file.name}.`);
      const decoded = decodeTextBuffer(await file.arrayBuffer());
      additionalSources.push({ name: file.name, text: decoded.text });
      log(`${file.name}: codificação ${decoded.dialect.encoding}.`);
    }
    renderCombinationFiles();
  }

  function renderCombinationFiles(): void {
    const list = one<HTMLOListElement>("#combination-files");
    list.replaceChildren();
    additionalSources.forEach(({ name }) => {
      const item = d.createElement("li");
      item.textContent = name;
      list.appendChild(item);
    });
  }

  function clearAll(): void {
    sourceDataset = null;
    currentResult = null;
    primaryName = "Primeiro arquivo";
    additionalSources = [];
    for (const key of Object.keys(nameDecisions)) {
      delete nameDecisions[key];
    }
    textarea("#csv-text").value = "";
    textarea("#csv-merge").value = "";
    input("#operation-convert").checked = true;
    const firstStrategy = one<HTMLInputElement>('input[name="combination-strategy"]');
    firstStrategy.checked = true;
    select("#combination-key").replaceChildren(new Option("Analise os arquivos para escolher", ""));
    renderCombinationFiles();
    setOutput("");
    select("#source-model").value = "modelo1";
    select("#target-model").value = "modelo2";
    updateSummary("-", "-", null);
    hideDecisions();
    input("#similarity-enabled").checked = false;
    populateSimilarityColumns(null);
    invalidateSimilarityReport();
    syncContext();
    clearLogs();
    log("Estado limpo.");
  }

  function downloadCsv(): void {
    const content = textarea("#csv-output").value;
    if (!content || !currentResult) {
      log("Não há CSV resultante para baixar.", "warning");
      return;
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = d.createElement("a");
    link.href = url;
    link.download = `resultado-csv-${new Date().toISOString().slice(0, 10)}.csv`;
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
    renderStrategies();
    syncContext();
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
      if (!(target instanceof HTMLInputElement) || !target.files?.length) return;
      void loadMergeFiles(Array.from(target.files));
    });
    button("#merge-file-button").addEventListener("click", () => input("#csv-merge-file").click());
    textarea("#csv-text").addEventListener("input", () => {
      sourceDataset = null;
      primaryName = "Conteúdo principal";
      invalidateResult();
      scheduleInference("texto");
    });
    textarea("#csv-merge").addEventListener("input", () => {
      additionalSources = [];
      renderCombinationFiles();
      invalidateResult();
    });
    input("#identifier-columns").addEventListener("input", invalidateResult);
    d.querySelectorAll<HTMLInputElement>('input[name="operation"]').forEach((radio) => radio.addEventListener("change", () => {
      invalidateResult();
      syncContext();
    }));
    d.querySelectorAll<HTMLInputElement>('input[name="combination-strategy"]').forEach((radio) => radio.addEventListener("change", () => {
      invalidateResult();
      syncContext();
    }));
    select("#combination-key").addEventListener("change", invalidateResult);
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
