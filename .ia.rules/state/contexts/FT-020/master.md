# Contexto-mestre FT-020/FT-021

- Fonte: `TODO.ia.md`, commit `5be7415`, SHA-256 `E4C39BFCB3AA31D4E4BF568921EF0C2328E04807F5C7BECCB764FC95E6195D27`.
- Objetivo: entregar quatro refinamentos convergentes sem alterar contratos ou recursos não relacionados.
- Ordem: registro das FTs -> RCF global e locais -> validação normativa -> autorização humana posterior -> código por subcontexto -> validação integrada -> rastreabilidade.
- Arquitetura: catálogo/resolvedor global de ícones; configuração e renderização locais de Declarações Unificadas; núcleo tabular compartilhado e adaptador do Conversor CSV; build Web/Bundle compartilhado.
- Integração: o ícone usa definição já selecionada; os dois refinamentos documentais compartilham configuração e paginação; a mesclagem CSV ocorre somente após a transformação vigente.
- Estado: FT-020 e FT-021 concluídas; implementação em `47d91a7`, rastreabilidade em `0d5669b` e validação integral aprovadas.
- Aceite global: cobertura bidirecional TODO -> RCF -> fonte -> testes; nenhuma dependência excedente; nenhum comportamento vigente removido; `npm run validate:all` aprovado.

## Mapa de subcontextos

1. `01-bundle-icon.md`: consumidor global de download do Bundle.
2. `02-declaracoes-composicao.md`: assinatura, cabeçalho e templates.
3. `03-declaracoes-tabelas.md`: dimensionamento semântico de tabelas.
4. `04-csv-mesclagem.md`: estágio opcional de mesclagem.

## Handoff normativo

- RCF global: unicidade visual do ícone de Bundle e limpeza restrita da referência Font Awesome anterior.
- RCF Declarações: configuração única para reserva de `1 cm`, template integral de cabeçalho, composição semântica contínua e classificação estrutural de tabelas.
- RCF CSV: mesclagem posterior à conversão, chave única normalizada, conflitos bloqueantes e três políticas de preservação de linhas.
- Rastreabilidade: 226 sentenças materiais validadas, das quais 22 novas permanecem pendentes para a FT-021.
- Validação: type-check, lint e 58 testes aprovados.

## Encerramento FT-021

- Resultado: quatro refinamentos materializados e removidos do TODO operacional após aceite.
- Validação: `npm run validate:all` aprovado com 64 testes, Web, quatro Bundles, 6 páginas e 80 arquivos; rastreabilidade `226/226` sem pendências.
- Limitação ambiental: navegador integrado não alcançou o servidor local isolado; DOM/CSS compilados e mecanismos oficiais de build/publicação foram inspecionados e aprovados.
