# RCF - Requirements & Control Framework

## Projeto

Modelos Web JCEM.

## Objetivo

Disponibilizar modelos e utilitários Web estáticos, com foco principal em documentos editáveis para impressão fiel em A4. O documento admissional em `oficios/admissional/index.html` é a referência funcional atual para geração, preenchimento, validação, salvamento local, timbre, compartilhamento parametrizado e exportação PDF.

## Escopo

- Páginas estáticas executadas no navegador.
- Documentos imprimíveis, especialmente ofícios e modelos formais.
- Utilitários Web simples, como a calculadora em `dizimo/`.
- Bookmarklets utilitários em `favoritos/`.
- Persistência local no navegador por `localStorage`.
- Geração de PDF no cliente quando houver botão dedicado.
- Preenchimento parametrizado por query string.
- Publicação estática sob o domínio `modelos.jcem.pro`.

## Regras de Negócio

### RN001 - Documento como Artefato de Impressão

O objetivo principal dos documentos em `oficios/` é gerar artefatos para impressão em papel A4.

Toda estilização de documentos imprimíveis deve priorizar fidelidade de impressão, mesmo quando a visualização Web oferecer recursos extras de edição, aviso, compartilhamento ou navegação.

### RN002 - Separação entre Interface Web e Área Imprimível

Documentos devem separar conceitualmente:

- Interface Web: avisos, barras de ferramentas, controles, mensagens, botões, inputs auxiliares e feedbacks de edição.
- Área imprimível: conteúdo formal que deve aparecer no papel ou PDF.

Elementos não imprimíveis devem ser visíveis apenas na interface Web e ocultados em `@media print` e em qualquer modo programático de geração de PDF.

### RN003 - Fidelidade A4

A área imprimível deve possuir layout preciso e previsível em A4.

Margens, dimensões, largura útil, posicionamento, tabelas, assinatura, timbre, rodapé lateral de versão e paginação devem ser controlados por CSS e configuração explícita, evitando dependência de comportamento implícito do navegador.

O documento admissional usa como configuração efetiva:

```text
Tamanho: 21 cm x 29,7 cm
Margem esquerda: 1,4 cm
Margem direita: 0,5 cm
Margem superior: 1 cm
Margem inferior: 1,5 cm
Unidade: cm
Orientação: retrato
```

### RN004 - Impressão pelo Navegador e por PDF Dedicado

A impressão deve funcionar corretamente tanto via Ctrl+P, ou equivalente do sistema/navegador, quanto por botão dedicado de geração de PDF.

O botão dedicado deve preparar o documento para impressão, ocultar placeholders e elementos de interface, aplicar configuração de página e restaurar o estado visual depois da geração.

Quando a impressão depender de configuração do usuário no navegador, como desabilitar cabeçalhos e rodapés padrão, a interface Web pode orientar o usuário, mas o layout do documento deve reduzir ao máximo essa dependência.

### RN005 - Responsividade Restrita

A visualização Web pode ser responsiva para melhorar uso em telas diferentes.

A responsividade deve ficar restrita a elementos de interface, barras, avisos e controles. Ela não deve alterar medidas fundamentais, proporções, margens, paginação ou alinhamentos da área imprimível.

### RN006 - Salvamento Automático

Documentos editáveis devem possuir salvamento automático durante a edição.

No documento admissional, campos `input` são carregados e persistidos por `localStorage` usando o `id` do campo. Campos sem `id` recebem identificador automático `iN`.

O salvamento deve ocorrer durante interações de edição e validação, sem exigir botão manual de salvar.

### RN007 - Validação e Normalização de Campos

Campos obrigatórios devem ser validados antes da geração de PDF ou compartilhamento parametrizado.

O documento admissional formaliza as seguintes validações e normalizações existentes:

- CPF deve conter 11 dígitos e dígitos verificadores válidos.
- CNPJ deve aceitar valor com 3 a 14 dígitos, completar com zeros à esquerda até 14 dígitos e validar dígitos verificadores.
- Celular deve conter 11 dígitos, DDD válido maior ou igual a 11 e iniciar com `9` após o DDD.
- Telefone fixo deve conter 10 dígitos e DDD válido maior ou igual a 11.
- CEP deve conter 8 dígitos.
- Moeda deve aceitar entrada numérica com vírgula ou ponto e normalizar para BRL em `pt-BR`.
- UF deve pertencer ao conjunto de unidades federativas brasileiras aceitas pelo documento.
- Nome da empresa deve ser convertido para maiúsculas.
- Campos com `pattern` devem respeitar a expressão regular definida no HTML.

Mensagens de erro devem ser claras para o usuário e impedir geração quando campos obrigatórios estiverem vazios ou inválidos.

### RN008 - Campos da Empresa para Compartilhamento

O compartilhamento de documento pré-preenchido deve validar, no mínimo, os campos da empresa marcados com atributo `empresa`.

No documento admissional, estes campos são:

- `nome`: nome da empresa.
- `cnpj`: CNPJ da empresa.
- `fone`: telefone fixo da empresa com DDD.

### RN009 - Timbre

Documentos podem permitir upload de timbre em imagem.

No documento admissional, o timbre é carregado de arquivo local aceitando `.svg`, `.jpg`, `.jpeg` e `.png`, convertido para Data URL e persistido em `localStorage` pela chave `timbre`.

Quando houver timbre salvo, ele deve ser exibido no início do documento e incluído na impressão/PDF.

### RN010 - Preenchimento por Query String

Qualquer documento deverá poder ser totalmente preenchido por parâmetros recebidos via JSON na query string, codificados em Base64.

Base64 deve ser tratado como mecanismo de ofuscação e transporte, nunca como segurança, autenticação, assinatura ou criptografia.

O documento admissional já suporta preenchimento parcial por parâmetros individuais em Base64:

- `empresa` ou `nome` para `#nome`.
- `cnpj` para `#cnpj`.
- `tel`, `fone` ou `telefone` para `#fone`.
- `timbre` ou `logo` para a imagem de timbre.

A evolução normativa é aceitar também um payload JSON Base64 capaz de preencher todos os campos documentais mapeados, preservando aliases legados quando existirem.

### RN011 - Compartilhamento de Modelo Preenchido

Documentos podem disponibilizar ação de compartilhamento que gere URL com dados pré-preenchidos.

No documento admissional, a ação copia para a área de transferência uma URL pública contendo telefone, CNPJ, empresa e timbre codificados em Base64.

URLs compartilhadas não devem conter dados tratados como secretos, pois Base64 não fornece proteção.

### RN012 - Limpeza de Campos

Documentos editáveis podem oferecer ação para limpar campos de preenchimento do usuário.

No documento admissional, a ação limpa apenas campos com `id` automático no formato `iN`, preservando campos estruturais da empresa e demais dados persistidos que não sigam esse padrão.

### RN013 - Data do Documento

Documentos podem gerar data automaticamente no carregamento.

No documento admissional, a data é renderizada em português no formato:

```text
DD de Mês de AAAA
```

### RN014 - Conteúdo Formal do Ofício Admissional

O documento admissional declara ao Banco do Brasil S.A. que a pessoa qualificada pertence ao quadro de funcionários ou contratados da empresa declarante.

O conteúdo formal exige que o documento seja acompanhado da Cédula de Identidade original.

O formulário coleta, no mínimo:

- Nome da pessoa.
- CPF.
- E-mail.
- Celular.
- Telefone de recado.
- Logradouro/endereço.
- Bairro.
- Município.
- UF.
- CEP.
- Cargo ou função.
- Salário.
- Assinatura física ou digital via gov.br.
- Dados, carimbo e assinatura da empresa.
- Campo de reconhecimento, validação ou assinatura do Banco do Brasil.

### RN015 - Barra de Ferramentas Reutilizável

A barra de ferramentas deve ser desacoplada do documento atual e tratada como componente reutilizável, configurável e extensível.

A barra poderá conter ações:

- Globais, disponíveis em todo o projeto.
- Específicas do tipo documental.
- Específicas da categoria, por exemplo `oficios`.
- Específicas do documento individual.

A configuração deve permitir habilitar, ocultar, ordenar e parametrizar ações sem duplicar lógica em cada documento.

### RN016 - Ações de Documento

O documento admissional possui as seguintes ações de interface:

- Gerar PDF preenchido.
- Gerar PDF em branco/formulário.
- Limpar campos.
- Carregar timbre.
- Compartilhar URL pré-preenchida.
- Exibir estado de autosave.

Essas ações devem servir como base funcional para a primeira extração de toolbar reutilizável.

### RN017 - Dependências de Terceiros em CDN

Dependências externas carregadas por CDN devem ser explícitas, versionadas e justificadas pela necessidade do documento.

O documento admissional usa `html2pdf.js` para geração de PDF no navegador.

Mudanças que introduzam novas dependências externas devem registrar a decisão neste RCF.

### RN018 - Compatibilidade Estática

O projeto deve continuar funcionando como site estático.

Não deve ser exigido servidor de aplicação, etapa de build, backend ou banco de dados para uso dos documentos atuais, salvo decisão arquitetural futura registrada neste RCF.

### RN019 - Redirecionamentos Legados

Arquivos legados podem redirecionar para a nova estrutura de diretórios quando necessário para preservar links públicos.

O arquivo versionado `modeloCartaRendaAdmissional.html` redireciona para `https://modelos.jcem.pro/oficios/admissional`.

### RN020 - Calculadora de Dízimo

A calculadora em `dizimo/` é um utilitário Web separado dos documentos de ofício.

Ela calcula recebimentos, oferta/pacto, correção de dízimo, dízimo e dízimo corrigido com formatação monetária brasileira. Alterações nesse utilitário não devem contaminar regras documentais de impressão, salvo componentes realmente compartilháveis e registrados neste RCF.

## Arquitetura

### ARQ001 - Estrutura Atual

```text
/
├── CNAME
├── LICENSE
├── README.md
├── dizimo/
│   ├── index.html
│   └── assets/
├── favoritos/
│   ├── dark.discourse.js
│   └── remover.paywall.js
├── modeloCartaRendaAdmissional.html
└── oficios/
    └── admissional/
        └── index.html
```

### ARQ002 - Separação Recomendada para Documentos

Documentos imprimíveis devem evoluir para a seguinte separação lógica:

- Núcleo de documento: HTML sem dependência direta da toolbar.
- Área imprimível: contêiner exclusivo para conteúdo formal.
- Toolbar: componente reutilizável externo ao documento.
- Configuração: metadados do documento, categoria e tipo documental.
- Persistência: módulo de autosave e restauração de dados.
- Parametrização: módulo para ler JSON Base64 e aliases legados.
- Impressão/PDF: módulo para preparar, gerar e restaurar estado.
- Validação: módulo reutilizável para formatos como CPF, CNPJ, telefone, CEP, moeda e UF.

### ARQ003 - Configuração por Escopo

A configuração de ações deve respeitar precedência:

```text
global < categoria < tipo documental < documento individual
```

Uma ação mais específica pode sobrescrever, ocultar ou complementar uma ação mais geral.

### ARQ004 - Persistência Local

A persistência deve permanecer local ao navegador por padrão.

As chaves de `localStorage` devem ser estáveis e, em evolução futura, preferencialmente namespaced por categoria/documento para evitar colisões entre modelos.

### ARQ005 - Parametrização JSON Base64

A arquitetura de preenchimento parametrizado deve aceitar um parâmetro único contendo JSON codificado em Base64, por exemplo:

```text
?data=BASE64(JSON)
```

O JSON deve mapear campos por identificador estável, nome lógico ou alias documentado. A rotina deve validar estrutura, ignorar chaves desconhecidas sem falhar e aplicar os mesmos normalizadores usados na edição manual.

### ARQ006 - Fidelidade de Impressão Permanente

Toda mudança em documentos imprimíveis deve considerar fidelidade de impressão como requisito funcional, não como detalhe visual.

Mudanças em CSS, fontes, escalas, margens, tabelas, inputs, placeholders, timbre, assinatura, toolbar ou geração de PDF devem ser revisadas contra impressão/PDF.

### ARQ007 - Interface Não Imprimível

Interface Web deve usar classes ou atributos claros para indicar elementos não imprimíveis.

O padrão atual usa `.autosave`, `.menu`, `.nota` e `.cookie` ocultados em `@media print` e em `body.imprimir`. Evoluções devem preservar esse princípio e podem consolidá-lo em classe comum como `.no-print`.

### ARQ008 - Decisões Arquiteturais

Todas as decisões arquiteturais devem ser registradas nesta seção do RCF.

Decisões registradas:

- O projeto permanece estático, sem backend obrigatório.
- O padrão documental é reaproveitado de `whatsapp` apenas no formato de documentação, não em regras funcionais.
- A prioridade permanente dos documentos em `oficios/` é impressão A4 fiel.
- A responsividade deve beneficiar a interface Web sem modificar a precisão da área imprimível.
- A toolbar deve evoluir como componente reutilizável configurável por escopo.
- O preenchimento por JSON Base64 deve ser universal para documentos, tratando Base64 como ofuscação.
- Dependências externas devem ser explícitas, versionadas e registradas quando introduzidas.

## Requisitos Não Funcionais

### RNF001 - Plataforma

Compatível com navegadores modernos em desktop e mobile, preservando impressão confiável especialmente em navegadores Chromium quando houver geração por `html2pdf.js`.

### RNF002 - Operação Estática

O projeto deve funcionar por hospedagem estática e acesso direto às páginas, respeitando limitações normais de APIs do navegador.

### RNF003 - Usabilidade

A edição Web deve ser simples, direta e suficiente para preenchimento rápido antes da impressão.

Alertas, notas e ferramentas devem ajudar o usuário sem aparecer no documento impresso.

### RNF004 - Manutenibilidade

Novas regras de negócio devem ser documentadas neste RCF no mesmo ciclo da alteração.

Lógica duplicada entre documentos deve ser candidata a componente reutilizável.

### RNF005 - Privacidade

Dados preenchidos devem permanecer no navegador do usuário por padrão.

URLs compartilhadas com dados em Base64 devem ser tratadas como potencialmente públicas.

### RNF006 - Compatibilidade Visual

Fontes, tamanhos, espaçamentos e unidades devem favorecer previsibilidade no PDF e no papel.

Unidades físicas como `cm` e `pt` devem ser preferidas para a área imprimível quando a medida física for relevante.

### RNF007 - Evolução Controlada

Alterações devem preservar arquitetura existente e evitar reestruturações amplas sem necessidade.

Quando uma refatoração for necessária, ela deve manter comportamento atual antes de acrescentar novas capacidades.

