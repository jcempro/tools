- [ ] TODO — Padronizar folha, PDF e impressão

  ## Objetivo

  Unificar o **invólucro responsável por criar, dimensionar e posicionar a folha** usada:
  1. na visualização;
  2. na geração de PDF;
  3. na impressão nativa do navegador por `Ctrl+P`.

  Todos os submódulos atuais e futuros DEVEM utilizar a mesma implementação, configuração e contrato de impressão, eliminando divergências locais.

  ## Evidência

  Inspecionar as imagens anexadas em:

  ```text
  .ia.rules/state/todo.assets/print-erros/
  ```

  - remover os assets/diretório apos completo este to-do.

  Elas evidenciam que a área da folha pode ficar desalinhada e ser cortada durante a impressão pelo navegador ou geração de PDF.

  A inspeção DEVE identificar a causa real antes da alteração. É PROIBIDO presumir que o problema decorre exclusivamente de margem, escala, dimensão, orientação, unidade CSS ou mecanismo de renderização.

  ## Requisitos

  ### 1. Componente único

  O invólucro da folha DEVE ser centralizado em uma implementação compartilhada e reutilizado por todos os submódulos.

  Cada submódulo PODE definir apenas conteúdo e propriedades explicitamente variáveis, como formato ou orientação, quando suportadas pelo contrato comum.

  É PROIBIDO:
  - duplicar ou reimplementar localmente o invólucro;
  - manter CSS, margens, escalas, dimensões ou correções de impressão divergentes;
  - aplicar ajustes específicos para ocultar defeitos estruturais;
  - permitir que novos submódulos criem fluxos próprios de folha, PDF ou impressão.

  ### 2. Uniformidade de renderização

  A mesma folha lógica DEVE produzir resultado geométrico equivalente em:
  - interface de visualização;
  - impressão por `Ctrl+P`;
  - geração interna ou automatizada de PDF.

  O conteúdo imprimível DEVE permanecer integralmente dentro da área útil da página, sem:
  - cortes;
  - deslocamentos;
  - transbordamentos;
  - margens assimétricas involuntárias;
  - redimensionamento inesperado;
  - páginas extras causadas por arredondamento, overflow ou dimensões incorretas;
  - divergência entre submódulos.

  ### 3. Layout de impressão

  A implementação DEVE controlar deterministicamente, conforme o formato utilizado:
  - tamanho da página;
  - orientação;
  - margens;
  - área útil;
  - box model;
  - escala;
  - largura e altura;
  - overflow;
  - quebras de página;
  - elementos não imprimíveis;
  - unidades físicas e conversões necessárias.

  Regras de `@page`, `@media print` e demais estilos aplicáveis DEVEM ser compartilhadas ou derivadas da mesma fonte normativa.
  - elementos de GUI não devem ser exibidos e, por isso, os elementos sempre são vinculados obrigatoriamente ao contexto global, ainda que, especializados pelo submódulo - o escopo de rendererização é do contexto global - salvo exceções pontuais e claramente raras, muito bem delimitadas que não quebrem a impressão ainda que haja atualizações sob demanda no global.

  A correção NÃO DEVE depender de o usuário ajustar manualmente escala, margens ou posicionamento no diálogo de impressão.

  ### 4. Compatibilidade

  A alteração DEVE:
  - corrigir todos os submódulos existentes;
  - abranger submódulos futuros por construção;
  - preservar conteúdos, funcionalidades e formatos já suportados;
  - não modificar regras de negócio alheias à folha;
  - não introduzir regressões na visualização ou exportação.

  Quando mecanismos distintos renderizarem PDF e impressão nativa, ambos DEVEM consumir o mesmo contrato geométrico, ainda que necessitem de adaptadores técnicos específicos.

  ## Execução
  1. Ler os normativos aplicáveis e inspecionar a arquitetura real.
  2. Examinar as evidências em `.ia.rules/state/todo.assets/print-erros/`.
  3. Mapear todos os invólucros, estilos e fluxos atuais de folha, PDF e impressão.
  4. Identificar divergências, duplicações e a causa raiz dos cortes ou desalinhamentos.
  5. Definir um contrato único de folha e impressão.
  6. Centralizar a implementação no local arquiteturalmente adequado.
  7. Migrar todos os submódulos para a implementação comum.
  8. Remover implementações redundantes somente após confirmar equivalência.
  9. Impedir estruturalmente que novos submódulos contornem o contrato comum.
  10. Executar validação visual, geométrica e regressiva.

  ## Validação obrigatória

  Validar, em cada submódulo e formato suportado:
  - visualização normal;
  - pré-visualização de `Ctrl+P`;
  - impressão ou salvamento como PDF pelo navegador;
  - geração própria de PDF, quando existente;
  - primeira, intermediária e última página;
  - conteúdos mínimos, extensos e próximos dos limites;
  - orientação e formato de página suportados;
  - diferentes navegadores oficialmente compatíveis.

  Sempre que tecnicamente viável, adicionar testes automatizados que detectem:
  - conteúdo fora da área útil;
  - dimensões divergentes;
  - overflow imprimível;
  - alterações indevidas de escala;
  - páginas excedentes;
  - diferenças entre o contrato comum e os submódulos.

  ## Critérios de aceite

  A tarefa somente estará concluída quando:
  - existir uma única fonte normativa e implementacional para a folha;
  - todos os submódulos atuais utilizarem essa fonte;
  - novos submódulos herdarem o comportamento sem duplicação;
  - nenhuma folha for cortada ou desalinhada;
  - `Ctrl+P` e geração de PDF produzirem resultados geometricamente consistentes;
  - nenhum ajuste manual excepcional for necessário;
  - as evidências anexadas forem reproduzidas antes da correção e não se repetirem depois dela;
  - testes e documentação impedirem regressão;
  - não permanecerem correções locais conflitantes.

  ## Relatório final

  Registrar:
  - causa raiz;
  - arquivos e componentes alterados;
  - divergências removidas;
  - contrato compartilhado adotado;
  - submódulos validados;
  - navegadores e fluxos testados;
  - evidências comparativas anteriores e posteriores;
  - testes executados e resultados;
  - limitações reais remanescentes, se houver.

- [ ] TODO — Gerar favicons e manifests por aplicação e bundle

  ## Objetivo

  Integrar o **RealFaviconGenerator** ao processo de build para gerar deterministicamente os favicons, manifests e marcações HTML adequados a cada alvo, a partir dos ativos visuais oficiais:

  * aplicação global: ícone global da aplicação;
  * bundle de submódulo: logotipo específico do respectivo submódulo;
  * publicação web/GitHub Pages: conjunto completo aplicável ao ambiente web;
  * bundle offline: somente ativos efetivamente úteis ao funcionamento offline.

  Referência obrigatória:

  ```text
  https://github.com/RealFaviconGenerator/realfavicongenerator
  ```

  ## Requisitos

  ### 1. Dependência e integração

  Instalar como dependências de desenvolvimento os pacotes npm oficiais atualmente recomendados pelo projeto RealFaviconGenerator para geração local em Node.js.

  Antes da implementação, a IA DEVE:

  1. consultar a documentação oficial atual;
  2. identificar os pacotes e APIs mantidos;
  3. confirmar compatibilidade com a versão Node.js e o sistema de build do repositório;
  4. evitar pacotes legados, não oficiais, abandonados ou dependentes de serviço remoto quando houver geração local oficial equivalente;
  5. registrar as dependências no manifesto e lockfile existentes.

  A geração DEVE ocorrer durante o build, sem intervenção manual e sem requisição externa em tempo de execução.

  ### 2. Fonte visual por alvo

  O gerador DEVE resolver a imagem-mestre conforme o alvo:

  ```text
  aplicação global  → ícone global oficial
  bundle submódulo  → logotipo oficial do respectivo submódulo
  ```

  Cada submódulo DEVE declarar ou possuir resolução determinística de seu logotipo. Ausência, ambiguidade, duplicidade ou arquivo inválido DEVEM interromper o build do alvo afetado com diagnóstico explícito; É PROIBIDO substituir silenciosamente pelo ícone global.

  O ícone global somente PODE ser fallback quando essa política estiver expressamente configurada.

  ### 3. Centralização

  Toda configuração DEVE possuir uma única fonte de verdade centralizada, incluindo:

  * configurações comuns do RealFaviconGenerator;
  * caminhos de entrada e saída;
  * formatos e variantes gerados;
  * cores, nomes e metadados;
  * política por tipo de alvo;
  * associação entre submódulo e logotipo;
  * política de incorporação;
  * seleção de assets para web e offline;
  * geração e injeção das marcações HTML;
  * manifesto aplicável;
  * validações.

  Quando a configuração não couber adequadamente no arquivo de build, ela DEVE ser segregada em arquivo próprio, semanticamente nomeado e aninhado sob o diretório central de configuração já existente ou, inexistindo-o, sob um único diretório central coerente com a arquitetura real.

  É PROIBIDO:

  * duplicar configurações entre submódulos;
  * manter scripts independentes por bundle;
  * inserir caminhos, cores, nomes ou listas de assets diretamente em múltiplos pontos;
  * permitir divergência entre geração, HTML e manifesto;
  * alterar manualmente arquivos gerados.

  Configurações específicas DEVEM estender as comuns apenas nos campos realmente variáveis.

  ### 4. Geração para publicação web

  O build destinado à página web e ao GitHub Pages DEVE gerar e publicar, quando aplicáveis ao alvo e suportados pela ferramenta:

  * favicon principal;
  * variantes necessárias aos navegadores e plataformas suportados;
  * ícones associados ao manifesto;
  * manifesto web;
  * marcações `<link>` e metadados correspondentes;
  * caminhos compatíveis com a base pública real da publicação.

  A aplicação global DEVE usar o ícone global. Uma página, entrada ou distribuição específica de submódulo DEVE usar a identidade visual do próprio submódulo quando constituir alvo independente.

  URLs e caminhos NÃO DEVEM presumir publicação na raiz do domínio. O build DEVE respeitar a base path efetiva, inclusive em GitHub Pages.

  ### 5. Bundles offline

  Cada bundle offline DEVE usar o logotipo de seu submódulo e incorporar internamente os ativos necessários, sem dependência de URL externa, CDN, serviço remoto ou caminho exclusivo da publicação web.

  A incorporação DEVE seguir o mecanismo já adotado pelo bundle ou o mecanismo tecnicamente compatível com sua arquitetura real.

  Bundles offline NÃO DEVEM incluir assets sem função nesse contexto, incluindo, quando inaplicáveis:

  * manifestos destinados exclusivamente à instalação web/PWA;
  * ícones de plataformas não consumidos pelo bundle;
  * arquivos redundantes;
  * marcações dependentes de origem HTTP;
  * variantes produzidas apenas por compatibilidade com publicação web;
  * metadados ou recursos que não possam operar offline.

  A exclusão DEVE decorrer de uma política central por capacidade e alvo, não de remoção manual posterior.

  ### 6. Build determinístico

  A geração DEVE:

  * ocorrer antes da composição final do HTML ou bundle;
  * usar somente fontes visuais e configurações versionadas;
  * produzir nomes, caminhos e conteúdo reproduzíveis;
  * limpar arquivos obsoletos do alvo sem remover ativos alheios;
  * impedir colisões entre aplicação global e submódulos;
  * falhar diante de saída incompleta, referência inexistente ou manifesto inconsistente;
  * evitar regeneração desnecessária quando entrada, configuração e ferramenta não tiverem mudado, caso o build já possua cache seguro;
  * funcionar localmente e no workflow do GitHub.

  Arquivos gerados NÃO DEVEM tornar-se fonte de verdade. A política de versioná-los ou mantê-los exclusivamente como artefatos de build DEVE seguir a arquitetura e os workflows existentes.

  ### 7. HTML e manifesto

  As marcações geradas DEVEM ser aplicadas ao documento correto sem duplicar tags preexistentes.

  Cada alvo DEVE possuir:

  * um único conjunto ativo de favicons;
  * no máximo um manifesto aplicável;
  * caminhos válidos após o build;
  * metadados coerentes com sua identidade;
  * ausência de referências a arquivos não distribuídos.

  O manifesto, quando aplicável, DEVE refletir corretamente nome, nome curto, cores, escopo, base path e ícones do alvo, sem reutilizar metadados de outro submódulo.

  É PROIBIDO manter manualmente HTML ou manifesto concorrente com o resultado gerado.

  ## Ordem de execução

  1. Ler os normativos e inspecionar o sistema de build real.
  2. Mapear aplicação global, submódulos, bundles, páginas, logotipos e destinos de publicação.
  3. Localizar configurações, favicons, manifests e tags atualmente existentes.
  4. Consultar a documentação oficial atual do RealFaviconGenerator.
  5. Instalar os pacotes npm oficiais adequados como dependências de desenvolvimento.
  6. Definir a configuração central comum e as especializações mínimas por alvo.
  7. Implementar a resolução determinística do ícone global e dos logotipos dos submódulos.
  8. Integrar a geração ao build web, ao GitHub Pages e aos bundles aplicáveis.
  9. Incorporar ao bundle offline somente os assets necessários.
  10. Remover implementações, arquivos e marcações redundantes somente após migração e validação.
  11. Atualizar workflows, documentação e testes.
  12. Executar builds completos e inspecionar os artefatos finais.

  ## Validação

  Validar ao menos:

  * aplicação global publicada;
  * cada submódulo com identidade própria;
  * cada bundle offline;
  * build local limpo;
  * build executado no GitHub;
  * publicação sob base path não raiz;
  * carregamento sem rede do bundle offline;
  * inexistência de recursos externos ou ausentes;
  * integridade do manifesto;
  * resolução de todos os caminhos;
  * ausência de tags duplicadas;
  * inexistência de assets de outro submódulo;
  * ausência de arquivos web inúteis nos bundles offline;
  * reprodução idêntica com as mesmas entradas.

  Sempre que tecnicamente viável, adicionar testes automatizados para verificar:

  * correspondência entre alvo e imagem-mestre;
  * existência dos arquivos referenciados;
  * unicidade das tags e do manifesto;
  * coerência dos caminhos e da base pública;
  * ausência de referências remotas em bundles offline;
  * seleção correta dos assets por perfil;
  * falha controlada diante de logotipo ausente ou inválido.

  ## Critérios de aceite

  A tarefa somente estará concluída quando:

  * a geração usar a implementação oficial do RealFaviconGenerator instalada via npm;
  * todas as configurações estiverem centralizadas;
  * o build da aplicação global usar o ícone global;
  * cada bundle usar o logotipo de seu submódulo;
  * os ativos necessários estiverem devidamente incorporados;
  * a publicação web possuir favicons, manifesto e marcações coerentes;
  * bundles offline não carregarem assets web sem utilidade;
  * nenhum alvo depender de geração manual ou serviço em runtime;
  * caminhos funcionarem localmente e no GitHub Pages;
  * não houver duplicação de configuração, manifesto, tags ou geração;
  * builds e testes aplicáveis forem aprovados sem referências ausentes.

  ## Relatório final

  Registrar:

  * pacotes e versões instalados;
  * documentação oficial adotada;
  * arquivos de configuração e build alterados;
  * fonte visual resolvida para cada alvo;
  * assets gerados por perfil;
  * assets deliberadamente excluídos dos bundles offline;
  * mecanismo de incorporação utilizado;
  * páginas, submódulos e bundles validados;
  * testes e builds executados;
  * arquivos legados removidos;
  * limitações reais remanescentes, se houver.
