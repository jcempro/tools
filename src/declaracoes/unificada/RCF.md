# RCF - Declarações unificadas

## 1. Identidade, objetivo e escopo

O módulo `declaracoes-unificada` DEVE publicar em `/declaracoes/unificada/` um formulário documental multipágina que reúna, em uma única composição, as declarações, autorizações e adesões definidas pelas evidências versionadas da FT-011. [ecefbee]

O módulo DEVE ser uma aplicação nativa do workspace multitools, estática e executada no navegador, consumindo a infraestrutura compartilhada de chrome, workspace, campos preenchíveis, persistência, importação/exportação, compartilhamento, impressão, PDF, validação e Bundle. [ecefbee]

As regras deste RCF são especializações exclusivas do formulário unificado e NÃO DEVEM alterar comportamento, conteúdo, geometria ou recursos de Faturamento, Ofício admissional, CSV-BD ou outro módulo. [ecefbee]

## 2. Fontes autoritativas e precedência

O conteúdo documental DEVE derivar integralmente de `.ia.rules/state/evidencias/UNIFICADA.odt`, SHA-256 `02ED9A4E8D0B31654A12229DD8F86F3EAEA830717A03FE7D8E8563F28954A307`; as marcas visuais e funcionais DEVEM derivar de `.ia.rules/state/evidencias/Evidencia-Marcas-Unificadas.pdf`, SHA-256 `F9E8DB78FA2B06973AC77E2A978DF7C033FFAA83B3BA3F4EA7E1B9AEE38262CE`. [ecefbee]

Na ausência de conflito, o ODT governa texto, ordem, estrutura e semântica documental, enquanto o PDF governa composição, parametrização, interação e apresentação; conflito material não resolvido pelo RCF global e por este RCF DEVE bloquear a implementação e ser submetido ao desenvolvedor. [ecefbee]

As evidências são insumos imutáveis de rastreabilidade e NÃO DEVEM ser editadas, convertidas em fonte runtime nem publicadas em Web ou Bundle. [ecefbee]

Para a FT-012, o recorte autorizado do ODT DEVE conter exclusivamente as tabelas externas `Tabela1`, `Tabela2`, `Tabela4`, `Tabela6`, `Tabela8` e `Tabela9`, cujas células externas usam fundo `#d9d9d9` e cujos títulos as identificam inequivocamente como declaração, autorização ou adesão. [ecefbee]

Tabelas internas aninhadas nesses seis blocos DEVEM permanecer como estrutura da respectiva unidade cinza; conteúdo fora deles ou sem a dupla comprovação de fundo cinza e identidade documental NÃO DEVE integrar os Markdown. [ecefbee]

## 3. Unidades documentais e ordem

A composição DEVE preservar, nesta ordem estável, as seis unidades existentes no ODT: [ecefbee]

1. Autorização para consulta ao SCR;
2. Declaração de propósitos e natureza da relação de negócio;
3. Declaração de domicílio fiscal;
4. Termo de adesão e ciência ao BB Rende Fácil;
5. Autorização para consulta a informações relativas à agenda de duplicatas escriturais;
6. Autorização para consulta a informações relativas à agenda de recebíveis de arranjo de pagamento.

Instruções, notas, tabelas, definições, enumerações e ressalvas pertencentes a uma unidade DEVEM permanecer associadas a ela e na mesma sequência relativa do ODT. [ecefbee]

O texto normativo NÃO DEVE ser editável, ocultável, reordenável nem substituível pela GUI; somente dados explicitamente parametrizados por este RCF PODEM variar. [ecefbee]

Transcrição para Markdown PODE normalizar codificação, espaços técnicos e quebras sem efeito semântico, mas NÃO DEVE corrigir, resumir, modernizar, completar ou reinterpretar redação, pontuação, numeração, referências legais ou valores do ODT sem autorização humana explícita. [ecefbee]

Correção sintática autorizada DEVE limitar-se a defeitos mecânicos inequívocos produzidos por fronteiras de runs ou pela conversão para Markdown, como palavras coladas, espaço duplicado, marcador de lista, célula, título ou quebra estrutural inválida; toda correção DEVE possuir registro origem -> Markdown e NÃO DEVE alterar escolha lexical, obrigação, sujeito, objeto, número, valor, referência legal, ordem ou alcance semântico. [ecefbee]

Quando não for possível distinguir erro sintático de possível erro material do texto, a transcrição DEVE preservar o ODT literalmente e registrar a divergência para decisão humana. [ecefbee]

## 4. Fonte Markdown e compilação

Cada unidade documental DEVE possuir exatamente um arquivo Markdown UTF-8 individual sob `src/declaracoes/unificada/conteudo/`, com identidade e ordem declaradas em manifesto local versionado. [ecefbee]

Cada Markdown DEVE conter um único título de nível 1 correspondente à unidade e somente a sua estrutura documental; HTML arbitrário, script, estilo, URL executável, include remoto e conteúdo gerado são PROIBIDOS. [ecefbee]

O manifesto local DEVE declarar schema, id, ordem, arquivo e título de cada unidade, rejeitando ausência, excedente, duplicidade, path inseguro, ordem ambígua ou divergência entre manifesto, título e conjunto esperado. [ecefbee]

O build DEVE converter a variante Markdown documentada para HTML sanitizado e determinístico antes de compor Web e Bundle; navegador e Bundle NÃO DEVEM buscar, interpretar ou expor arquivos `.md` em runtime. [ecefbee]

Com entradas idênticas, a compilação DEVE preservar conteúdo, estrutura e ordem byte a byte; falha de leitura, parse, sanitização ou validação DEVE bloquear Web, Bundle e publicação sem recorrer a texto incorporado concorrente. [ecefbee]

## 5. Dados editáveis e normalização

A GUI DEVE permitir editar somente data, município, UF, declarantes e representantes de pessoas jurídicas; frases, templates, fundo e espaçamentos são configuração de desenvolvimento e NÃO DEVEM tornar-se texto livre do usuário. [ecefbee]

A data DEVE iniciar no dia corrente do sistema, permanecer editável, ser validada como data civil e ser apresentada no documento por extenso no padrão `DD de mês de AAAA`. [ecefbee]

Município e UF DEVEM ser campos separados e editáveis, iniciar com `Pirassununga` e `SP` conforme a evidência vigente, reutilizar normalizadores globais e apresentar `Município-UF`. [ecefbee]

O documento DEVE exigir ao menos um declarante válido antes de impressão, PDF, exportação ou compartilhamento preenchido. [ecefbee]

Cada declarante DEVE possuir identidade interna estável, tipo `PF` ou `PJ`, nome/razão social e CPF/CNPJ normalizado como dígitos, validado pelos mecanismos globais e exibido com máscara brasileira. [ecefbee]

Identidade interna e ordem cadastral NÃO DEVEM depender do número visual, do nome ou do documento, de modo que edição e reordenação autorizada não quebrem vínculos. [ecefbee]

## 6. Declarantes, representantes e referências

A numeração visual DEVE ser automática, contínua, iniciada em 1 e recalculada deterministicamente pela ordem de apresentação do rodapé. [ecefbee]

O rodapé DEVE listar primeiro todas as pessoas físicas em ordem cadastral e depois todas as pessoas jurídicas em ordem cadastral. [ecefbee]

Cada pessoa jurídica DEVE selecionar pela GUI um ou mais representantes exclusivamente entre declarantes cadastrados anteriormente; referência futura, autorreferência, ciclo, id ausente ou pessoa removida DEVE bloquear a consolidação. [ecefbee]

O seletor de representantes DEVE exibir nomes compreensíveis, enquanto persistência, importação, exportação e renderização DEVEM armazenar e resolver identidades internas estáveis. [ecefbee]

Na saída documental, cada PJ DEVE ser seguida da expressão configurada de representação e das referências `[n]` correspondentes aos representantes, preservando a ordem escolhida e a conjunção parametrizada. [ecefbee]

Remoção ou reordenação de declarante referenciado DEVE exigir resolução explícita dos vínculos afetados e NÃO DEVE produzir referência silenciosamente órfã ou apontada para outra pessoa. [ecefbee]

## 7. Cabeçalho, localidade, data e paginação

Todas as páginas DEVEM repetir cabeçalho documental com a linha `Município-UF, DD de mês de AAAA`, a lista integral dos seis títulos e a paginação `Página n de total`. [ecefbee]

A lista de títulos DEVE ser derivada do manifesto de conteúdo, apresentada integralmente em maiúsculas e separada por pontuação inequívoca, sem manter cópia textual concorrente no HTML ou TypeScript. [ecefbee]

O cabeçalho DEVE incluir, após os títulos, a frase configurável com valor inicial exato `APLICA-SE A TODAS AS CONTAS PJ/PF DO(S) DECLARANTE(S).`. [ecefbee]

A paginação DEVE integrar o cabeçalho, usar negrito, refletir a contagem final efetiva e ser resolvida antes de Ctrl+P ou PDF. [ecefbee]

Exceto pela linha própria de município, UF e data, todo o cabeçalho DEVE ser materializado como um único parágrafo contínuo e justificado, sem `br`, bloco ou quebra voluntária entre títulos, frase institucional e `Página n de total`; quebra automática exigida pela largura disponível permanece permitida e NÃO DEVE separar semanticamente esses trechos em parágrafos distintos. [8db3e5a]

A linha de município, UF e data DEVE manter espaçamento vertical perceptível e configurado em relação ao parágrafo contínuo subsequente, sem margem duplicada por elementos intermediários. [8db3e5a]

O parágrafo integral do cabeçalho DEVE provir de um único template central `document.headerTemplate`, com valor inicial `${documentos} APLICA-SE A TODAS AS CONTAS PJ/PF DO(S) DECLARANTE(S). Página ${paginaAtual} de ${totalPaginas}`, usando o mesmo resolvedor e a mesma sintaxe `${token}` dos templates de assinatura; `${documentos}`, `${paginaAtual}` e `${totalPaginas}` formam o conjunto fechado aplicável, e token ausente, desconhecido, duplicado ou não resolvido DEVE bloquear a saída. [8db3e5a]

Texto configurado e valores calculados do cabeçalho DEVEM ser escapados, e a atualização da paginação dinâmica DEVE preservar a árvore semântica do parágrafo sem admitir HTML, script ou interpolação arbitrária. [8db3e5a]

Cabeçalho, linha de data/localidade e rodapé NÃO DEVEM colidir, ser cortados, desaparecer, variar de posição entre páginas equivalentes nem ser tratados como chrome não imprimível. [ecefbee]

## 8. Corpo, fundo e quebras

Cada unidade DEVE renderizar título próprio em maiúsculas, destacado e seguido do conteúdo Markdown compilado. [ecefbee]

O bloco documental DEVE usar fundo cinza de 20% como valor inicial configurável e padding interno configurável, preservando contraste e legibilidade em Web, temas, impressão monocromática e PDF. [ecefbee]

As unidades DEVEM ocupar sequencialmente o espaço útil disponível sem criar uma página por unidade; quebra antes de uma unidade somente PODE ocorrer quando ela couber integralmente na página seguinte e não couber no espaço restante. [ecefbee]

Unidade maior que uma área útil DEVE quebrar internamente apenas entre blocos semânticos seguros, preservando título contextual, listas, tabelas, linhas inseparáveis e continuidade; corte, sobreposição, página residual e `overflow: hidden` como máscara são PROIBIDOS. [ecefbee]

O algoritmo de paginação DEVE reservar previamente as alturas reais do cabeçalho e do rodapé repetidos e recalcular a composição quando conteúdo, declarantes, tokens, fonte ou viewport de medição materialmente afetarem o resultado. [ecefbee]

### 8.1 Dimensionamento semântico de tabelas

As tabelas Markdown compiladas do módulo DEVEM usar dimensionamento de colunas guiado pela estrutura e pelo conteúdo efetivo, preservando pequeno padding interno configurado e destinando o espaço remanescente às colunas textuais, sem largura fixa uniforme que amplie coluna simples, comprima texto ou produza crescimento vertical evitável. [8db3e5a]

Uma coluna DEVE ser classificada como marcador textual de seleção somente quando possuir ao menos uma célula de corpo significativa, todas as suas células de corpo não vazias contiverem exclusivamente o marcador canônico `X` após normalização de espaços e caixa, e sua estrutura não usar mesclagem que torne a função ambígua; a classificação NÃO PODE depender do título de uma declaração, da posição absoluta da coluna nem de texto externo à própria tabela. [8db3e5a]

Coluna inequivocamente classificada como marcador DEVE ajustar-se ao conteúdo mínimo acrescido do padding, manter seus `X` centralizados nos dois eixos e ceder largura à coluna textual adjacente; coluna que não satisfaça integralmente os critérios DEVE conservar o fluxo tabular comum, sem inferência parcial. [8db3e5a]

O mesmo classificador estrutural DEVE ser aplicado a todas as tabelas equivalentes do submódulo após a sanitização do Markdown e antes da medição paginada, preservando ordem, conteúdo, cabeçalhos, `colspan`, `rowspan`, legibilidade, impressão e PDF. [8db3e5a]

## 9. Rodapé e templates

Todas as páginas DEVEM repetir o mesmo rodapé documental, composto pela declaração de realização/assinatura, lista ordenada de declarantes, referências de representantes e indicação explícita `(assinaturas e visto/s)`. [ecefbee]

O texto do rodapé DEVE iniciar pelo valor configurável `Esta(s) autorização(s)/declaração(ões) e adesão(ões) é(são) realizada(s)/assinada(s) física e/ou eletronicamente por` e continuar com a lista calculada de declarantes. [ecefbee]

Nome, CPF, razao social e CNPJ no rodape DEVEM ser apresentados como texto calculado sem linha de preenchimento, `underline`, `text-decoration`, borda inferior ou pseudo-elemento equivalente; dado ausente ou invalido DEVE bloquear a saida pelo contrato de validacao, nunca ser representado por tracos ou sublinhados. [d67613d]

Templates de PF, PJ, representação e assinatura DEVEM usar somente o conjunto fechado `${numero}`, `${nome}`, `${documento}` e `${representantes}` conforme aplicabilidade; token ausente, desconhecido, duplicado ou não resolvido DEVE bloquear a saída. [ecefbee]

Os templates DEVEM separar conteúdo institucional versionado de dados calculados, usar inicialmente a indicação `(assinaturas e visto/s)` e NÃO DEVEM permitir HTML, script ou interpolação arbitrária fornecida pelo usuário. [ecefbee]

A indicacao `(assinaturas e visto/s)` DEVE possuir separacao vertical perceptivel do texto precedente e reservar abaixo dela uma area fisica pequena, continua e efetivamente utilizavel para vistos e assinaturas, configurada em unidade fisica local e repetida sem sobreposicao em todas as paginas; essa reserva NAO DEVE alterar tipografia, alinhamento ou conteudo do rodape nem ser obtida por margem assimetrica da folha. [d67613d]

A reserva vertical de assinatura DEVE ser exatamente `1 cm`, definida uma única vez por `footer.signatureReserveCm` na configuração central do módulo e consumida pela visualização paginada, Ctrl+P, PDF dedicado e Bundle, sem constante, fallback ou compensação equivalente duplicada em TypeScript, SCSS, HTML ou adaptador. [8db3e5a]

O marcador que qualifica/lista cada pessoa física ou jurídica no rodapé DEVE ser renderizado semanticamente como `<sup>`, permanecer em negrito, exibir literalmente `[ N ]` com os espaços internos preservados e formar uma única caixa textual indivisível que somente PODE quebrar antes ou depois do conjunto completo. [PENDENTE-CODIGO]

O fundo exclusivo desse marcador de qualificação DEVE provir de `footer.indexBackground` na configuração central do módulo, aceitar cor hexadecimal validada e usar inicialmente `#cccccc`, equivalente a cinza de 20%, sem constante ou fallback concorrente no TypeScript, SCSS, HTML, build ou adaptador. [PENDENTE-CODIGO]

Padding e separação horizontal configuráveis do marcador de qualificação PODEM conservar os valores locais vigentes, mas margem externa inicial, indentação ou qualquer espaço estrutural anterior à caixa são PROIBIDOS; a separação posterior NÃO DEVE deslocar o início visual das linhas automáticas do parágrafo. [PENDENTE-CODIGO]

Quando o número for referenciado no texto corrido de representação, inclusive no mesmo rodapé, o marcador DEVE permanecer em negrito e conservar numeração, ordem, identidade e vínculo existentes, mas NÃO DEVE usar `<sup>`, fundo cinza, padding ou margem próprios do marcador de qualificação. [PENDENTE-CODIGO]

A composição do rodapé DEVE distinguir os contextos de qualificação e referência a partir dos respectivos tokens institucionais antes de produzir o HTML escapado, sem substituição textual global que trate toda ocorrência `[n]` como a mesma estrutura visual. [PENDENTE-CODIGO]

O parágrafo introdutório e a lista calculada de declarantes DEVEM permanecer em um único fluxo inline contínuo e justificado, sem `text-indent`, margem inicial de fragmento, bloco intermediário ou quebra voluntária; em qualquer quebra automática, a nova linha DEVE começar no mesmo limite de conteúdo do parágrafo, ressalvado somente o espaço interno visual do marcador de qualificação. [PENDENTE-CODIGO]

A validação específica DEVE cobrir PF, PJ e referências, comprovar os elementos e estilos computados dos dois contextos e exercitar larguras que mantenham o marcador no fim da linha, o movam integralmente para a linha seguinte e quebrem antes/depois dele, preservando Web, Bundle, viewport estreita, Ctrl+P e PDF. [PENDENTE-CODIGO]

O rodapé PODE crescer conforme a quantidade de declarantes, mas a paginação DEVE reservar sua altura efetiva em todas as páginas e bloquear configuração que elimine área útil suficiente para o corpo. [ecefbee]

## 10. Folha, impressão e PDF

O módulo DEVE selecionar um perfil A4 retrato multipágina na configuração central e consumir integralmente o contrato global de folha, Ctrl+P e PDF, usando a mesma árvore lógica paginada nos três fluxos. [ecefbee]

Formato, orientação, margens, área útil, cabeçalho, rodapé e regras de quebra DEVEM possuir uma única materialização configurada; geometria concorrente em HTML, TypeScript, SCSS ou adaptador local é PROIBIDA. [ecefbee]

Na ausencia de valor global uniforme mais especifico, o perfil central `declaracoes-unificada` DEVE usar margens internas gerais de `1 cm` em `top`, `right`, `bottom` e `left`, com a area de assinatura reservada dentro do rodape; visualizacao paginada, Ctrl+P Chromium e PDF dedicado DEVEM consumir esses mesmos quatro valores, sem margem externa adicional, escala, deslocamento lateral ou compensacao exclusiva de motor. [d67613d]

Ctrl+P e PDF dedicado DEVEM aguardar conteúdo compilado, fontes, medição, paginação e numeração final; estado incompleto, overflow ou referência inválida DEVE falhar com diagnóstico e sem arquivo parcial. [ecefbee]

Web e Bundle DEVEM produzir a mesma contagem, ordem, textos, referências e geometria para entradas equivalentes, admitida somente diferença técnica do adaptador já prevista no contrato global. [ecefbee]

## 11. GUI, persistência e portabilidade

A GUI DEVE reutilizar o chrome e a gaveta global de campos preenchíveis, agrupando localidade/data, declarantes e configurações sem incorporar controles dentro da folha impressa. [ecefbee]

Inclusão, edição, remoção e ordenação de declarantes DEVEM ser acessíveis por teclado, possuir rótulos e erros associados e preservar foco previsível. [ecefbee]

Autosave, query string, compartilhamento, exportação e importação DEVEM usar um único modelo de dados versionado do módulo, com schema inicial `jcem.declaracoes-unificada.v1` e normalização idêntica à edição manual. [ecefbee]

Importação de módulo, schema ou versão incompatível DEVE ser recusada sem alterar o estado atual; chaves desconhecidas somente PODEM ser ignoradas quando a evolução aditiva do schema declarar essa compatibilidade. [ecefbee]

O Bundle DEVE permanecer autocontido, sem rede, sem arquivos Markdown externos e com o mesmo conteúdo/documento da versão Web correspondente. [ecefbee]

## 12. Responsabilidades globais e locais

Permanecem globais: chrome, toolbar, gaveta, workspace, folha, adaptadores de impressão/PDF, autosave, serialização, compartilhamento, importação/exportação, validadores brasileiros, temas, favicons, build, Bundle e publicação.

Permanecem locais: manifesto e Markdown das seis unidades, modelo de declarantes/representantes, tokens e template do rodapé, lista de títulos, composição interna do cabeçalho/corpo/rodapé e regras de paginação específicas deste formulário.

Frases, templates, fundo e espaçamentos DEVEM residir em `src/assets/config/declaracoes-unificada.json`, com schema e valores iniciais validados, e ser incorporados ao Bundle pelo mecanismo central sem fallback concorrente no código. [ecefbee]

Capacidade local somente PODE ser promovida a `src/assets/` quando inspeção demonstrar reutilização real, contrato comum e ausência de regressão; antecipação abstrata ou duplicação temporária NÃO DEVEM justificar promoção. [ecefbee]

## 13. Arquitetura local prevista

```text
src/declaracoes/unificada/
├── RCF.md
├── index.html
├── logo.svg
├── unificada.scss
├── unificada.ts
└── conteudo/
    ├── manifest.json
    ├── 01-autorizacao-scr.md
    ├── 02-propositos-relacao.md
    ├── 03-domicilio-fiscal.md
    ├── 04-bb-rende-facil.md
    ├── 05-agenda-duplicatas.md
    └── 06-agenda-recebiveis.md
```

Configuração runtime específica DEVE permanecer na fonte central `src/assets/config/declaracoes-unificada.json`; a árvore local não DEVE criar segundo arquivo de configuração equivalente. [ecefbee]

Fonte editável DEVE permanecer somente nessa árvore e nas configurações compartilhadas autorizadas; saída Web e Bundle pertencem exclusivamente a `dist/declaracoes/unificada/` e não constituem fonte. [ecefbee]

## 14. Validação e aceite

Validação de conteúdo DEVE comparar manifesto, títulos, ordem, parágrafos, listas, tabelas, valores e referências legais contra o ODT, aceitando somente normalizações técnicas explicitamente permitidas. [ecefbee]

Validação funcional DEVE cobrir PF, PJ, múltiplos declarantes, representante anterior PF/PJ, remoção/reordenação, vínculo inválido, tokens, autosave, importação/exportação, query string e Bundle offline. [ecefbee]

Validação visual DEVE cobrir conteúdo mínimo, nominal e limite; primeira, intermediária e última página; unidade que cabe no restante, unidade deslocada inteira e unidade longa quebrada internamente; cabeçalho, rodapé, fundo, padding, paginação e referências. [ecefbee]

Ctrl+P Chromium e PDF dedicado DEVEM ser renderizados e inspecionados contra a evidência, sem GUI, corte, sobreposição, escala inesperada, página vazia ou divergência entre Web e Bundle. [ecefbee]

A validacao da FT-015 DEVE comparar diretamente os estados claro/escuro de `evidencia-1a.png` e `evidencia-1b.png`, os limites da navegacao em `evidencia-2a.png` e `evidencia-2b.png`, o rodape de `evidencia-3.png` e a composicao impressa de `evidencia-4.png`, cobrindo ao menos viewport normal e estreita, navegacao retraida/expandida, Web, Bundle, primeira/intermediaria/ultima pagina, Ctrl+P Chromium e PDF dedicado. [d67613d]

A FT-012 somente PODE ser concluída após `npm run validate:all`, testes específicos, inspeção visual integral e auditoria TODO -> FT -> RCF -> fontes -> artefatos aprovarem sem hipótese não autorizada. [ecefbee]

## 15. Impedimentos e decisões reservadas

A identidade visual própria exigida pelo catálogo global não está definida nas evidências; a implementação NÃO DEVE inventar marca definitiva e DEVE obter ativo ou autorização explícita para derivação antes de concluir o módulo. [ecefbee]

A autorização vinculada à FT-013 satisfaz essa condição e define `DU`, derivado de `Declarações Unificadas`, como monograma preferencial; o novo `logo.svg` DEVE materializar `DU` no padrão Adobe-like global, com letras personalizadas e imediatamente legíveis e detalhe gráfico somente se sutil e pertinente ao formulário documental. [ecefbee]

Qualquer divergência textual descoberta durante a transcrição, inclusive possível erro material no ODT, DEVE ser preservada e relatada, não corrigida por inferência. [ecefbee]
