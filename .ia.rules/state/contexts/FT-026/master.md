# Contexto mestre FT-026/FT-027 - Rodape nominal das Declaracoes Unificadas

- Identidade: FT-026 normativa e FT-027 de codigo para a correcao visual registrada em `evidencia6.png`.
- Fonte: `TODO.ia.md`, commit `55cf89b`, SHA-256 observado antes da equalizacao `C6D9EEA383E0BAA91C73E261A1801051C9DAEFF062969123A43FAFA10329A75F`; evidencia SHA-256 `A7682C0D4802D14EB2337C8094FDCCC7DC2C5632AE59E39703BF0830096C6101`.
- Ordem: registro e equalizacao das FTs -> RCF especifico -> validacao normativa -> commit -> autorizacao humana posterior -> codigo/testes -> validacao visual e integral -> rastreabilidade.
- Objetivo: preservar a distincao contextual dos marcadores e corrigir a composicao nominal do rodape sem alterar declarantes, representantes, conteudo, ordem, paginacao ou fluxos de saida.
- Entradas: FT-022/FT-023, RCF especifico, configuracao central, `footerMarkup`, estilos locais, testes e artefatos Web/Bundle/impressao.
- Dependencias: FT-022 e FT-023 concluidas e rastreadas; FT-027 bloqueada pela FT-026 e por nova autorizacao humana posterior.
- Restricoes: nenhuma regra dependente do texto particular da evidencia; nenhum HTML vindo da configuracao; nenhum negrito propagado; nenhuma margem externa capaz de criar recuo em quebra de linha.
- Fora de escopo: alterar frases institucionais, dados dos declarantes, regras de representantes, GUI, paginação global, reset de `Mes inicial` ou outros itens pendentes do TODO.
- Estado: FT-026 concluida e validada no escopo normativo; FT-027 pendente e bloqueada por nova autorizacao humana posterior ao commit normativo.
- Aceite global: cobertura bidirecional TODO/evidencia -> RCF -> fonte -> testes; qualificacao, referencia, negritos e espacos validados separadamente; `npm run validate:all` aprovado.

## Diagnostico inicial

- A evidencia mostra qualificadores sem o fundo visual esperado e com aparencia de linha de base, embora o runtime atual ainda componha `${numero}` por `footerMarkerMarkup(..., "qualification")`; a fase tecnica deve identificar a causa real antes de alterar markup ou CSS.
- Os templates atuais recebem `nome` e `documento` como texto escapado sem delimitacao semantica propria, de modo que a futura implementacao precisara compor tokens seguros e contextuais para limitar negrito sem admitir HTML configuravel.
- O espacamento configurado pertence ao qualificador; ele deve separar o marcador do nome sem criar uma lacuna semelhante a tabulacao nem deslocar inicio/fim de linha justificada.
- A ultima edicao do TODO aninhou a nova frente dentro do reset do Faturamento e contaminou o titulo desse reset; a equalizacao restaurou duas frentes independentes, sem perda material.

## Handoff normativo

- O RCF preserva integralmente os sete contratos sincronizados pela FT-023 e acrescenta quatro sentencas materiais exclusivas para a FT-027.
- Nome e documento tornam-se tokens de marcação segura próprios; somente seus valores calculados recebem negrito, sem propagar destaque a rótulos, preposições, pontuação ou representação.
- A separação depois do qualificador deve ter uma única fonte efetiva; a implementação deve impedir soma de espaço literal, entidade, padding e margem capaz de produzir a lacuna vista em `evidencia6.png`.
- A validação técnica deve comprovar separadamente qualificador, referência, negritos e justificação contra a evidência, cobrindo Web, Bundle e impressão/PDF.
- Rastreabilidade: quatro entradas da FT-027 em estado `pending`; `rcf-trace validate` aprovou `241/241`.
- Validações normativas aprovadas: type-check, lint e `git diff --check`.
- A suíte existente ficou em 66/68 por duas expectativas já obsoletas no `HEAD`, introduzidas antes desta FT pelos commits `2cead39` e `55cf89b`; nenhuma expectativa foi enfraquecida ou ajustada antecipadamente nesta fase.
