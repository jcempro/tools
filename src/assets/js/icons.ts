import upgradeIcon from "@iconify-icons/game-icons/upgrade";
import downloadBoxIcon from "@iconify-icons/streamline-sharp/download-box-1-solid";
import {
  faBars,
  faBoxOpen,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleDown,
  faEllipsisVertical,
  faEraser,
  faFileArrowDown,
  faFileArrowUp,
  faFilePdf,
  faFloppyDisk,
  faFolderOpen,
  faPaperPlane,
  faPenToSquare,
  faPrint,
  faStamp
} from "@fortawesome/free-solid-svg-icons";
import { Moon as moonIcon, Sun as sunIcon } from "@lucide/icons";
import iconConfig from "../config/icons.json";

type FaIconDefinition = {
  icon: [number, number, Array<number | string>, string, string | string[]];
  iconName: string;
  prefix: string;
};

type IconifyData = { body: string; height?: number; width?: number };
type LucideNode = [string, Record<string, string>] | [string, Record<string, string>, LucideNode[]];
type LucideData = { name: string; node: LucideNode[] } & ({ size: number } | { height: number; width: number });
type IconProvider = "fontawesome" | "iconify" | "lucide";
type IconNode = Readonly<{ attributes: Readonly<Record<string, string>>; tag: string }>;
type IconDefinition = Readonly<{
  collection?: string;
  identity: string;
  name: string;
  nodes: readonly IconNode[];
  provider: IconProvider;
  rootAttributes: Readonly<Record<string, string>>;
  viewBox: string;
}>;

const allowedTags = new Set(["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"]);
const allowedAttributes = new Set([
  "clip-rule", "cx", "cy", "d", "fill", "fill-opacity", "fill-rule", "height", "points", "r", "rx", "ry",
  "stroke", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "width", "x", "x1", "x2", "y", "y1", "y2"
]);
const definitions = new Map<string, IconDefinition>();
const fontAwesomeAliases = new Map<string, string>();

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function freezeNode(tag: string, attributes: Record<string, string>): IconNode {
  if (!allowedTags.has(tag)) throw new Error(`Elemento SVG nao permitido: ${tag}`);
  const safe: Record<string, string> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (name === "key") continue;
    if (!allowedAttributes.has(name) || /^on/i.test(name) || /(?:javascript:|url\s*\(|https?:)/i.test(value)) {
      throw new Error(`Atributo SVG nao permitido: ${name}`);
    }
    safe[name] = value;
  }
  return Object.freeze({ attributes: Object.freeze(safe), tag });
}

function register(definition: IconDefinition): void {
  if (definitions.has(definition.identity)) throw new Error(`Identidade de icone duplicada: ${definition.identity}`);
  definitions.set(definition.identity, Object.freeze(definition));
}

function registerFontAwesome(definition: FaIconDefinition): void {
  const identity = `fontawesome:${definition.iconName}`;
  const paths = Array.isArray(definition.icon[4]) ? definition.icon[4] : [definition.icon[4]];
  register({
    identity,
    name: definition.iconName,
    nodes: Object.freeze(paths.map((path) => freezeNode("path", { d: path, fill: "currentColor" }))),
    provider: "fontawesome",
    rootAttributes: Object.freeze({}),
    viewBox: `0 0 ${definition.icon[0]} ${definition.icon[1]}`
  });
  const aliases = [definition.iconName, `${definition.prefix}:${definition.iconName}`, definition.icon[3], ...definition.icon[2]];
  for (const alias of aliases) fontAwesomeAliases.set(`${alias}`.toLowerCase(), identity);
}

function registerLucide(data: LucideData): void {
  const width = "size" in data ? data.size : data.width;
  const height = "size" in data ? data.size : data.height;
  register({
    identity: `lucide:${data.name}`,
    name: data.name,
    nodes: Object.freeze(data.node.map(([tag, attributes, children]) => {
      if (children?.length) throw new Error(`SVG Lucide aninhado nao permitido: ${data.name}`);
      return freezeNode(tag, attributes);
    })),
    provider: "lucide",
    rootAttributes: Object.freeze({ fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2" }),
    viewBox: `0 0 ${width} ${height}`
  });
}

function registerIconify(collection: string, name: string, data: IconifyData): void {
  if (!Number.isFinite(data.width) || !Number.isFinite(data.height) || !data.body.trim()) throw new Error(`Dados Iconify invalidos: ${collection}:${name}`);
  const parsed = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${data.body}</svg>`, "image/svg+xml");
  if (parsed.querySelector("parsererror")) throw new Error(`SVG Iconify invalido: ${collection}:${name}`);
  const nodes: IconNode[] = [];
  for (const child of Array.from(parsed.documentElement.children)) {
    const attributes = Object.fromEntries(Array.from(child.attributes).map(({ name: key, value }) => [key, value]));
    if (child.children.length > 0 || child.textContent?.trim()) throw new Error(`SVG Iconify aninhado nao permitido: ${collection}:${name}`);
    nodes.push(freezeNode(child.localName, attributes));
  }
  register({
    collection,
    identity: `iconify:${collection}:${name}`,
    name,
    nodes: Object.freeze(nodes),
    provider: "iconify",
    rootAttributes: Object.freeze({}),
    viewBox: `0 0 ${data.width} ${data.height}`
  });
}

[
  faBars, faBoxOpen, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCircleDown, faEllipsisVertical,
  faEraser, faFileArrowDown, faFileArrowUp, faFilePdf, faFloppyDisk, faFolderOpen, faPaperPlane, faPenToSquare, faPrint, faStamp
].forEach(registerFontAwesome);
registerLucide(moonIcon);
registerLucide(sunIcon);
registerIconify("game-icons", "upgrade", upgradeIcon);
registerIconify("streamline-sharp", "download-box-1-solid", downloadBoxIcon);

const configuredIdentities = new Set(iconConfig.icons.map(({ identity }) => identity));
if (configuredIdentities.size !== definitions.size || [...configuredIdentities].some((identity) => !definitions.has(identity))) {
  throw new Error("Catalogo e definicoes de icones divergentes.");
}
for (const { identity, licenseId } of iconConfig.icons) {
  if (!(licenseId in iconConfig.licenses)) throw new Error(`Licenca de icone ausente: ${identity}`);
}

function canonicalIdentity(ref: ToolbarIconRef | string): string {
  if (typeof ref === "string") {
    const alias = fontAwesomeAliases.get(ref.toLowerCase());
    if (alias) return alias;
    if (/^(?:fontawesome|lucide):[^:]+$/.test(ref) || /^iconify:[^:]+:[^:]+$/.test(ref)) return ref;
    throw new Error(`Identidade de icone invalida: ${ref}`);
  }
  if (ref.provider) {
    if (!ref.name || (ref.provider === "iconify" && !ref.collection) || (ref.provider !== "iconify" && ref.collection)) {
      throw new Error("Referencia de icone malformada.");
    }
    return ref.provider === "iconify" ? `iconify:${ref.collection}:${ref.name}` : `${ref.provider}:${ref.name}`;
  }
  const legacy = [ref.identifier, ref.iconName, ref.unicode].find(Boolean);
  if (!legacy) throw new Error("Referencia de icone vazia.");
  const identity = fontAwesomeAliases.get(legacy.toLowerCase());
  if (!identity) throw new Error(`Alias Font Awesome inexistente: ${legacy}`);
  return identity;
}

function resolve(ref: ToolbarIconRef | string): IconDefinition {
  const identity = canonicalIdentity(ref);
  const definition = definitions.get(identity);
  if (!definition) throw new Error(`Icone nao cadastrado: ${identity}`);
  return definition;
}

function render(ref: ToolbarIconRef | string): string {
  const definition = resolve(ref);
  const rootAttributes = Object.entries(definition.rootAttributes).map(([name, value]) => `${name}="${escapeAttribute(value)}"`).join(" ");
  const nodes = definition.nodes.map(({ attributes, tag }) => {
    const rendered = Object.entries(attributes).map(([name, value]) => `${name}="${escapeAttribute(value)}"`).join(" ");
    return `<${tag}${rendered ? ` ${rendered}` : ""}></${tag}>`;
  }).join("");
  const classes = `jcem-icon jcem-fa-icon jcem-icon--${definition.provider}`;
  const collection = definition.collection ? ` data-icon-collection="${escapeAttribute(definition.collection)}"` : "";
  return `<svg class="${classes}" aria-hidden="true" focusable="false" role="img" data-icon-provider="${definition.provider}" data-icon-name="${escapeAttribute(definition.name)}"${collection} viewBox="${definition.viewBox}" xmlns="http://www.w3.org/2000/svg"${rootAttributes ? ` ${rootAttributes}` : ""}>${nodes}</svg>`;
}

window.JCEMIcons = Object.freeze({
  catalog: Object.freeze(iconConfig.icons.map(({ identity, licenseId }) => Object.freeze({ identity, licenseId }))),
  render,
  resolve
});
