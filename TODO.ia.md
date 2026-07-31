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
