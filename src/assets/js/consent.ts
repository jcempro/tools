type ConsentConfig = { acceptLabel: string; cdnVersion: string; privacyUrl: string; rejectLabel: string; storageKey: string; text: string };

function online(): boolean { return location.protocol === "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1"; }

function loadAsset(tag: "link" | "script", url: string): void {
  const node = document.createElement(tag);
  if (tag === "link") { (node as HTMLLinkElement).rel = "stylesheet"; (node as HTMLLinkElement).href = url; }
  else { (node as HTMLScriptElement).src = url; (node as HTMLScriptElement).defer = true; }
  document.head.appendChild(node);
}

async function init(): Promise<void> {
  if (!online()) return;
  const config = await fetch("/assets/config/consent.json").then((response) => response.json()) as ConsentConfig;
  const base = `https://cdn.jsdelivr.net/gh/silktide/consent-manager@v${config.cdnVersion}/`;
  loadAsset("link", `${base}silktide-consent-manager.css`);
  loadAsset("script", `${base}silktide-consent-manager.js`);
  if (localStorage.getItem(config.storageKey) === "accepted") return;
  const blocker = document.createElement("div");
  blocker.className = "jcem-consent-blocker no-print";
  blocker.setAttribute("role", "dialog"); blocker.setAttribute("aria-modal", "true"); blocker.setAttribute("aria-label", "Consentimento de cookies essenciais");
  blocker.innerHTML = `<section><h2>Cookies essenciais</h2><p>${config.text}</p><p><a href="${config.privacyUrl}" target="_blank" rel="noopener noreferrer">Política de privacidade</a></p><div><button data-consent-accept>${config.acceptLabel}</button><button data-consent-reject>${config.rejectLabel}</button></div><p data-consent-status aria-live="polite"></p></section>`;
  document.body.appendChild(blocker);
  blocker.querySelector("[data-consent-accept]")?.addEventListener("click", () => { localStorage.setItem(config.storageKey, "accepted"); blocker.remove(); });
  blocker.querySelector("[data-consent-reject]")?.addEventListener("click", () => { const status = blocker.querySelector<HTMLElement>("[data-consent-status]"); if (status) status.textContent = "A recusa mantém o uso bloqueado. Aceite para continuar."; });
}

void init();
