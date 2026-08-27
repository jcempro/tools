# RCF - Conversor Universal de Modelos CSV

## 1. Objetivo e Escopo

Ferramenta subordinada ao RCF global para conversao deterministica e bidirecional entre modelos tabulares, inicialmente CSV, preparada para futuros adaptadores como JSON, SQLite, IndexedDB ou bancos remotos sem alterar o nucleo.

O modulo e utilitario client-side, estatico, offline, sem finalidade documental, impressao A4 ou PDF. Deve consumir o layout institucional global, mas suas regras sao de transformacao de dados. [9b47d80]

## 2. Principios Obrigatorios

- execucao integral no navegador, sem servidor obrigatorio;
- nucleo desacoplado de formato de armazenamento;
- modelo interno canonico usado entre importacao e exportacao;
- determinismo absoluto, rastreabilidade completa e ausencia de descarte silencioso;
- compatibilidade retroativa/futura, baixo acoplamento, alta coesao e extensibilidade;
- codificacao preventiva contra falhas, corrupcao, inconsistencias, duplicidade e expansao estrutural.

## 3. Entrada, Saida e CSV

A importacao deve aceitar CSV de RFC 4180, Excel, LibreOffice, Google Sheets e arquivos parcialmente inconsistentes quando recuperaveis. Deve detectar automaticamente UTF-8, UTF-8 com BOM, ANSI e demais codificacoes reconheciveis. [9b47d80]

O parser deve detectar separador consistente, incluindo virgula, ponto e virgula, TAB, pipe e dois pontos, e suportar aspas simples/duplas, campos com ou sem aspas, separadores protegidos, quebras de linha internas, numeros textuais ou numericos, campos vazios e espacos opcionais conforme o dialeto. [9b47d80]

Exportacao textual deve ser UTF-8 com BOM. [9b47d80]

## 4. Colunas e Preservacao

Nomes de colunas sao case-insensitive e podem possuir aliases configuraveis. Colunas multiplas indexadas devem aceitar forma com espaco e compacta, como `Fone 2`/`Nome 2` e `Fone2`/`Nome2`, com mesma semantica. [9b47d80]

Colunas desconhecidas nunca devem ser descartadas: entram no modelo interno e sao preservadas nas conversoes. A coluna local `id` e identificador operacional da origem, nao dado de dominio; deve ser ignorada por padrao e preservada apenas quando o usuario a marcar expressamente como identificador no conversor. [9b47d80]

## 5. Campo Fone

`Fone`, em qualquer modelo, representa exclusivamente o identificador numerico do telefone. Antes de indexar, comparar, agregar, reconstruir, serializar ou persistir, deve conter somente digitos. O nucleo deve remover parenteses, espacos, hifens, `+`, separadores e equivalentes. Formatacao amigavel pertence apenas a apresentacao e nao pode ser gravada no CSV nem usada como chave logica. [9b47d80]

## 6. Modelos

### Modelo 1 - Cliente

Cada linha representa um cliente. O identificador primario pode ser `MCI`, `CID` ou `MGI`, com prioridade/equivalencia configuraveis. A linha pode conter qualquer quantidade de pares correlacionados: [9b47d80]

```text
Fone / Nome
Fone 2 / Nome 2
...
Fone n / Nome n
```

Cada `Nome n` descreve exclusivamente o `Fone n` correspondente. Nao ha limite estrutural para `n`. Outras colunas sao permitidas.

### Modelo 2 - Telefone

Cada linha representa exatamente um telefone. `Fone` normalizado e o unico indexador e a unica chave logica. `Nome` e o nome canonico consolidado daquele telefone e nao compoe chave.

O Modelo 2 deve conter no maximo um par `Fone`/`Nome` por linha e nunca pode criar varias linhas para o mesmo `Fone` por variacao de `Nome`. Colunas multiplas nele sao permitidas apenas para associacoes de clientes ou atributos equivalentes, por exemplo: [9b47d80]

```text
MCI
MCI 2
...
MCI n
```

`Fone 2`, `Nome 2` ou equivalentes em entrada declarada/inferida como Modelo 2 devem ser canonicalizados em registros independentes, consolidados por `Fone` normalizado antes de conversao, serializacao ou persistencia. Outras colunas adicionais devem ser preservadas. [9b47d80]

## 7. Conversoes

### Modelo 1 -> Modelo 2

Cada par `Fone`/`Nome` alimenta o registro identificado pelo `Fone` normalizado. Ocorrencias do mesmo telefone devem gerar um unico registro, agregando clientes associados sem duplicidade. [9b47d80]

Variacoes de nome do mesmo telefone sao problema de consolidacao de dados, nao chave composta nem registros independentes. Exceto `Nome`, atributos adicionais pertencem conceitualmente ao cliente; quando replicados para acompanhar telefones, isso serve somente para preservar informacao e permitir reconstrucao futura, sem alterar sua semantica.

Se um telefone estiver ligado a varios clientes, todas as associacoes devem ser preservadas por colunas indexadas (`MCI`, `MCI 2`, ...), aplicando o mesmo principio a futuras colunas multiocorrencia. Colunas replicadas devem identificar explicitamente a ocorrencia para eliminar ambiguidade e permitir reconstrucao exata. [9b47d80]

### Modelo 2 -> Modelo 1

Registros do mesmo cliente devem ser reconstruidos em uma unica linha com pares `Fone`/`Nome`, `Fone 2`/`Nome 2`, ..., de forma totalmente deterministica e sem perda de associacoes. [9b47d80]

## 8. Cardinalidade e Integridade

O modelo deve suportar muitos-para-muitos: um cliente pode possuir varios telefones e um telefone pode estar associado a varios clientes. Nenhuma associacao, coluna adicional, valor desconhecido, relacionamento ou informacao recuperavel pode ser perdida. [9b47d80]

## 9. Consolidacao de Nomes

Quando o mesmo `Fone` surgir com nomes diferentes, o sistema deve considerar variacoes possivelmente legitimas, como erro de digitacao, abreviacao, pronome de tratamento, diferenca ortografica ou nome incompleto. [9b47d80]

A consolidacao automatica deve usar criterios deterministiscos. Se nao houver confianca suficiente, a interface deve solicitar decisao manual, preservar todas as alternativas, exigir confirmacao explicita e aplicar a escolha de forma consistente na operacao. A exportacao final permanece pendente enquanto nao houver consolidacao confiavel ou confirmada. [9b47d80]

## 10. Inferencia de Direcao

O conversor deve inferir automaticamente o modelo da origem pela estrutura das colunas. Como ha apenas dois modelos vigentes, o destino deve ser sempre o outro modelo; origem e destino iguais sao proibidos pela interface e pelo nucleo. [9b47d80]

A inferencia deve ocorrer tambem antes da conversao: ao selecionar arquivo e ao inserir, colar ou digitar CSV valido no campo de texto. Essa pre-inferencia deve ser assincrona, cancelavel e limitada ao necessario para reconhecer a estrutura, evitando travamento em digitacao, colagem ou arquivos grandes. A conversao final deve repetir a inferencia sobre os dados efetivamente processados. [9b47d80]

## 11. Erros e Logs

Inconsistencias recuperaveis devem ser corrigidas automaticamente; quando impossivel, o usuario deve decidir. Nada pode ser descartado silenciosamente e toda inconsistencia deve permanecer rastreavel. [9b47d80]

Logs da interface devem ser sucintos e continuamente atualizados, informando inicio, etapa, progresso, avisos, inconsistencias, decisoes pendentes, conclusao e falhas sem verbosidade excessiva. [9b47d80]

Painel, titulo, itens de log, controles, resumos e decisoes devem acompanhar os temas claro e escuro do layout global com superfícies graduais e contraste explicito. Nenhuma superfície local fixa pode tornar texto, icone ou estado ilegivel ao alternar o tema. [3675dd8]

## 12. Extensibilidade

Novos modelos, formatos, adaptadores, transformacoes, validadores e normalizadores devem ser adicionaveis sem alterar o nucleo. A implementacao nao deve assumir conhecimento fixo alem das regras deste RCF. [9b47d80]

## 13. Arquitetura Local

```text
src/csv-bd/
├── RCF.md
├── bd.css
├── bd.ts
└── index.html
```

`src/csv-bd/RCF.md` e o contrato especifico vigente. `src/csv-bd/bd.ts` deve conter apenas integracao de interface, fluxo operacional, logs, decisoes do usuario e acionamento do nucleo compartilhado. [9b47d80]

O modulo deve consumir `src/assets/js/tabular.ts` para deteccao/leitura de CSV, serializacao UTF-8 com BOM, modelo interno canonico, conversao deterministica, preservacao de colunas desconhecidas, rastreamento de inconsistencias e decisoes pendentes. [9b47d80]

## 14. Decisoes Locais

- O modulo permanece estatico, offline e executado no navegador.
- O modulo nao possui salvamento automatico e deve declarar `autosave: false` ao chrome compartilhado, que omite o indicador global. [9861e90]
- Nao consome regras A4/PDF, mas usa cabecalho, barra extensivel e rodape globais. A toolbar deve manter visiveis as acoes de abrir CSV, baixar o CSV convertido, limpar e obter o Bundle offline, com icones e comportamento normalizados pela infraestrutura compartilhada. [3675dd8]
- O nucleo tabular pertence a camada compartilhada por potencial de reuso.
- A saida CSV e sempre UTF-8 com BOM.
- Conflitos de nomes ficam rastreaveis e expostos antes da exportacao.
- Artefatos gerados em `dist/csv-bd/` nao sao fonte canonica.

## 15. Mesclagem complementar opcional

A interface DEVE oferecer um `textarea` opcional `mesclar`, controle de abertura de CSV associado e seleção mutuamente exclusiva e acessível das políticas `Resultado prévio`, `Somente mesclar` e `Somadas`, usando os mesmos padrões de arquivo, codificação, parse, validação, estado visual e logs da entrada principal. [PENDENTE-CODIGO]

Campo `mesclar` vazio DEVE preservar byte a byte o fluxo funcional vigente; quando preenchido, seu CSV DEVE ser interpretado pelo núcleo tabular compartilhado e associado somente depois que conversão, inferência e decisões existentes produzirem o resultado prévio válido. [PENDENTE-CODIGO]

O indexador comum DEVE ser exatamente uma coluna canônica presente nos dois conjuntos e elegível por uma destas fontes: nome configurado em `Identificadores por prioridade; inclua id apenas para preserva-lo` ou alias de telefone efetivamente suportado pelo núcleo, inclusive `fone` e `telefone`; comparação de cabeçalhos DEVE usar a normalização canônica vigente, e aliases de telefone DEVEM convergir à mesma identidade lógica. [PENDENTE-CODIGO]

Ausência de indexador elegível, presença simultânea de duas ou mais identidades elegíveis, valor de chave vazio ou inválido e chave normalizada associada a mais de uma linha materialmente distinta em qualquer lado DEVEM produzir aviso inequívoco e bloquear a mesclagem sem alterar o resultado prévio; duplicatas byte a byte equivalentes PODEM ser consolidadas somente com aviso rastreável. [PENDENTE-CODIGO]

Valores do indexador DEVEM usar o normalizador da própria coluna, incluindo somente dígitos para telefone, e a associação DEVE comparar apenas valores normalizados da identidade escolhida, sem aproximação textual, fallback para outra coluna, combinação de chaves ou transbordamento entre registros. [PENDENTE-CODIGO]

A composição de colunas DEVE manter uma única coluna indexadora, preservar a ordem do schema do resultado prévio e acrescentar depois somente colunas complementares de `mesclar` ainda ausentes; diante de coluna canônica coincidente, valor igual DEVE ser preservado, vazio no resultado preservado PODE receber o valor complementar e dois valores não vazios divergentes DEVEM bloquear a operação como conflito, sem renomear, sobrescrever ou escolher silenciosamente. [PENDENTE-CODIGO]

Na política padrão `Resultado prévio`, a saída DEVE preservar a ordem e somente as linhas do resultado prévio, enriquecendo correspondências e conservando linhas sem par; linha exclusiva de `mesclar` NÃO DEVE criar saída. [PENDENTE-CODIGO]

Na política `Somente mesclar`, a saída DEVE preservar a ordem e somente as linhas originárias de `mesclar`, incorporar colunas correspondentes do resultado prévio e manter uma única representação canônica do indexador; linha exclusiva do resultado prévio NÃO DEVE criar saída. [PENDENTE-CODIGO]

Na política `Somadas`, cada chave correspondente DEVE produzir uma única linha combinada na posição do resultado prévio, seguida pelas linhas exclusivas do resultado prévio em sua ordem relativa e depois pelas linhas exclusivas de `mesclar` em sua ordem relativa, sem duplicar correspondências ou perder colunas de qualquer lado. [PENDENTE-CODIGO]

A política selecionada DEVE alterar exclusivamente a preservação e a ordem das linhas; descoberta do indexador, normalização, correspondência, composição de colunas, detecção de ambiguidades e tratamento de conflitos DEVEM ser idênticos nos três modos. [PENDENTE-CODIGO]

Concluída a associação, o conjunto mesclado DEVE substituir o resultado prévio como resultado definitivo para resumo, serialização, download e qualquer processamento/exportação subsequente, preservando UTF-8 com BOM e toda inconsistência rastreável. [PENDENTE-CODIGO]
