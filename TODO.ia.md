- [ ] Implementar futuramente detecção de provável duplicidade por similaridade no Conversor CSV, somente após definir no RCF métrica, campos comparados, explicabilidade, tratamento de falsos positivos e validação; um limiar centralizado `float` entre `0` e `1` ou percentual equivalente PODE integrar essa futura implementação, mas nenhuma heurística parcial ou configuração ativa deve ser antecipada na correção de cardinalidade 1:N/N:N.

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

* [ ] Corrigir fundo e transição da barra de ferramentas vertical

  * Conforme `\.ia.rules\state\evidencias\evidencia5.png`, a barra vertical mantém transparência/opacidade que permite visualizar o conteúdo ao fundo durante o scroll, inclusive a barra horizontal, cuja borda acaba visualmente cortada apesar do padding existente.
  * A barra vertical DEVE possuir fundo opaco/adequado ao tema quando em estado de sobreposição, impedindo interferência visual do conteúdo subjacente sem descaracterizar o design.
  * A mudança entre os estados DEVE ocorrer em um **ponto de scroll claramente definido e adequado**, de forma súbita quanto à troca de estado, porém acompanhada de transição/animação curta e sutil; NÃO realizar mudança progressiva proporcional ao scroll.
  * Preservar posição, dimensões, padding, bordas, responsividade, comportamento sticky/fixed existente e relação com a barra horizontal, alterando somente o necessário para eliminar a sobreposição visual indevida.
  * A solução DEVE respeitar os temas/estados visuais já existentes e NÃO introduzir regressão em navegação, interação, contraste ou demais componentes adjacentes.

- [ ] Otimizar e normatizar a geração/baixamento de PDF para produzir arquivo de alta qualidade, visualmente equivalente à impressão nativa e com tamanho comparável ao PDF gerado pelo navegador.
  - **Problema observado**
    - Para a mesma página:
      - impressão nativa do navegador em PDF: ~`114 KB`;
      - PDF gerado pela ação/script do projeto: ~`24 MB`.
    - A diferença de aproximadamente duas ordens de grandeza evidencia grave ineficiência no pipeline atual.
    - Como o conteúdo é predominantemente, quando não integralmente, textual, tamanhos dessa magnitude NÃO são aceitáveis sem justificativa técnica objetiva.
  - **Precedência**
    - Preservar integralmente as diretrizes vigentes do RCF referentes à geração/impressão em PDF.
    - O PDF gerado pelo projeto DEVE continuar visualmente equivalente ao resultado da impressão nativa do navegador.
    - É PROIBIDO reduzir tamanho mediante degradação perceptível, perda da qualidade necessária à impressão, alteração de layout, tipografia, paginação, cores, margens, posicionamento, escala ou demais características visuais normatizadas.
  - **Inspeção obrigatória**
    - Identificar o botão/ação, pipeline, código, dependências e configurações efetivamente responsáveis pela geração e download do PDF.
    - Comparar tecnicamente o PDF atual com o produzido pela impressão nativa, verificando principalmente:
      - rasterização desnecessária de páginas ou conteúdo textual;
      - resolução/DPI excessivos ou inadequadamente aplicados;
      - imagens ou canvases incorporados em dimensões/resoluções superiores às efetivamente necessárias;
      - ausência ou insuficiência de compressão;
      - fontes integralmente embutidas quando subconjuntos seriam suficientes;
      - duplicação de fonts, imagens, recursos ou objetos;
      - recursos idênticos incorporados repetidamente;
      - metadados, estruturas intermediárias ou conteúdo redundante;
      - qualquer outra causa comprovada de crescimento anormal.
    - NÃO presumir a causa: determiná-la a partir do estado real e, quando útil, da estrutura interna dos PDFs comparados.
  - **Norma**
    - Atualizar o RCF aplicável para estabelecer explicitamente que:
      - PDF destinado à impressão DEVE preservar a qualidade necessária à reprodução impressa;
      - alta qualidade NÃO significa rasterização indiscriminada, resolução arbitrariamente elevada ou ausência de otimização;
      - conteúdo textual e vetorial DEVE permanecer textual/vetorial sempre que tecnicamente possível e compatível com a equivalência visual exigida;
      - imagens DEVERÃO utilizar somente a resolução efetivamente necessária à qualidade de impressão prevista, evitando supersampling ou dimensões inúteis;
      - fontes, imagens e demais recursos DEVEM ser incorporados, reutilizados, subsetados e/ou comprimidos de forma eficiente quando isso não alterar o resultado visual;
      - o pipeline DEVE evitar duplicação de recursos e qualquer expansão de tamanho sem benefício visual ou funcional mensurável;
      - o tamanho final DEVE ser tão próximo quanto tecnicamente possível daquele obtido pela impressão nativa do navegador para o mesmo conteúdo, formato e condições equivalentes;
      - diferenças materiais de tamanho DEVEM possuir causa tecnicamente justificável; não existindo justificativa, constituem falha de implementação.
  - **Implementação**
    - Corrigir o pipeline real de geração sem substituir ou contornar requisitos vigentes apenas para reduzir o arquivo.
    - Priorizar representação PDF nativa de texto, vetores, fontes e imagens sobre conversão da página inteira em bitmap.
    - Aplicar somente otimizações compatíveis com equivalência visual e qualidade de impressão.
    - NÃO introduzir tecnologia, biblioteca ou arquitetura nova sem necessidade demonstrada pelo estado real.
    - Preservar API, fluxo de uso, botão/ação, comportamento esperado e compatibilidade existentes, salvo alteração estritamente necessária à correção.
  - **Validação**
    - Usar a mesma página/conteúdo como caso comparativo entre:
      1. impressão nativa do navegador para PDF;
      2. geração pelo mecanismo do projeto após a correção.
    - Verificar:
      - equivalência visual entre ambos;
      - preservação da qualidade em visualização ampliada e impressão;
      - texto selecionável/pesquisável quando originalmente textual e tecnicamente possível;
      - ausência de regressões de layout ou paginação;
      - redução substancial do tamanho frente aos ~`24 MB` atuais;
      - tamanho final comparável ao PDF nativo de ~`114 KB`, admitindo diferença apenas quando tecnicamente necessária e demonstrável.
    - NÃO considerar a tarefa concluída apenas porque o arquivo ficou menor: redução, qualidade e equivalência visual são requisitos simultâneos.
  - **Critérios de aceite**
    - RCF atualizado com a regra de eficiência/tamanho sem enfraquecer as normas atuais de fidelidade e impressão.
    - Causa do tamanho excessivo identificada e corrigida.
    - PDF gerado continua adequado à impressão e visualmente equivalente à impressão nativa.
    - Não há rasterização, duplicação, resolução ou incorporação de recursos desnecessária.
    - O tamanho deixa de apresentar discrepância extrema como `24 MB` versus `114 KB` e passa a ficar tão próximo quanto tecnicamente possível do resultado nativo.
    - Qualquer diferença residual material é documentada e sustentada por necessidade técnica objetiva.
    - Testes/regressões aplicáveis executados e aprovados.
  - **Relatório final**
    - Registrar sucintamente:
      - causa raiz encontrada;
      - alterações realizadas no RCF e na implementação;
      - tamanhos antes/depois e referência nativa;
      - validações executadas;
      - eventual diferença residual e sua justificativa técnica.

* [ ] Desacoplar `merge` da conversão no submódulo Conversor CSV, ampliar os modos de mesclagem e adaptar sua UI para operação compreensível por usuários não técnicos

  * O Conversor CSV DEVE suportar, conforme selecionado:

    * **Conversão** entre modelos, com ou sem `merge` — preservando o comportamento funcional válido já existente;
    * **Apenas mesclagem** de dois ou mais CSVs, SEM conversão de modelo.

  * `merge` NÃO DEVE exigir, direta ou indiretamente, conversão/mudança de modelo quando esta não tiver sido solicitada.

  * Conversão e mesclagem DEVEM permanecer combináveis, porém funcionalmente independentes.

  * A implementação DEVE inspecionar previamente o estado real, contratos, RCFs, normas e UI existentes, preservando compatibilidade e precedências aplicáveis.

  * O conceito de mesclagem DEVE ser ampliado para oferecer resultados equivalentes, quando aplicáveis, a operações conhecidas de combinação tabular como `union`, `left join`, `right join`, `inner/full join` e similares, SEM expor ao usuário final a necessidade de conhecer SQL, programação ou terminologia técnica.

  * A UI DEVE ser orientada ao **resultado desejado pelo usuário**, usando nomes, descrições e escolhas compreensíveis inclusive por pessoas com baixa escolaridade e apenas familiaridade básica com planilhas.

  * Termos técnicos PODEM existir internamente ou como informação secundária, mas NÃO DEVEM ser requisito para compreender ou utilizar a função.

  * Exemplos conceituais de apresentação ao usuário, sujeitos à adequação ao comportamento real, incluem ideias como:

    * manter todas as linhas de ambas as tabelas;
    * manter todas as linhas da primeira e completar com dados da segunda quando houver correspondência;
    * manter todas as linhas da segunda e completar com dados da primeira;
    * manter somente linhas encontradas nas duas;
    * combinar/adicionar linhas sem cruzar colunas indevidamente.

  * Os nomes definitivos DEVEM descrever claramente o efeito sobre as planilhas, não o mecanismo técnico subjacente.

  * Recursos adicionais de conversão e `merge` coerentes com esse modelo PODEM e DEVEM:

    * ser implementados quando seu comportamento puder ser derivado com segurança dos requisitos e normas existentes; ou
    * permanecer explicitamente preparados para rápida implementação quando dependerem de definição funcional ainda insuficiente.

  * Quando um recurso conhecido depender de definição material ainda ausente, É PROIBIDO inventar seu contrato ou comportamento.

  * Nesses casos, a arquitetura DEVE, dentro das normas e da estrutura já existente, prever pontos de extensão claros e mínimos — como hooks, gatilhos, registros/estratégias ou mecanismo equivalente já compatível com a arquitetura — para permitir sua futura inclusão sem refatoração estrutural ampla.

  * Esses pontos de extensão NÃO DEVEM constituir arquitetura especulativa, framework paralelo ou abstração sem uso concreto; DEVEM existir apenas onde houver recurso previsível identificado e justificativa arquitetural real.

  * A UI específica DEVE permitir seleção explícita do modo principal:

    * `Conversão`;
    * `Apenas mesclagem`.

  * A seleção PODE usar `radio` ou controle semanticamente mais adequado à UI existente, sem complexidade desnecessária.

  * Campos, grupos, conjuntos e layouts existentes DEVEM ser reaproveitados sempre que aplicáveis; PODEM ser reorganizados quando pertinente, mas NÃO duplicados ou recriados sem necessidade comprovada.

  * As opções apresentadas DEVEM ser contextuais:

    * opções exclusivas de conversão, incluindo tipo/modo de conversão, somente em `Conversão`;
    * opções exclusivas de mesclagem somente quando `merge` estiver ativo/aplicável;
    * opções compartilhadas somente nos modos em que produzam efeito semanticamente válido;
    * regras de precedência/resolução de conflitos PODEM diferir entre `Conversão + merge` e `Apenas mesclagem` quando os respectivos contratos exigirem isso;
    * opções avançadas DEVEM aparecer apenas quando necessárias à operação escolhida.

  * É PROIBIDO exibir configuração inaplicável, inócua ou sem efeito válido no estado selecionado.

  * A exibição/ocultação condicional dessas subopções DEVE ser realizada em **CSS puro**, aproveitando a estrutura existente sempre que possível, sem JavaScript utilizado apenas para visibilidade/estado visual.

  * A solução CSS DEVE preservar semântica, acessibilidade, navegação por teclado e funcionamento dos controles conforme as normas existentes.

  * A UI DEVE permanecer limpa, profissional, acessível e com baixa carga cognitiva.

  * Recursos avançados DEVEM usar iconização quando isso melhorar reconhecimento/compreensão, sem substituir informação textual indispensável nem depender exclusivamente do ícone.

  * `checkbox`, `radio` e controles equivalentes DEVEM apresentar:

    * um texto principal curto, orientado à ação/resultado;
    * quando necessário, um texto secundário imediatamente associado, muito sucinto e compreensível por usuário com baixo conhecimento técnico.

  * Textos explicativos NÃO DEVEM conter jargão desnecessário, descrições extensas ou conceitos de implementação.

  * Somente recursos e opções necessários e aderentes ao contexto atual DEVEM permanecer visíveis; a UI NÃO DEVE ser poluída pela exposição simultânea de todas as possibilidades.

  * Em todos os modos de conversão e mesclagem, indexação, identidade, correspondência e associação dos registros DEVEM permanecer íntegras, determinísticas e compatíveis com os contratos existentes.

  * É PROIBIDO produzir fuga, deslocamento, cruzamento ou associação de informações entre registros/linhas incorretos, inclusive por divergência de:

    * ordem;
    * índice;
    * chave;
    * quantidade de registros;
    * modelo;
    * ausência/duplicidade de correspondência;
    * estratégia de mesclagem;
    * processamento intermediário.

  * Cada estratégia de `merge` DEVE possuir semântica inequívoca quanto a:

    * quais linhas são preservadas ou descartadas;
    * como correspondências são determinadas;
    * como ausências de correspondência são tratadas;
    * como conflitos/colisões são resolvidos;
    * qual fonte prevalece quando houver precedência;
    * como duplicidades são tratadas;
    * como a integridade entre colunas e registros é garantida.

  * Nenhuma dessas regras PODE ser presumida quando não estiver definida pelo estado real ou pelas normas; lacunas materiais DEVEM ser condicionadas ou encaminhadas para definição normativa.

  * As regras existentes de indexação, identidade, correspondência, precedência, conversão e `merge` DEVEM ser preservadas; adaptações necessárias DEVEM manter integralmente suas garantias.

  * Normas, RCFs, contratos e demais diretrizes existentes DEVEM ser respeitados e, quando necessário, expandidos para normatizar explicitamente:

    * conversão sem `merge`;
    * conversão com `merge`;
    * `merge` sem conversão;
    * múltiplas estratégias de mesclagem;
    * diferenças válidas de configuração e precedência entre os modos;
    * critérios de integridade e associação;
    * comportamento e extensibilidade da UI.

  * A norma NÃO DEVE ser alterada apenas para legitimar implementação divergente ou regressiva; sua expansão DEVE formalizar as novas capacidades preservando contratos válidos e precedências existentes.

  * A validação DEVE cobrir, no mínimo:

    * conversão isolada;
    * conversão + `merge`;
    * `merge` isolado sem conversão;
    * cada estratégia de mesclagem efetivamente disponibilizada;
    * correspondência completa, parcial, inexistente e duplicada;
    * preservação correta das linhas conforme a estratégia selecionada;
    * precedência e resolução de conflitos quando aplicáveis;
    * seleção dos modos na UI;
    * exibição apenas das opções pertinentes ao contexto;
    * visibilidade condicional em CSS puro;
    * reaproveitamento correto dos campos/grupos existentes;
    * clareza dos rótulos para usuários não técnicos;
    * acessibilidade dos controles e iconização;
    * preservação da indexação e associação correta dos registros;
    * ausência de fuga/cruzamento de dados;
    * ausência de regressão funcional, normativa, arquitetural ou visual.

  * A tarefa somente estará concluída quando:

    * conversão e `merge` puderem operar isoladamente e/ou em conjunto;
    * as estratégias suportadas produzirem resultados tabulares inequivocamente definidos;
    * usuários sem conhecimento técnico puderem escolher o resultado desejado sem compreender SQL/programação;
    * a UI apresentar apenas controles pertinentes ao estado atual;
    * recursos futuros já identificados, mas ainda indefinidos, puderem ser adicionados pelos pontos de extensão previstos sem ruptura arquitetural;
    * nenhuma combinação válida permitir perda de integridade, associação incorreta, fuga/cruzamento de dados ou violação das normas existentes.

- [ ] Adicionar reset individual ao campo `Mês inicial` no submódulo de Faturamento
  - Ao lado do campo `Mês inicial`, DEVE existir um botão visualmente adequado ao layout existente, com ícone de **atualizar/restaurar**.
  - Ao ser acionado, o botão DEVE resetar **exclusivamente** a configuração de `Mês inicial`, sem alterar qualquer outro campo ou preferência.
  - O valor restaurado DEVE corresponder exatamente ao **mês/ano padrão que seria inicialmente gerado pelo sistema caso não existisse nenhum dado/configuração salva para esse campo**.
  - O reset NÃO DEVE usar valor fixo, arbitrário ou duplicar lógica de cálculo; DEVE reutilizar ou derivar da mesma regra/fonte responsável pela inicialização original do campo.
  - A implementação DEVE preservar as normas, padrões visuais, acessibilidade, comportamento e arquitetura existentes do submódulo.
  - O botão DEVE permanecer claramente associado ao campo, sem poluir ou desorganizar o layout.
  - Validar que:
    - o reset afeta apenas `Mês inicial`;
    - o valor restaurado é idêntico ao valor inicial calculado na ausência de dados salvos;
    - demais configurações permanecem intactas;
    - recarregar/reabrir o estado mantém o comportamento esperado conforme as regras de persistência existentes.