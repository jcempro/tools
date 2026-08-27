# RCF — Governança da TO-DO

Esta seção de governança DEVE permanecer no topo do arquivo, NÃO PODE ser removida nem editada e rege todas as TO-DOs posteriores até o marcador explícito de início das TO-DOs operacionais.

O arquivo TODO.ia.md não pode ser removido.

## 1. Estrutura normativa do arquivo

Este arquivo constitui uma lista normativa e operacional de TO-DOs convergentes.

Todo item de topo DEVE:

- iniciar exatamente com `- [ ]` ou `- [x]`;
- começar sem indentação;
- representar uma frente autônoma subordinada às normas deste RCF.

Todo conteúdo imediatamente posterior a um item de topo, enquanto não houver outro item iniciado sem indentação por `- [ ]` ou `- [x]`, DEVE ser interpretado como subordinado ao item de topo imediatamente anterior.

A forma interna dessa subordinação é livre: PODE conter subtítulos, subitens, regras em estilo RCF, ordens, critérios, listas de afazeres, etapas, notas ou estruturas equivalentes. A semântica hierárquica prevalece sobre a forma.

A formatação do arquivo DEVE preservar indentação visual coerente e inequívoca de todo conteúdo subordinado. Títulos, listas, blocos e demais conteúdos pertencentes a um item de topo DEVEM permanecer visualmente aninhados a ele.

## 2. Status, andamento e conclusão

A marcação `[x]` NÃO significa conclusão: indica apenas que o item foi lido, teve sua FT criada e encontra-se em andamento. Itens NÃO iniciados DEVEM permanecer como `[ ]`.

TO-DOs integralmente concluídas DEVEM ser removidas, mantendo o arquivo limpo.

## 3. Regra perene de convergência

- [ ] Equalizar e executar as TO-DOs como frentes convergentes de um único objetivo
  - Este item rege todas as demais TO-DOs. Cada uma DEVE ser tratada como frente complementar de uma única execução, conciliada com as demais e convergente ao objetivo principal do projeto.

  - Contradições aparentes DEVEM ser presumidas como imprecisão redacional e resolvidas por equalização, sem perda de intenção, requisito, restrição ou nuance. Havendo conflito material não solucionável pelas normas e pelo contexto, o desenvolvedor DEVE ser consultado.

  - Considerações, comparações ou solicitações PODEM não ser plenamente aderentes ao projeto, especialmente quando previamente processadas por IA. Salvo dúvida material, a IA DEVE interpretá-las conforme o contexto já normatizado no RCF e no `README.md`; persistindo ambiguidade ou incompatibilidade, DEVE consultar o desenvolvedor antes de prosseguir.

  - O `AGENTS.md` prevalece absolutamente; o RCF vigente prevalece sobre as demais fontes subordinadas. Toda alteração DEVE aprimorar o projeto, ampliar capacidades e recursos, preservar compatibilidade e força normativa e NÃO PODE introduzir regressão.

  - Antes de executar qualquer TO-DO, a IA DEVE:
    1. ler integralmente todas as TO-DOs e normas aplicáveis;
    2. equalizar objetivos, requisitos, dependências, precedências e terminologia;
    3. resolver incompatibilidades, ambiguidades, sobreposições e lacunas;
    4. adaptar, consolidar, desmembrar, reordenar ou eliminar itens somente quando isso aumentar a coerência sem reduzir o objetivo material.

  - Toda TO-DO DEVE ser separada em:
    - **Normatização (RCF):** atualização de RCFs, contratos, precedências e documentação normativa necessária;
    - **Implementação:** código, migrações, testes, validações e alterações funcionais.

  - Após a equalização, a IA DEVE iniciar e concluir imediatamente a **Normatização RCF de todas as TO-DOs**, mantendo rastreabilidade entre cada regra e sua implementação futura.

  - Concluída a normatização, a IA DEVE INTERROMPER antes de qualquer implementação e solicitar autorização expressa do desenvolvedor, informando sucintamente:
    - implementações pendentes;
    - dependências e ordem recomendada;
    - impedimentos materiais identificados.

  - Somente quando aplicável ao contexto do repositório, toda alteração que modifique o modo de codificar Markdown DEVE ser documentada no respectivo modo de uso.

  - Este item e toda a seção `# RCF — Governança da TO-DO` são perenes: NÃO PODEM ser marcados como concluídos, removidos ou alterados. Sua contabilização somente é necessária enquanto existir ao menos uma TO-DO por eles regida.

---

# TO-DOs

Este marcador encerra a seção de governança e inicia exclusivamente as TO-DOs operacionais. Todo item de topo abaixo dele está sujeito integralmente ao RCF acima.

---

- [x] Corrigir, de forma **cirúrgica, criteriosa e sem regressões**, as inconsistências documentadas em `.\.ia.rules\state\evidencias\`, após inspeção do estado real. A implementação DEVE obedecer integralmente aos padrões, arquitetura, layout, estilo, formas de exibição/impressão, mecanismos de interação, modus operandi e demais normas já estabelecidas pelo projeto, inclusive `RCF.md` e `AGENTS.md`. É PROIBIDO inventar normas, comportamentos ou soluções para preencher lacunas quando isso puder desadequar o resultado ao padrão existente, eliminar recursos, alterar comportamentos consolidados ou produzir regressões diretas, indiretas ou progressivas.
  - **Alternância claro/escuro — `evidencia-1a.png` e `evidencia-1b.png`:** o ícone do controle permanece inadequadamente igual entre os modos. Corrigir para que ele **mude juntamente com o estado e indique inequivocamente o target da próxima alternância**, preservando integralmente o mecanismo, comportamento e estilo já definidos para troca de tema.

  - **Barra vertical — `evidencia-2a.png` e `evidencia-2b.png`:** corrigir a sobreposição indevida da barra de ferramentas vertical sobre o rodapé. O ajuste DEVE respeitar a geometria, responsividade, posicionamento e comportamento já normatizados, sem simplesmente deslocar elementos de modo a transferir o conflito para outra resolução, viewport, módulo ou estado da GUI.

  - **Logotipos dos módulos:** substituir/corrigir os logotipos para atender **estritamente às novas diretrizes de identidade já estabelecidas no RCF**. NÃO reinterpretar, ampliar ou criar regras próprias de identidade visual além das efetivamente normatizadas.

  - **Declarações Unificadas — `evidencia-3.png`:**
    - corrigir a inexistência de espaçamento entre o conteúdo precedente e `**(assinaturas e visto/s)**`;
    - preservar, **após esse indicativo**, margem/espaço vertical adicional pequeno, porém efetivamente suficiente para a realização física de vistos e assinaturas;
    - remover as linhas/underlines atualmente existentes sob os campos indicados pelas setas vermelhas;
    - realizar os ajustes sem alterar indevidamente tipografia, alinhamentos, estrutura, conteúdo ou demais regras específicas já implementadas para o documento.

  - **Declarações Unificadas — impressão/PDF — `evidencia-4.png`:** o resultado da impressão PDF nativa do navegador — comportamento também observado de forma semelhante no gerador PDF integrado — apresenta margens superior/laterais excessivamente reduzidas para impressão física e assimetria lateral, com margem esquerda maior que a direita. Corrigir a composição de impressão para utilizar **margens gerais uniformes e compatíveis com impressão**, obedecendo prioritariamente às diretrizes globais já existentes; **somente na ausência de regra aplicável**, adotar `1cm` uniformemente. A única diferenciação aqui autorizada é o espaço adicional específico da região destinada às assinaturas/vistos, conforme item anterior. A solução DEVE funcionar no fluxo de impressão aplicável sem criar divergência desnecessária entre visualização, impressão nativa e geração PDF.

  - **Integridade da correção:** cada alteração DEVE limitar-se ao necessário e reutilizar os mecanismos globais existentes quando aplicáveis. NÃO corrigir um sintoma mediante exceções que desorganizem o padrão geral, NÃO interferir em aspectos não relacionados da GUI e NÃO regredir ajustes ou features anteriores. Avaliar efeitos cruzados antes da conclusão, especialmente estilos, posicionamentos, breakpoints, impressão, temas e componentes compartilhados, evitando que uma correção local desencadeie erros em cascata nos demais módulos.

  - **Aceite:** comparar os resultados diretamente com `evidencia-1a.png` a `evidencia-4.png`, validar os estados afetados e confirmar ausência de regressões funcionais, visuais, responsivas e de impressão nos módulos relacionados antes de considerar a TO-DO concluída.

- [x] Adicionar suporte integral e simultâneo a **Lucide (`lucide.dev`)** e **Iconify (`iconify/iconify`)**, preservando **Font Awesome**, após inspeção do estado real e em estrita conformidade com `RCF.md`, `AGENTS.md` e demais normas vigentes de arquitetura, layout, estilo, interação, visualização, impressão, build/distribuição e modus operandi. NÃO presumir regras ausentes, criar arbitrariedades, eliminar recursos nem preencher lacunas quando isso puder desadequar o padrão existente ou provocar regressão direta, indireta, progressiva ou em cascata, inclusive em submódulos.
  - Generalizar para Lucide/Iconify, **sem enfraquecer**, os contratos já normatizados no RCF para Font Awesome: as três fontes DEVEM coexistir e poder ser usadas simultaneamente pelo mesmo mecanismo; apenas recursos/ícones efetivamente utilizados DEVEM ser incorporados/publicados em `dist/`; recursos reutilizáveis DEVEM ser centralizados e NÃO duplicados quando tecnicamente evitável.
  - Garantir **isolamento integral entre provedores/coleções**: uso, resolução, importação, empacotamento ou referência de um ícone NÃO PODE transbordar, colidir ou produzir referência/fallback cruzado acidental ou incidental para outro provedor.
  - Consultar primeiro o RCF vigente, inclusive regras mais rigorosas hoje expressas especificamente para Font Awesome, adaptando-as apenas no necessário para torná-las comuns às três fontes, sem alterar contratos não relacionados.
  - Documentar em `README`/RCF, no local normativamente apropriado, links para as páginas oficiais de navegação/pesquisa de ícones de **Font Awesome, Lucide e Iconify**, sem duplicar documentação já centralizável.
  - Atualizar a iconização existente para usar obrigatoriamente:
    - **Atualização:** Iconify `game-icons:upgrade`;
    - **Download do bundle:** Iconify `streamline-sharp:download-box-1-solid`.

  - Validar coexistência das três fontes, deduplicação/centralização, isolamento, geração de `dist/`, visualização e impressão dos módulos/submódulos afetados; NÃO concluir enquanto houver regressão, distorção, vazamento entre provedores ou alteração colateral de comportamento.

- [x] Criar e publicar no **GitHub Pages** a página `/atribuicoes`, configurando Jekyll/build/roteamento/publicação **somente se necessário** para torná-la acessível e visível segundo os mecanismos já existentes do projeto.

  * DEVE obedecer integralmente `RCF.md`, `AGENTS.md` e demais normas vigentes, reutilizando **template, layout, tipografia, traços, componentes, paleta e estilo visual já adotados nas páginas/posts públicos**, sem criar padrão paralelo, inovar visualmente ou provocar regressões.
  * Inspecionar as dependências/recursos **efetivamente usados no repositório** e listar **somente aqueles cuja licença efetivamente exige atribuição**, sem presumir obrigações. Cada atribuição DEVE cumprir rigorosamente os termos específicos da respectiva licença.
  * Preferencialmente padronizar cada registro com **nome da biblioteca/recurso, repositório/origem, link oficial, autor primário e licença**, acrescentando qualquer informação/texto obrigatório que a licença exigir.
  * Incluir antes da relação apenas um **texto introdutório sucinto**, explicando a finalidade da página.
  * A apresentação PODE adotar composição elegante e legível, inclusive inspiração **ABNT** ou formato tabular, desde que compatível com os padrões existentes; estética alternativa NÃO justifica alterar o design global.
  * Validar `/atribuicoes` no fluxo real do GitHub Pages, inclusive navegação/roteamento, responsividade e impressão quando aplicável, sem alterar indevidamente páginas, posts, módulos ou recursos preexistentes.
