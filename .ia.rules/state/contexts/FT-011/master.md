# Contexto-mestre - FT-011 e FT-012

## Identidade e fonte

- Objetivo unico: entregar o formulario documental de declaracoes unificadas como novo modulo nativo do projeto.
- Fonte operacional: `TODO.ia.md`, item iniciado em 2026-08-26.
- Evidencia de conteudo: `.ia.rules/state/evidencias/UNIFICADA.odt`.
- Evidencia visual e funcional: `.ia.rules/state/evidencias/Evidencia-Marcas-Unificadas.pdf`.
- Fases: FT-011 normatiza; FT-012 implementa somente apos nova autorizacao humana.

## Mapa e arquitetura

1. Conteudo juridico/documental imutavel, individualizado em Markdown e compilado no build.
2. Modulo Web estatico com GUI para localidade, data, declarantes PF/PJ e representantes.
3. Renderizacao multipagina com cabecalho e rodape repetidos, numeracao e referencias deterministicas.
4. Consumo da infraestrutura global para chrome, workspace, autosave, importacao/exportacao, compartilhamento, impressao, PDF, validadores e bundle.
5. Especializacoes locais limitadas ao conteudo, dados, templates e desenho interno das paginas.

## Relacoes e ordem

- O RCF global prevalece e nao recebe especializacoes exclusivas do formulario.
- O RCF local deriva das duas evidencias e governa a implementacao futura.
- A compilacao Markdown precede a composicao Web/Bundle.
- Declarantes recebem identidade estavel antes da numeracao visual.
- Representantes de PJ referenciam somente declarantes anteriores, impedindo referencia futura ou ciclo.
- A paginacao ocorre apos conteudo e rodape estarem resolvidos e antes de Ctrl+P/PDF.

## Aceite global

- Rastreabilidade TODO -> FT-011/FT-012 -> RCF local -> artefatos futuros.
- Conteudo e ordem do ODT preservados sem edicao pela GUI.
- Marcas da evidencia cobertas sem propagar regras locais aos modulos existentes.
- Nenhuma implementacao funcional durante a FT-011.

## Estado

- Auditoria e equalizacao: concluidas.
- FT-011: em andamento.
- FT-012: pendente e bloqueada por fase/autorizacao.
