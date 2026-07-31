/**
 * tools.jcem.pro - JeanCarloEM
 * https://github.com/JeanCarloEM/tools.jcem.pro
 * Mozilla Public License 2.0 - https://www.mozilla.org/MPL/2.0/
 * Especializacao local do lifecycle de publicacao estatica.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

/** Executa o orquestrador autoritativo do projeto e propaga sua falha ao lifecycle. */
function execute(context) {
  const script = path.join(context.rootDir, "scripts", "publish-project.mjs");
  const result = spawnSync(process.execPath, [script, ...context.args], {
    cwd: context.rootDir,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`PUBLICACAO_LOCAL_FALHOU:${result.signal || result.status}`);
  return { published: true };
}

module.exports = { execute };
