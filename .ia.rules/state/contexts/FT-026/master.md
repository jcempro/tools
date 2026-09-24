# Contexto mestre FT-026/FT-027 - Rodape nominal das Declaracoes Unificadas

- Identidade: FT-026 normativa e FT-027 de codigo para a correcao visual registrada em `evidencia6.png`.
- Fonte: `TODO.ia.md`, commit `55cf89b`, SHA-256 observado antes da equalizacao `C6D9EEA383E0BAA91C73E261A1801051C9DAEFF062969123A43FAFA10329A75F`; evidencia SHA-256 `A7682C0D4802D14EB2337C8094FDCCC7DC2C5632AE59E39703BF0830096C6101`.
- Ordem: registro e equalizacao das FTs -> RCF especifico -> validacao normativa -> commit -> autorizacao humana posterior -> codigo/testes -> validacao visual e integral -> rastreabilidade.
- Objetivo: preservar a distincao contextual dos marcadores e corrigir a composicao nominal do rodape sem alterar declarantes, representantes, conteudo, ordem, paginacao ou fluxos de saida.
- Entradas: FT-022/FT-023, RCF especifico, configuracao central, `footerMarkup`, estilos locais, testes e artefatos Web/Bundle/impressao.
- Dependencias: FT-022 e FT-023 concluidas e rastreadas; FT-027 bloqueada pela FT-026 e por nova autorizacao humana posterior.
- Restricoes: nenhuma regra dependente do texto particular da evidencia; nenhum HTML vindo da configuracao; nenhum negrito propagado; nenhuma margem externa capaz de criar recuo em quebra de linha.
- Fora de escopo: alterar frases institucionais, dados dos declarantes, regras de representantes, GUI, paginação global, reset de `Mes inicial` ou outros itens pendentes do TODO.
- Estado: FTs registradas; equalizacao normativa da FT-026 em andamento; FT-027 pendente.
- Aceite global: cobertura bidirecional TODO/evidencia -> RCF -> fonte -> testes; qualificacao, referencia, negritos e espacos validados separadamente; `npm run validate:all` aprovado.

## Diagnostico inicial

- A evidencia mostra qualificadores sem o fundo visual esperado e com aparencia de linha de base, embora o runtime atual ainda componha `${numero}` por `footerMarkerMarkup(..., "qualification")`; a fase tecnica deve identificar a causa real antes de alterar markup ou CSS.
- Os templates atuais recebem `nome` e `documento` como texto escapado sem delimitacao semantica propria, de modo que a futura implementacao precisara compor tokens seguros e contextuais para limitar negrito sem admitir HTML configuravel.
- O espacamento configurado pertence ao qualificador; ele deve separar o marcador do nome sem criar uma lacuna semelhante a tabulacao nem deslocar inicio/fim de linha justificada.
- A ultima edicao do TODO aninhou a nova frente dentro do reset do Faturamento e contaminou o titulo desse reset; a equalizacao restaurou duas frentes independentes, sem perda material.
