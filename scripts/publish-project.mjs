/**
 * tools.jcem.pro - JeanCarloEM
 * https://github.com/JeanCarloEM/tools.jcem.pro
 * Mozilla Public License 2.0 - https://www.mozilla.org/MPL/2.0/
 * Integra e confirma a revisao publicada pelo GitHub Pages.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectConfig } from "./config.mjs";
import { preparePublication } from "./publish-pages.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Executa um comando com saida capturada e erro contextualizado. */
export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    env: options.env ?? process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  const status = result.status ?? 1;
  if (result.error) throw result.error;
  if (!(options.acceptedStatuses ?? [0]).includes(status)) {
    const detail = `${result.stderr || result.stdout || ""}`.trim();
    throw new Error(`Comando falhou (${command} ${args.join(" ")}): ${detail || status}`);
  }
  return { status, stdout: `${result.stdout || ""}`.trim(), stderr: `${result.stderr || ""}`.trim() };
}

/** Consulta ancestralidade sem transformar a resposta negativa esperada em excecao. */
function isAncestor(run, ancestor, descendant) {
  return run("git", ["merge-base", "--is-ancestor", ancestor, descendant], { acceptedStatuses: [0, 1] }).status === 0;
}

/** Rejeita estado local ou remoto que exigiria sobrescrita ou reconciliacao implicita. */
function assertPreconditions(run, publication) {
  const branch = run("git", ["branch", "--show-current"]).stdout;
  if (branch !== publication.developmentBranch) throw new Error(`PUBLICACAO_EXIGE_BRANCH:${publication.developmentBranch}`);
  if (run("git", ["status", "--porcelain"]).stdout) throw new Error("PUBLICACAO_EXIGE_ARVORE_LIMPA");

  for (const ref of [
    `refs/heads/${publication.developmentBranch}`,
    `refs/heads/${publication.primaryBranch}`,
    `refs/remotes/${publication.remote}/${publication.developmentBranch}`,
    `refs/remotes/${publication.remote}/${publication.primaryBranch}`
  ]) run("git", ["show-ref", "--verify", ref]);

  if (!isAncestor(run, `${publication.remote}/${publication.developmentBranch}`, publication.developmentBranch)) {
    throw new Error(`DEV_REMOTO_DIVERGENTE:${publication.remote}/${publication.developmentBranch}`);
  }
  if (!isAncestor(run, `${publication.remote}/${publication.primaryBranch}`, publication.primaryBranch)) {
    throw new Error(`PRIMARIA_REMOTA_DIVERGENTE:${publication.remote}/${publication.primaryBranch}`);
  }
  return branch;
}

/** Integra desenvolvimento na primaria sem reescrever historico. */
function integrateDevelopment(run, publication) {
  const { developmentBranch, primaryBranch } = publication;
  if (isAncestor(run, developmentBranch, primaryBranch)) return "already-integrated";
  if (isAncestor(run, primaryBranch, developmentBranch)) {
    run("git", ["merge", "--ff-only", developmentBranch]);
    return "fast-forward";
  }
  run("git", ["merge", "--no-edit", developmentBranch]);
  return "merge";
}

/** Aguarda o indexador publico refletir exatamente a revisao enviada. */
export async function waitForDeployment({ fetchImpl = fetch, now = Date.now, publication, publicBaseUrl, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), expectedHash }) {
  const endpoint = new URL(publication.versionIndex, publicBaseUrl);
  const deadline = now() + publication.deploymentTimeoutMs;
  let lastHash = "indisponivel";

  while (now() <= deadline) {
    try {
      endpoint.searchParams.set("t", `${now()}`);
      const response = await fetchImpl(endpoint, { cache: "no-store", signal: AbortSignal.timeout(publication.deploymentRequestTimeoutMs) });
      if (response.ok) {
        const payload = await response.json();
        lastHash = `${payload?.hash ?? "invalido"}`.toLowerCase();
        if (lastHash === expectedHash) return endpoint.href;
      } else {
        lastHash = `HTTP ${response.status}`;
      }
    } catch (error) {
      lastHash = error instanceof Error ? error.message : `${error}`;
    }
    await sleep(publication.deploymentPollMs);
  }
  throw new Error(`GITHUB_PAGES_NAO_CONFIRMADO:${expectedHash}:${lastHash}`);
}

/** Executa validacao, sincronizacao Git, integracao, push e confirmacao publica. */
export async function publishRepository({ config, fetchImpl, now, rootDir = root, run = runCommand, sleep, validate = () => preparePublication(process.env, []) }) {
  const git = (command, args, options = {}) => run(command, args, { cwd: rootDir, ...options });
  const { publication } = config;
  const initialBranch = git("git", ["branch", "--show-current"]).stdout;
  if (initialBranch !== publication.developmentBranch) throw new Error(`PUBLICACAO_EXIGE_BRANCH:${publication.developmentBranch}`);
  if (git("git", ["status", "--porcelain"]).stdout) throw new Error("PUBLICACAO_EXIGE_ARVORE_LIMPA");
  await validate();
  let switched = false;

  try {
    git("git", ["fetch", publication.remote, "--prune"]);
    assertPreconditions(git, publication);
    git("git", ["push", publication.remote, `${publication.developmentBranch}:${publication.developmentBranch}`]);
    git("git", ["switch", publication.primaryBranch]);
    switched = true;
    const integration = integrateDevelopment(git, publication);
    const expectedHash = git("git", ["rev-parse", "HEAD"]).stdout.toLowerCase();
    git("git", ["push", publication.remote, `${publication.primaryBranch}:${publication.primaryBranch}`]);
    git("git", ["switch", initialBranch]);
    switched = false;
    const deployedUrl = await waitForDeployment({ expectedHash, fetchImpl, now, publication, publicBaseUrl: config.site.publicBaseUrl, sleep });
    return { deployedUrl, expectedHash, integration };
  } catch (error) {
    if (switched) {
      git("git", ["merge", "--abort"], { acceptedStatuses: [0, 128] });
      git("git", ["switch", initialBranch]);
    }
    throw error;
  }
}

/** Entrada CLI do hook local. */
async function main() {
  const config = await loadProjectConfig();
  const result = await publishRepository({ config });
  console.log(`GitHub Pages confirmado em ${result.deployedUrl} (${result.expectedHash}; ${result.integration}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
