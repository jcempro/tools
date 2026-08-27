# Contexto mestre - FT-022/FT-023

- Identidade: refinamento cirúrgico do rodapé das Declarações Unificadas.
- Ordem: FT-022 normatiza; FT-023 materializa somente após autorização humana posterior ao commit normativo.
- Fonte: `.ia.rules/state/requests/FT-022/request.md` e `evidencia.png` no mesmo diretório.
- Escopo: configuração central do módulo, composição HTML segura do rodapé, estilos locais, testes e artefatos derivados correspondentes.
- Objetivo: distinguir semanticamente o marcador de qualificação do marcador de referência e eliminar o recuo estrutural produzido nas quebras do parágrafo justificado.
- Entradas: RCF específico, `declaracoes-unificada.json`, `unificada.ts`, `unificada.scss`, testes e pipeline Web/Bundle/impressão.
- Dependências: FT-011, FT-012, FT-015, FT-020 e FT-021 concluídas; nenhuma decisão recusada local elegível registrada.
- Restrições: preservar templates, numeração, vínculos, paginação, tipografia, folha, impressão, responsividade, conteúdo e demais estilos; não usar regra dependente da frase exibida na evidência.
- Fora de escopo: mudanças no corpo das declarações, GUI, identidade visual, regras globais de impressão ou outros módulos.
- Entregáveis: RCF preciso; marcadores contextuais; configuração do cinza; testes de DOM/CSS, quebras e regressão; validação integral.
- Estado: captura, triagem, normatização e implementação concluídas; FT-023 validada e aguardando commit material e sincronização da rastreabilidade.
- Aceite global: qualificação em `sup`, negrito, fundo cinza 20% configurável e `[ N ]` indivisível; referência em negrito sem `sup`/fundo; linhas justificadas sem recuo artificial; Web, Bundle, impressão e responsividade preservados.

## Diagnóstico inicial

- `footerMarkup()` escapa a linha inteira e substitui todo padrão `[n]` pela mesma classe `.du-index`, portanto perde a distinção entre `${numero}` da qualificação e `${representantes}` da referência.
- `.du-index` usa `inline-block` com `padding-inline` e `margin-inline`; quando o primeiro marcador migra para a linha seguinte, a margem externa continua ocupando o início da linha e produz o recuo demonstrado.
- A correção generalizável deve compor markup por token/contexto antes da junção do parágrafo e concentrar o espaçamento visual dentro do marcador, sem margem externa inicial.

## Handoff normativo

- O RCF diferencia o `sup` de qualificação da referência textual em negrito comum e centraliza o novo fundo inicial `#cccccc` em `footer.indexBackground`.
- O alinhamento é protegido pela proibição de margem inicial, indentação e blocos intermediários; a separação configurável permanece somente após o marcador de qualificação.
- Sete sentenças materiais estão registradas para a FT-023 como `[PENDENTE-CODIGO]`, vinculadas à configuração, compilador, TypeScript, SCSS e testes locais.
- Type-check, lint, 64 testes e rastreabilidade `232/232` foram aprovados na fase normativa.

## Implementação e validação da FT-023

- A autorização humana posterior ao commit normativo `b90ccfc` foi recebida em 2026-08-27T13:55:23-03:00.
- `${numero}` materializa literalmente `<sup><strong>&nbsp;[&nbsp;N&nbsp;]&nbsp;</strong></sup>`; `${representantes}` produz `<strong class="du-index-reference">[N]</strong>` sem substituição textual global.
- Os templates centrais não duplicam colchetes; `footer.indexBackground` usa `#cccccc`, validado no compilador e no runtime, e a margem configurável incide somente após o qualificador.
- Web e Bundle exibiram DOM, estilos computados e largura indivisível equivalentes; quebras com nomes nominal e longo moveram o marcador completo e mantiveram o limite esquerdo do parágrafo.
- O PDF dedicado real foi renderizado e inspecionado nas seis páginas, sem corte, sobreposição, página residual ou divergência de qualificação/referência; o contrato Ctrl+P permaneceu coberto pela mesma árvore, pelo `@media print` e pelos testes globais.
- A tentativa adicional por Chrome headless não produziu PDF e não encerrou autonomamente; os processos e perfis temporários foram removidos, sem erro do produto ou evidência nova que justifique repetir essa rota.
- `npm run validate:all` aprovou type-check, lint, 68 testes, Web, quatro Bundles offline e publicação de 6 páginas/80 arquivos.
