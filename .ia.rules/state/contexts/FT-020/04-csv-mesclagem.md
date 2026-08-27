# Subcontexto 04 - Mesclagem opcional do Conversor CSV

- Fase: concluída na FT-021.
- Objetivo: associar colunas complementares por exatamente um indexador comum após a conversão vigente, com políticas Resultado prévio, Somente mesclar e Somadas.
- Entradas: RCF local, GUI CSV, núcleo tabular, configuração de identificadores, normalização de telefone, importação/exportação e testes.
- Restrições: ambiguidades e conflitos bloqueiam; indexador não duplica; correspondência é determinística; estágio permanece opcional; seleção altera somente preservação de linhas.
- Entregáveis: contrato de indexador, cardinalidade, colisões de coluna, chaves duplicadas, três políticas de linha, avisos e resultado definitivo.
- Estado: implementado e validado; núcleo compartilhado, entrada opcional, indexador único, bloqueios e três políticas de linha materializados.
- Aceite: sem transbordamento entre chaves, sem linhas indevidas, sem perda do fluxo atual e exportação baseada no resultado mesclado.

## Handoff

- Implementar o núcleo reutilizável em `tabular.ts` e deixar `bd.ts` responsável apenas por interface/orquestração; usar parser e normalizadores vigentes, bloquear chave ambígua ou conflito de valores e tornar o dataset mesclado a única fonte de resumo/serialização/download.
