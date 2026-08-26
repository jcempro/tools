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

* [ ] Implementar novo submódulo: o formulário unificado definido por `.ia.rules\state\evidencias\UNIFICADO.odt` e `.ia.rules\state\evidencias\Evidencias-MARCAS-Unificadas.PDF`, após inspeção do estado real do projeto, obedecendo integralmente `RCF.md`, `AGENTS.md` e demais normas vigentes quanto a arquitetura, layout, estilo, interação, exibição, impressão e modus operandi; NÃO presumir, inventar ou preencher lacunas quando isso puder causar incompatibilidade, perda funcional ou regressão.

  * Integrá-lo como ferramenta nativa do modelo **multitools**, reutilizando bibliotecas globais, scripts, estilos, componentes visuais e mecanismos de interação existentes; É PROIBIDO criar implementação paralela/incompatível sem necessidade comprovada.
  * Preservar fielmente conteúdo, estrutura e semântica das declarações/autorizações/adesões de `UNIFICADO.odt`; conteúdo normativo NÃO DEVE ser editável pela GUI: DEVE permanecer individualizado em arquivos `.md`, organizados na estrutura vigente e incorporados ao bundle conforme o mecanismo existente/especificado.
  * Implementar estritamente as especializações visuais/funcionais documentadas: cabeçalho forçado em maiúsculas com os títulos incluídos e paginação em negrito; rodapé uniforme em todas as páginas; quebra de declaração somente quando necessária, sem interferir em cabeçalho/rodapé; numeração automática dos declarantes; fundo/paddings configuráveis; data automática customizável, município/UF; e vinculação, pela GUI, dos representantes de PJ exclusivamente a declarantes previamente cadastrados.   - Preservar a composição do rodapé, incluindo ordenação/referenciação dos declarantes e parametrização textual por `${key}`, conforme evidência; NÃO substituir por solução semanticamente inferior.
  * Tratar as regras desses dois arquivos como **especialização exclusiva deste formulário**: NÃO propagá-las aos demais recursos/formulários. Alterações globais SOMENTE PODEM ocorrer quando a inspeção demonstrar omissão/insuficiência comum e a solução generalizada aprimorar o conjunto sem deterioração, regressão, perda de recursos ou degradação progressiva.
  * Validar GUI, geração, runtime/build, exibição e impressão contra as evidências e normas vigentes; divergência NÃO justificada, regressão ou implementação baseada em hipótese impede a conclusão da TO-DO.
