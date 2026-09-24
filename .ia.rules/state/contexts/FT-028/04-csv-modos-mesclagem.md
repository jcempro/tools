# Subcontexto 04 - Modos de conversao e mesclagem CSV

- Fase: contrato FT-034; codigo FT-035.
- Objetivo: tornar conversao e merge independentes/combinaveis e oferecer estrategias tabulares em linguagem orientada a resultado.
- Entradas: TODO raiz, `src/csv-bd/RCF.md`, UI, motor tabular, configuracao e testes.
- Dependencias: FTs 024/025; integridade de indice, chave, cardinalidade e precedencia preservada.
- Fora de escopo: estrategia sem semantica completa ou abstracao especulativa.
- Validacao: modos isolados/combinados, cada estrategia, correspondencias, conflitos, CSS contextual, acessibilidade e Web/Bundle.
- Decisao: três operações independentes e cinco resultados (`left`, `right`, `inner`, `full`, `append`) com rótulos não técnicos, dobra ordenada para múltiplos arquivos, chave confirmada e conflito sempre bloqueante.
- Estado: contrato concluído; FT-035 bloqueada até nova autorização humana posterior ao commit normativo.
