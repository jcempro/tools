# Subcontexto 02 - Composição das Declarações Unificadas

- Fase: concluída na FT-021.
- Objetivo: tornar centralmente configuráveis a reserva de assinatura de `1 cm` e o parágrafo de cabeçalho, preservando uma linha própria somente para local/data.
- Entradas: RCF local, configuração `declaracoes-unificada.json`, renderizador, paginação, SCSS e testes.
- Restrições: reutilizar a sintaxe fechada de tokens; não permitir HTML/interpolação arbitrária; manter paginação e frase institucional no mesmo parágrafo contínuo e justificado.
- Entregáveis: contratos de configuração, tokens, validação, composição, impressão e PDF.
- Estado: implementado e validado; template integral fechado, parágrafo contínuo e reserva central de assinatura em `1 cm` materializados.
- Aceite: espaçamento efetivo, nenhum parágrafo voluntário indevido, template único configurável e igualdade entre Web, Ctrl+P e PDF.

## Handoff

- Substituir `document.headerStatement` por `document.headerTemplate` integral, reutilizar o resolvedor fechado de `${token}`, manter local/data em parágrafo próprio e atualizar `footer.signatureReserveCm` de `0.7` para `1` sem constante concorrente.
