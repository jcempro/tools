type AppEntry = { description: string; href: string; id: string; logo: string; title: string };
type AppCatalog = { apps: AppEntry[]; defaultApp: string | null; navigationPosition: "left" | "right" };

function publicHref(href: string): string {
  const upstream = ["https://tools", "jcem", "pro"].join(".");
  return location.protocol === "file:" ? `${upstream}${href}` : href;
}

function render(catalog: AppCatalog): void {
  const grid = document.querySelector<HTMLElement>("[data-app-grid]");
  if (!grid) return;
  document.documentElement.dataset.navPosition = catalog.navigationPosition;
  grid.innerHTML = catalog.apps.map((app) => `<a class="jcem-app-card" href="${publicHref(app.href)}"><img class="jcem-app-icon" src="${app.logo}" alt=""><span><strong>${app.title}</strong><small>${app.description}</small></span></a>`).join("");
  if (catalog.defaultApp) {
    const selected = catalog.apps.find((app) => app.id === catalog.defaultApp);
    if (selected) location.replace(publicHref(selected.href));
  }
}

function applyTheme(theme: "dark" | "light"): void {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("jcem-theme", theme); } catch { /* PROTECAO: tema continua funcional sem persistencia. */ }
  const button = document.querySelector<HTMLButtonElement>("[data-dashboard-theme]");
  if (button && window.JCEMIcons) {
    const target = theme === "dark" ? "light" : "dark";
    const label = target === "dark" ? "Ativar tema escuro" : "Ativar tema claro";
    button.innerHTML = window.JCEMIcons.render({ name: target === "dark" ? "moon" : "sun", provider: "lucide" });
    button.setAttribute("aria-label", label);
    button.title = label;
  }
}

function initTheme(): void {
  const button = document.querySelector<HTMLButtonElement>("[data-dashboard-theme]");
  let stored: string | null = null;
  try { stored = localStorage.getItem("jcem-theme"); } catch { /* PROTECAO: usa preferencia do sistema. */ }
  const media = matchMedia("(prefers-color-scheme: dark)");
  applyTheme(stored === "dark" || stored === "light" ? stored : (media.matches ? "dark" : "light"));
  button?.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  media.addEventListener("change", (event) => {
    let preference: string | null = null;
    try { preference = localStorage.getItem("jcem-theme"); } catch { /* PROTECAO: acompanha o sistema sem armazenamento. */ }
    if (preference !== "dark" && preference !== "light") applyTheme(event.matches ? "dark" : "light");
  });
}

initTheme();

fetch("/assets/config/apps.json").then((response) => response.json()).then(render).catch(() => {
  document.querySelector<HTMLElement>("[data-app-grid]")?.setAttribute("data-load-error", "true");
});
