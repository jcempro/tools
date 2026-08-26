# Handoff - FT-011 para FT-012

## Decisoes

- Modulo e rota: `declaracoes-unificada` em `src/declaracoes/unificada/` e `/declaracoes/unificada/`.
- Conteudo: seis Markdown individuais, ordem e identidade por manifesto, compilacao deterministica em build e ausencia de `.md` no runtime.
- Dados: data atual editavel; municipio/UF com padrao Pirassununga-SP; declarantes PF/PJ com ids estaveis; PJ referencia um ou mais declarantes anteriores.
- Saida: PFs primeiro, PJs depois com representantes; indices automaticos; cabecalho e rodape repetidos; paginacao A4 multipagina pelo contrato global.
- Configuracao: frases, templates, fundo e espacamentos em `src/assets/config/declaracoes-unificada.json`, sem texto livre correspondente na GUI.

## Arquivos normativos

- `src/declaracoes/unificada/RCF.md`.
- `README.md`.
- `.ia.rules/state/traceability/rcf-map.json`.
- `TODO.ia.md` e `.ia.rules/continue.ia`.

## Efeitos posteriores

- A FT-012 deve transcrever fielmente o ODT, materializar a configuracao central, integrar catalogo/perfil/build/Bundle e finalizar as 63 assinaturas causais somente apos o commit material.
- A implementacao deve produzir evidencias visuais temporarias para Web, primeira/intermediaria/ultima pagina, Ctrl+P e PDF, removendo-as apenas depois do aceite.

## Riscos e impedimentos

- Logo definitivo ausente; nao inventar identidade visual sem autorizacao.
- Conteudo longo exige paginacao baseada em medicao real, com rodape variavel por declarantes.
- Transcricao nao pode corrigir possiveis erros do ODT por inferencia.

## Validacoes concluídas

- Rastreabilidade: 63 entradas `pending`, 63 sentencas materiais.
- Pipeline integral: type-check, lint, 52 testes, Web, tres Bundles e publicacao local aprovados.
- Implementacao funcional: nao iniciada.
