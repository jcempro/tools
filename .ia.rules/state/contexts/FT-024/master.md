# Contexto mestre FT-024/FT-025 - Cardinalidade da mesclagem CSV

- Identidade: FT-024 normativa e FT-025 de código.
- Ordem: captura -> RCF -> validação normativa -> autorização humana posterior -> código -> validação integral -> rastreabilidade.
- Estado: implementação e validação integral concluídas; commit material, rastreabilidade e fechamento da FT-025 em andamento.
- Objetivo: substituir a premissa 1:1 da mesclagem por associações legítimas 1:N e N:N, com deduplicação somente exata e normalização bilateral do indexador.
- Entradas: solicitação canônica; `src/csv-bd/RCF.md`; `src/assets/js/tabular.ts`; `tests/tools-bd.test.ts`; FT-020/FT-021.
- Dependências: FT-024 deve concluir e ser commitada antes de autorização e início da FT-025.
- Normas herdadas: preservação dos três modos, indexador comum único, conflitos de coluna, resultado anterior em falha, Web/Bundle e contratos não relacionados.
- Restrições: nenhuma heurística de similaridade nesta implementação; chaves distintas não podem se associar; registros legítimos não podem ser descartados ou colapsados.
- Entregáveis normativos: cardinalidade por produto de correspondências dentro da mesma chave; deduplicação exata; normalização por tipo; feature futura de similaridade registrada no RCF e no `TODO.ia.md`, sem algoritmo incompleto.
- Entregáveis técnicos: núcleo de agrupamento multivalorado, pareamento 1:N/N:N determinístico, testes das três políticas, normalização bilateral e não regressão.
- Aceite global: a mensagem de chave materialmente distinta deixa de existir como bloqueio; todas as correspondências válidas permanecem; duplicatas exatas são consolidadas; validação integral aprova.

## Handoff normativo

- Implementar `Map<chave, linhas[]>` com deduplicação pelo vetor canônico exato, sem emissão de `ambiguous-merge-key` por multiplicidade.
- Gerar pares dentro da mesma chave: no modo `previous`, cada linha esquerda cruza com todas as direitas; no modo `merge-only`, cada direita cruza com todas as esquerdas; em `summed`, preservar produto e linhas sem par conforme o RCF.
- Normalizar telefone para dígitos e identificador genérico para a sequência canônica de letras/dígitos após Unicode/caixa e remoção de formatação.
- Manter conflitos de coluna, schema/indexador inválido, resultado prévio em falha, serialização e interface sem alteração extrínseca.
- Não criar limiar, opção, heurística ou dependência de similaridade nesta implementação.
