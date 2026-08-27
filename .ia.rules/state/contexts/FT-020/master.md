# Contexto-mestre FT-020/FT-021

- Fonte: `TODO.ia.md`, commit `5be7415`, SHA-256 `E4C39BFCB3AA31D4E4BF568921EF0C2328E04807F5C7BECCB764FC95E6195D27`.
- Objetivo: entregar quatro refinamentos convergentes sem alterar contratos ou recursos não relacionados.
- Ordem: registro das FTs -> RCF global e locais -> validação normativa -> autorização humana posterior -> código por subcontexto -> validação integrada -> rastreabilidade.
- Arquitetura: catálogo/resolvedor global de ícones; configuração e renderização locais de Declarações Unificadas; núcleo tabular compartilhado e adaptador do Conversor CSV; build Web/Bundle compartilhado.
- Integração: o ícone usa definição já selecionada; os dois refinamentos documentais compartilham configuração e paginação; a mesclagem CSV ocorre somente após a transformação vigente.
- Estado: equalização normativa em andamento na FT-020; implementação FT-021 bloqueada.
- Aceite global: cobertura bidirecional TODO -> RCF -> fonte -> testes; nenhuma dependência excedente; nenhum comportamento vigente removido; `npm run validate:all` aprovado.

## Mapa de subcontextos

1. `01-bundle-icon.md`: consumidor global de download do Bundle.
2. `02-declaracoes-composicao.md`: assinatura, cabeçalho e templates.
3. `03-declaracoes-tabelas.md`: dimensionamento semântico de tabelas.
4. `04-csv-mesclagem.md`: estágio opcional de mesclagem.
