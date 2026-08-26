import config from "../../assets/config/declaracoes-unificada.json";

export const DECLARATIONS_SCHEMA = "jcem.declaracoes-unificada.v1";
const STORAGE_KEY = "jcem.declaracoes-unificada.state";

export type DeclarantType = "PF" | "PJ";

export interface Declarant {
  document: string;
  id: string;
  name: string;
  representativeIds: string[];
  type: DeclarantType;
}

export interface DeclarationsState {
  city: string;
  date: string;
  declarants: Declarant[];
  nextSequence: number;
  schema: typeof DECLARATIONS_SCHEMA;
  uf: string;
  version: 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneState(value: DeclarationsState): DeclarationsState {
  return JSON.parse(JSON.stringify(value)) as DeclarationsState;
}

export function orderedDeclarants(declarants: Declarant[]): Declarant[] {
  return [...declarants.filter(({ type }) => type === "PF"), ...declarants.filter(({ type }) => type === "PJ")];
}

export function representativesArePrior(declarants: Declarant[]): boolean {
  const positions = new Map(declarants.map(({ id }, index) => [id, index]));
  return declarants.every((declarant, index) => declarant.type === "PF" || declarant.representativeIds.every((id) => id !== declarant.id && positions.has(id) && (positions.get(id) ?? index) < index));
}

export function moveDeclarant(declarants: Declarant[], id: string, delta: -1 | 1): Declarant[] | null {
  const index = declarants.findIndex((item) => item.id === id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= declarants.length) return null;
  const moved = [...declarants];
  const [item] = moved.splice(index, 1);
  if (!item) return null;
  moved.splice(target, 0, item);
  return representativesArePrior(moved) ? moved : null;
}

export function removeDeclarantAndReferences(declarants: Declarant[], id: string): Declarant[] {
  return declarants.filter((item) => item.id !== id).map((item) => ({ ...item, representativeIds: item.representativeIds.filter((representativeId) => representativeId !== id) }));
}

export function parseDeclarationsState(value: unknown): DeclarationsState | null {
  if (!isRecord(value) || value.schema !== DECLARATIONS_SCHEMA || value.version !== 1 || typeof value.city !== "string" || typeof value.uf !== "string" || typeof value.date !== "string" || !Number.isInteger(value.nextSequence) || Number(value.nextSequence) < 1 || !Array.isArray(value.declarants)) return null;
  const declarants: Declarant[] = [];
  for (const raw of value.declarants) {
    if (!isRecord(raw) || typeof raw.id !== "string" || !/^d-\d+$/.test(raw.id) || (raw.type !== "PF" && raw.type !== "PJ") || typeof raw.name !== "string" || typeof raw.document !== "string" || !Array.isArray(raw.representativeIds) || raw.representativeIds.some((id) => typeof id !== "string")) return null;
    declarants.push({ document: raw.document.replace(/\D/g, ""), id: raw.id, name: raw.name, representativeIds: [...raw.representativeIds] as string[], type: raw.type });
  }
  if (new Set(declarants.map(({ id }) => id)).size !== declarants.length || !representativesArePrior(declarants)) return null;
  return { city: value.city, date: value.date, declarants, nextSequence: Number(value.nextSequence), schema: DECLARATIONS_SCHEMA, uf: value.uf, version: 1 };
}

function bootstrapDeclarations(w: Window, d: Document): void {
  "use strict";
  const documentos = w.JCEMDocumentos;
  if (!documentos) throw new Error("Infraestrutura JCEMDocumentos indisponivel.");
  const api: JCEMDocumentosApi = documentos;
  const pageConfig = api.print.profile("declaracoes-unificada");
  let state = initialState();
  let paginationGeneration = 0;
  let paginationPromise: Promise<void> = Promise.resolve();
  let resizeTimer = 0;

  function required<T extends Element>(selector: string, root: ParentNode = d): T {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Elemento obrigatorio ausente: ${selector}`);
    return element;
  }

  function today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
  }

  function blankState(): DeclarationsState {
    return { city: config.defaults.city, date: today(), declarants: [{ document: "", id: "d-1", name: "", representativeIds: [], type: "PF" }], nextSequence: 2, schema: DECLARATIONS_SCHEMA, uf: config.defaults.uf, version: 1 };
  }

  function initialState(): DeclarationsState {
    const query = parseDeclarationsState(api.query.json());
    if (query) return query;
    try {
      const stored = api.storage.getItem(STORAGE_KEY);
      const parsed = stored ? parseDeclarationsState(JSON.parse(stored) as unknown) : null;
      return parsed ?? blankState();
    } catch (_error) {
      return blankState();
    }
  }

  function save(): void {
    api.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeMarkup(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function validCivilDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const candidate = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 0));
    return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === (month ?? 1) - 1 && candidate.getUTCDate() === day;
  }

  function longDate(value: string): string {
    if (!validCivilDate(value)) return "data inválida";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 0));
    return `${`${day}`.padStart(2, "0")} de ${date.toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" })} de ${year}`;
  }

  function formattedDocument(declarant: Declarant): string | null {
    const expectedLength = declarant.type === "PF" ? 11 : 14;
    if (declarant.document.length !== expectedLength || /^(\d)\1+$/.test(declarant.document)) return null;
    const formatter = declarant.type === "PF" ? api.validators.cpf : api.validators.cnpj;
    const result = formatter(declarant.document);
    return typeof result === "string" ? result : null;
  }

  function validationErrors(): string[] {
    const errors: string[] = [];
    if (!state.city.trim()) errors.push("Informe o município.");
    if (!/^[A-Za-z]{2}$/.test(state.uf.trim())) errors.push("Informe uma UF válida com duas letras.");
    if (!validCivilDate(state.date)) errors.push("Informe uma data civil válida.");
    if (state.declarants.length === 0) errors.push("Cadastre ao menos um declarante.");
    state.declarants.forEach((declarant, index) => {
      if (!declarant.name.trim()) errors.push(`Informe o nome ou razão social do declarante ${index + 1}.`);
      if (!formattedDocument(declarant)) errors.push(`Informe um ${declarant.type === "PF" ? "CPF" : "CNPJ"} válido para o declarante ${index + 1}.`);
    });
    if (!representativesArePrior(state.declarants)) errors.push("Toda pessoa jurídica deve referenciar somente declarantes cadastrados anteriormente.");
    return errors;
  }

  function validate(show = true): boolean {
    const errors = validationErrors();
    const status = required<HTMLElement>("#du-status");
    status.textContent = errors.length ? errors[0] ?? "Dados inválidos." : "Documento atualizado e pronto para saída.";
    if (show && errors.length) w.alert(errors.join("\n"));
    return errors.length === 0;
  }

  function setFieldError(card: HTMLElement, declarant: Declarant): void {
    const target = required<HTMLElement>(".du-field-error", card);
    if (!declarant.name.trim()) target.textContent = "Nome ou razão social obrigatórios.";
    else if (declarant.document && !formattedDocument(declarant)) target.textContent = `${declarant.type === "PF" ? "CPF" : "CNPJ"} inválido.`;
    else target.textContent = "";
  }

  function updateRepresentativeLabels(declarant: Declarant): void {
    const fallback = `Declarante ${state.declarants.indexOf(declarant) + 1}`;
    d.querySelectorAll<HTMLInputElement>(".du-representative").forEach((input) => {
      if (input.value !== declarant.id) return;
      const label = input.closest("label")?.querySelector("span");
      if (label) label.textContent = declarant.name.trim() || fallback;
    });
  }

  function bindCard(card: HTMLElement, declarant: Declarant, index: number): void {
    const type = required<HTMLSelectElement>(".du-type", card);
    const name = required<HTMLInputElement>(".du-name", card);
    const documentInput = required<HTMLInputElement>(".du-document-number", card);
    type.addEventListener("change", () => {
      if (declarant.type === "PJ" && declarant.representativeIds.length && type.value === "PF" && !w.confirm("Alterar para PF removerá os representantes selecionados. Continuar?")) {
        type.value = declarant.type;
        return;
      }
      declarant.type = type.value === "PJ" ? "PJ" : "PF";
      declarant.representativeIds = [];
      declarant.document = "";
      save();
      renderEditor(declarant.id);
      schedulePagination();
    });
    name.addEventListener("input", () => {
      declarant.name = name.value;
      save();
      setFieldError(card, declarant);
      updateRepresentativeLabels(declarant);
      schedulePagination();
    });
    documentInput.addEventListener("input", () => {
      declarant.document = api.util.digits(documentInput.value);
      save();
      setFieldError(card, declarant);
      schedulePagination();
    });
    documentInput.addEventListener("blur", () => {
      const formatted = formattedDocument(declarant);
      if (formatted) documentInput.value = formatted;
      setFieldError(card, declarant);
    });
    card.querySelectorAll<HTMLInputElement>(".du-representative").forEach((checkbox) => checkbox.addEventListener("change", () => {
      const representativeId = checkbox.value;
      declarant.representativeIds = checkbox.checked ? [...declarant.representativeIds, representativeId] : declarant.representativeIds.filter((id) => id !== representativeId);
      save();
      schedulePagination();
    }));
    required<HTMLButtonElement>(".du-up", card).addEventListener("click", () => move(declarant.id, -1));
    required<HTMLButtonElement>(".du-down", card).addEventListener("click", () => move(declarant.id, 1));
    required<HTMLButtonElement>(".du-remove", card).addEventListener("click", () => remove(declarant.id));
    required<HTMLButtonElement>(".du-up", card).disabled = index === 0;
    required<HTMLButtonElement>(".du-down", card).disabled = index === state.declarants.length - 1;
  }

  function renderEditor(focusId?: string): void {
    const city = required<HTMLInputElement>("#du-city");
    const uf = required<HTMLInputElement>("#du-uf");
    const date = required<HTMLInputElement>("#du-date");
    city.value = state.city;
    uf.value = state.uf;
    date.value = state.date;
    const container = required<HTMLElement>("#du-declarants");
    container.replaceChildren();
    state.declarants.forEach((declarant, index) => {
      const card = d.createElement("article");
      card.className = "du-declarant";
      card.dataset.id = declarant.id;
      const eligible = state.declarants.slice(0, index);
      const representatives = declarant.type === "PJ" ? `<fieldset class="du-representatives"><legend>Representantes anteriores</legend>${eligible.length ? eligible.map((candidate) => `<label><input class="du-representative" type="checkbox" value="${escapeMarkup(candidate.id)}" ${declarant.representativeIds.includes(candidate.id) ? "checked" : ""}> <span>${escapeMarkup(candidate.name.trim() || `Declarante ${state.declarants.indexOf(candidate) + 1}`)}</span></label>`).join("") : "<p>Nenhum declarante anterior disponível.</p>"}</fieldset>` : "";
      card.innerHTML = `<div class="du-declarant-header"><h3>Declarante ${index + 1}</h3><div class="du-declarant-actions"><button type="button" class="du-up" aria-label="Mover declarante ${index + 1} para cima">↑</button><button type="button" class="du-down" aria-label="Mover declarante ${index + 1} para baixo">↓</button><button type="button" class="du-remove" aria-label="Remover declarante ${index + 1}">Remover</button></div></div><label>Tipo<select class="du-type"><option value="PF" ${declarant.type === "PF" ? "selected" : ""}>Pessoa física</option><option value="PJ" ${declarant.type === "PJ" ? "selected" : ""}>Pessoa jurídica</option></select></label><label>Nome ou razão social<input class="du-name" type="text" value="${escapeMarkup(declarant.name)}" required></label><label>${declarant.type === "PF" ? "CPF" : "CNPJ"}<input class="du-document-number" type="text" inputmode="numeric" value="${escapeMarkup(formattedDocument(declarant) ?? declarant.document)}" required></label><p class="du-field-error" role="alert"></p>${representatives}`;
      container.appendChild(card);
      bindCard(card, declarant, index);
      setFieldError(card, declarant);
    });
    if (focusId) container.querySelector<HTMLInputElement>(`.du-declarant[data-id="${focusId}"] .du-name`)?.focus();
    validate(false);
  }

  function move(id: string, delta: -1 | 1): void {
    const moved = moveDeclarant(state.declarants, id, delta);
    if (!moved) {
      w.alert("A ordem não pode criar referência futura ou inválida. Remova ou altere os representantes antes de mover.");
      return;
    }
    state.declarants = moved;
    save();
    renderEditor(id);
    schedulePagination();
  }

  function remove(id: string): void {
    const referenced = state.declarants.some((item) => item.representativeIds.includes(id));
    if (referenced && !w.confirm("Este declarante representa pessoa jurídica. Removê-lo também removerá explicitamente esses vínculos. Continuar?")) return;
    state.declarants = removeDeclarantAndReferences(state.declarants, id);
    save();
    renderEditor(state.declarants[0]?.id);
    schedulePagination();
  }

  function resolveTemplate(template: string, values: Record<string, string>): string {
    const tokens = [...template.matchAll(/\$\{([^}]+)\}/g)].map((match) => match[1] ?? "");
    if (new Set(tokens).size !== tokens.length || tokens.some((token) => !(token in values))) throw new Error("Template institucional possui token ausente, desconhecido ou duplicado.");
    const result = template.replace(/\$\{([^}]+)\}/g, (_whole, token: string) => values[token] ?? "");
    if (/\$\{[^}]+\}/.test(result)) throw new Error("Template institucional possui token não resolvido.");
    return result;
  }

  function footerMarkup(): string {
    const ordered = orderedDeclarants(state.declarants);
    const numbers = new Map(ordered.map(({ id }, index) => [id, index + 1]));
    const lines = ordered.map((declarant) => {
      const representatives = declarant.representativeIds.map((id) => `[${numbers.get(id) ?? "?"}]`).join(config.footer.representativeJoin);
      const representation = representatives ? resolveTemplate(config.footer.representationTemplate, { documento: "", nome: "", numero: "", representantes: representatives }) : "";
      const line = resolveTemplate(declarant.type === "PF" ? config.footer.personTemplate : config.footer.companyTemplate, {
        documento: formattedDocument(declarant) ?? (declarant.document || "________________"),
        nome: declarant.name.trim() || "________________",
        numero: `${numbers.get(declarant.id) ?? "?"}`,
        representantes: representation
      });
      return escapeMarkup(line).replace(/\[(\d+|\?)\]/g, '<span class="du-index">[$1]</span>');
    });
    return `<p>${escapeMarkup(config.footer.intro)}${lines.length ? ` ${lines.join("; ")}` : ""}.</p><p class="du-signature">${escapeMarkup(config.footer.signature)}</p>`;
  }

  function sourceUnits(): HTMLElement[] {
    const template = required<HTMLTemplateElement>("#declaracoes-source");
    const units = Array.from(template.content.querySelectorAll<HTMLElement>(".du-unit"));
    if (units.length !== 6) throw new Error("Conteúdo compilado das seis declarações está incompleto.");
    return units;
  }

  function pageHeader(titles: string[]): string {
    return `<header class="du-page-header"><p class="du-page-place">${escapeMarkup(`${state.city.trim()}-${state.uf.trim().toUpperCase()}, ${longDate(state.date)}`)}</p><p class="du-page-titles">${escapeMarkup(titles.map((title) => title.toLocaleUpperCase("pt-BR")).join("; "))}</p><p class="du-page-statement">${escapeMarkup(config.document.headerStatement)}</p><p class="du-page-number">Página <span data-page-current></span> de <span data-page-total></span></p></header>`;
  }

  function createPage(root: HTMLElement, titles: string[]): HTMLElement {
    const page = d.createElement("article");
    page.className = "du-page jcem-print-sheet";
    page.innerHTML = `${pageHeader(titles)}<main class="du-page-body"></main><footer class="du-page-footer">${footerMarkup()}</footer>`;
    root.appendChild(page);
    return page;
  }

  function bodyOf(page: HTMLElement): HTMLElement {
    return required<HTMLElement>(".du-page-body", page);
  }

  function overflows(body: HTMLElement): boolean {
    return body.scrollHeight > body.clientHeight + 1;
  }

  function continuationSection(unit: HTMLElement, continuation: boolean): HTMLElement {
    const section = d.createElement("section");
    section.className = "du-unit";
    section.dataset.unitId = unit.dataset.unitId ?? "";
    section.dataset.title = unit.dataset.title ?? "";
    if (continuation) section.dataset.continuation = "true";
    const title = unit.querySelector("h2")?.cloneNode(true);
    if (title) section.appendChild(title);
    return section;
  }

  function nextFrames(): Promise<void> {
    return new Promise((resolve) => w.requestAnimationFrame(() => w.requestAnimationFrame(() => resolve())));
  }

  async function paginate(generation: number): Promise<void> {
    const root = required<HTMLElement>("#documento-unificado");
    root.setAttribute("aria-busy", "true");
    const units = sourceUnits();
    const titles = units.map((unit) => unit.dataset.title ?? "");
    root.replaceChildren();
    let page = createPage(root, titles);
    let body = bodyOf(page);
    await nextFrames();
    for (const unit of units) {
      if (generation !== paginationGeneration) return;
      const whole = unit.cloneNode(true) as HTMLElement;
      body.appendChild(whole);
      if (!overflows(body)) continue;
      whole.remove();
      if (body.children.length) {
        page = createPage(root, titles);
        body = bodyOf(page);
      }
      body.appendChild(whole);
      if (!overflows(body)) continue;
      whole.remove();
      const blocks = Array.from(unit.children).filter((child) => child.tagName !== "H2");
      let section = continuationSection(unit, false);
      body.appendChild(section);
      for (const sourceBlock of blocks) {
        const block = sourceBlock.cloneNode(true) as HTMLElement;
        section.appendChild(block);
        if (!overflows(body)) continue;
        block.remove();
        if (section.children.length <= 1) throw new Error(`Bloco documental indivisível excede a área útil: ${unit.dataset.unitId ?? "unidade"}.`);
        page = createPage(root, titles);
        body = bodyOf(page);
        section = continuationSection(unit, true);
        body.appendChild(section);
        section.appendChild(block);
        if (overflows(body)) throw new Error(`Bloco documental excede uma página: ${unit.dataset.unitId ?? "unidade"}.`);
      }
    }
    const pages = Array.from(root.querySelectorAll<HTMLElement>(".du-page"));
    pages.forEach((item, index) => {
      required<HTMLElement>("[data-page-current]", item).textContent = `${index + 1}`;
      required<HTMLElement>("[data-page-total]", item).textContent = `${pages.length}`;
    });
    root.setAttribute("aria-busy", "false");
    validate(false);
  }

  function schedulePagination(): void {
    paginationGeneration += 1;
    const generation = paginationGeneration;
    paginationPromise = (async () => {
      await d.fonts?.ready;
      await paginate(generation);
    })().catch((error: unknown) => {
      required<HTMLElement>("#documento-unificado").setAttribute("aria-busy", "false");
      required<HTMLElement>("#du-status").textContent = error instanceof Error ? error.message : "Falha na paginação.";
      throw error;
    });
  }

  async function readyForOutput(): Promise<boolean> {
    if (!validate(true)) return false;
    schedulePagination();
    await paginationPromise;
    const root = required<HTMLElement>("#documento-unificado");
    const pageBodies = Array.from(root.querySelectorAll<HTMLElement>(".du-page-body"));
    if (root.getAttribute("aria-busy") === "true" || pageBodies.length === 0 || pageBodies.some(overflows)) {
      w.alert("A paginação não pôde ser consolidada sem overflow.");
      return false;
    }
    return true;
  }

  function payload(): Record<string, unknown> | null {
    return validate(false) ? cloneState(state) as unknown as Record<string, unknown> : null;
  }

  function applyPayload(value: Record<string, unknown>): void {
    const parsed = parseDeclarationsState(value);
    if (!parsed) throw new Error("Arquivo recusado: módulo, schema, versão, identidade ou vínculos incompatíveis.");
    state = parsed;
    save();
    renderEditor();
    schedulePagination();
  }

  function bindStaticFields(): void {
    const city = required<HTMLInputElement>("#du-city");
    const uf = required<HTMLInputElement>("#du-uf");
    const date = required<HTMLInputElement>("#du-date");
    city.addEventListener("input", () => { state.city = city.value; save(); validate(false); schedulePagination(); });
    uf.addEventListener("input", () => { state.uf = uf.value.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase(); uf.value = state.uf; save(); validate(false); schedulePagination(); });
    date.addEventListener("input", () => { state.date = date.value; save(); validate(false); schedulePagination(); });
    required<HTMLButtonElement>("#du-add-declarant").addEventListener("click", () => {
      const id = `d-${state.nextSequence}`;
      state.nextSequence += 1;
      state.declarants.push({ document: "", id, name: "", representativeIds: [], type: "PF" });
      save();
      renderEditor(id);
      schedulePagination();
    });
  }

  function applyCssConfig(): void {
    const root = required<HTMLElement>("#documento-unificado");
    root.style.setProperty("--du-block-bg", config.document.background);
    root.style.setProperty("--du-block-padding", `${config.document.paddingCm}cm`);
    root.style.setProperty("--du-index-padding", `${config.footer.indexPaddingCm}cm`);
    root.style.setProperty("--du-index-margin", `${config.footer.indexMarginCm}cm`);
  }

  api.ready(() => {
    api.toolbar.configure({
      actions: {
        clear: () => {
          state = blankState();
          save();
          renderEditor("d-1");
          schedulePagination();
        },
        pdf: async () => {
          if (!await readyForOutput()) return;
          await api.print.pdf({ filename: "declaracoes-unificadas.pdf", margin: [0, 0, 0, 0], pageConfig, source: required("#documento-unificado") });
        },
        print: async () => {
          if (await readyForOutput()) w.print();
        },
        share: (event) => {
          void api.share.run({
            beforeShare: (context) => context.mode === "clean" || validate(true),
            messages: { copiedClean: "Endereço limpo copiado.", copiedFilled: "Endereço preenchido das declarações copiado." },
            payload
          }, event);
        }
      },
      exportBasename: "declaracoes-unificadas",
      exportPayload: payload,
      importPayload: applyPayload,
      moduleId: "declaracoes-unificada",
      schema: DECLARATIONS_SCHEMA,
      version: "1.0.0"
    });
    api.chrome.render({ actionsSelector: "[data-jcem-actions]", mountBefore: ".du-shell" });
    api.print.createPageStyle(pageConfig);
    renderEditor();
    applyCssConfig();
    schedulePagination();
    api.layout.printable({ document: "#documento-unificado", forms: [{ placement: "external", selector: ".du-editor" }], preview: ".du-preview", workspace: ".du-shell" });
    required<HTMLElement>("#documento-unificado").classList.remove("jcem-print-sheet");
    api.autosave.indicator(".autosave");
    bindStaticFields();
    w.addEventListener("resize", () => {
      w.clearTimeout(resizeTimer);
      resizeTimer = w.setTimeout(schedulePagination, 180);
    }, { passive: true });
    w.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        void readyForOutput().then((ready) => { if (ready) w.print(); });
      }
    });
    w.addEventListener("beforeprint", () => d.body.classList.toggle("du-print-invalid", !validate(false)));
    w.addEventListener("afterprint", () => d.body.classList.remove("du-print-invalid"));
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  bootstrapDeclarations(window, document);
}
