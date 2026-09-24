# Subcontexto 01 - Similaridade no Conversor CSV

- Fase: contrato FT-028; codigo FT-029.
- Objetivo: detectar provaveis duplicidades com metrica, campos, limiar, explicacao e revisao definidos.
- Entradas: TODO raiz, `src/csv-bd/RCF.md`, configuracao, UI, motor tabular e testes.
- Dependencias: FTs 024/025; deduplicacao exata e cardinalidade multipla preservadas.
- Fora de escopo: remocao automatica silenciosa, heuristica sem contrato e configuracao ativa antecipada.
- Validacao: determinismo, falsos positivos/negativos, explicabilidade, opt-in, Web e Bundle.
- Decisao: comparação Levenshtein normalizada por uma a três colunas textuais escolhidas explicitamente, média simples e limiar central `0.90`; resultado somente consultivo, explicável e sem mutação automática.
- Estado: contrato concluído; FT-029 bloqueada até nova autorização humana posterior ao commit normativo.
