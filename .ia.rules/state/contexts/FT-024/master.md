# Contexto mestre FT-024/FT-025 - Cardinalidade da mesclagem CSV

- Identidade: FT-024 normativa e FT-025 de código.
- Ordem: captura -> RCF -> validação normativa -> autorização humana posterior -> código -> validação integral -> rastreabilidade.
- Estado: fonte capturada; normatização pendente.
- Objetivo: substituir a premissa 1:1 da mesclagem por associações legítimas 1:N e N:N, com deduplicação somente exata e normalização bilateral do indexador.
- Entradas: solicitação canônica; `src/csv-bd/RCF.md`; `src/assets/js/tabular.ts`; `tests/tools-bd.test.ts`; FT-020/FT-021.
- Dependências: FT-024 deve concluir e ser commitada antes de autorização e início da FT-025.
- Normas herdadas: preservação dos três modos, indexador comum único, conflitos de coluna, resultado anterior em falha, Web/Bundle e contratos não relacionados.
- Restrições: nenhuma heurística de similaridade nesta implementação; chaves distintas não podem se associar; registros legítimos não podem ser descartados ou colapsados.
- Entregáveis normativos: cardinalidade por produto de correspondências dentro da mesma chave; deduplicação exata; normalização por tipo; feature futura de similaridade sem algoritmo incompleto.
- Entregáveis técnicos: núcleo de agrupamento multivalorado, pareamento 1:N/N:N determinístico, testes das três políticas, normalização bilateral e não regressão.
- Aceite global: a mensagem de chave materialmente distinta deixa de existir como bloqueio; todas as correspondências válidas permanecem; duplicatas exatas são consolidadas; validação integral aprova.
