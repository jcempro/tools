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
- Estado: captura e triagem concluídas; FT inicial em preparação.
- Aceite global: qualificação em `sup`, negrito, fundo cinza 20% configurável e `[ N ]` indivisível; referência em negrito sem `sup`/fundo; linhas justificadas sem recuo artificial; Web, Bundle, impressão e responsividade preservados.

## Diagnóstico inicial

- `footerMarkup()` escapa a linha inteira e substitui todo padrão `[n]` pela mesma classe `.du-index`, portanto perde a distinção entre `${numero}` da qualificação e `${representantes}` da referência.
- `.du-index` usa `inline-block` com `padding-inline` e `margin-inline`; quando o primeiro marcador migra para a linha seguinte, a margem externa continua ocupando o início da linha e produz o recuo demonstrado.
- A correção generalizável deve compor markup por token/contexto antes da junção do parágrafo e concentrar o espaçamento visual dentro do marcador, sem margem externa inicial.

