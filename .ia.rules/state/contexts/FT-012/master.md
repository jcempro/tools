# Contexto mestre - FT-012

## Identidade e autorizacao

- FT: `FT-012`.
- Fase: concluida; aguardando apenas sincronizacao final de rastreabilidade apos o commit material.
- Autorizacao humana: recebida em 2026-08-26, explicitamente para executar a FT-012 completamente, depois do commit normativo `bf93351`.
- Fontes: `TODO.ia.md`, `RCF.md`, `src/declaracoes/unificada/RCF.md`, `.ia.rules/state/evidencias/UNIFICADA.odt` e `.ia.rules/state/evidencias/Evidencia-Marcas-Unificadas.pdf`.

## Ordem de execucao

1. Transcrever os seis blocos cinza autorizados, registrar normalizacoes sintaticas e compilar Markdown no build.
2. Criar configuracao validada, logo `DU`, pagina, estilos, modelo de dados e GUI.
3. Integrar catalogo, folha, Web, Bundle, favicons, persistencia, compartilhamento, importacao/exportacao, impressao e PDF.
4. Validar conteudo, testes, build, publicacao, visual, Ctrl+P e PDF.
5. Criar commit material, finalizar rastreabilidade em commit exclusivo e concluir FT/TODO.

## Restricoes

- Somente `Tabela1`, `Tabela2`, `Tabela4`, `Tabela6`, `Tabela8` e `Tabela9` do ODT integram os Markdown; tabelas internas pertencem ao respectivo bloco.
- Correcao textual limita-se a defeito sintatico mecanico inequivoco e exige registro origem -> Markdown.
- Logos existentes permanecem intocados; o novo logo e SVG original com monograma legivel `DU`.
- Nenhuma evidencia fonte sera alterada ou publicada.
- Especializacoes do formulario permanecem locais; infraestrutura global somente recebe integracao declarada.

## Aceite global

- Os 72 itens pendentes do mapa RCF possuem implementacao material no commit tecnico.
- Web e Bundle sao equivalentes e autocontidos; Markdown fonte nao e publicado.
- Fluxos minimo, nominal e invalido sao cobertos por teste; impressao e PDF nao cortam nem sobrepoem cabecalho, corpo ou rodape.
- `npm run validate:all`, testes especificos, auditoria de conteudo e inspecao visual aprovam.

## Estado

- Ativacao e leitura normativa: concluidas.
- Implementacao: concluida.
- Validacao automatizada: `npm run validate:all` aprovado com 57 testes, quatro Bundles e publicacao de 5 paginas/76 arquivos.
- Validacao visual: Chromium aprovado com seis paginas A4 de 794 x 1123 px, zero transbordamento e fluxo nominal PF/PJ pronto para saida.
- Rastreabilidade final: pendente exclusivamente do SHA do commit material, a ser sincronizado em commit isolado.
