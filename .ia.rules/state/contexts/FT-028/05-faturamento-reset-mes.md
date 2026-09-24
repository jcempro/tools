# Subcontexto 05 - Reset de Mes inicial

- Fase: contrato FT-036; codigo FT-037.
- Objetivo: restaurar exclusivamente Mes inicial pelo mesmo default dinamico da inicializacao.
- Entradas: TODO raiz, `src/faturamento/RCF.md`, formulario, persistencia, regra temporal, UI e testes.
- Dependencias: inicializacao e efeitos dependentes atuais preservados.
- Fora de escopo: valor fixo, duplicacao da regra de default ou reset de outros dados.
- Validacao: isolamento, default dinamico, persistencia, recomputacao, acessibilidade e Web/Bundle.
- Decisao: reutilizar a função canônica que subtrai doze meses da data de assinatura atual, persistir apenas `mes-inicial`, não sincronizar a data de assinatura e recomputar somente saídas dependentes.
- Estado: contrato concluído; FT-037 bloqueada até nova autorização humana posterior ao commit normativo.
