# AGENTS.md — Governança Operacional Global

## 0. Finalidade, autoridade e portabilidade

Este arquivo normatiza o comportamento operacional da IA/Codex sem alterar instruções intrínsecas da plataforma, atuais ou futuras. Deve ser copiável entre repositórios sem adaptação.

- **Desacoplamento:** proibidos URLs, paths físicos, nomes próprios ou regras exclusivas do repositório.
- **Referências universais:** permitidos conceitos não arbitrários do ecossistema, como `.gitignore`, `AGENTS.md`, `agents.local.md`, `continue.ia`, `continue.dev`, RCF, build, cache, branch, commit e CI/CD, sem localização concreta.
- **Especialidade:** este arquivo governa método de trabalho, raciocínio operacional, cache, FT, codificação, distribuição, transpilação, build e validação; não substitui RCF nem define negócio.
- **Extensão local:** `agents.local.md`, quando existente, é incluído pelo AGENTS global e contém somente particularidades não replicáveis do repositório. Regra, conceito ou refinamento útil a múltiplos projetos pertence ao AGENTS global, nunca ao local.
- **Código de terceiros:** conteúdo importado (`node_modules/` e equivalentes) não deve ser analisado como alvo de manutenção, editado ou programado. Torna-se elegível apenas após incorporação definitiva ao código pertencente ao repositório.

## 1. Domínios normativos e precedência

### 1.1 Separação de matéria

- **AGENTS:** soberano sobre sua governança intrínseca e seus subordinados operacionais diretos; RCF não pode reescrevê-los, convertê-los em regra local nem particularizá-los.
- **RCF:** soberano no escopo do projeto: arquitetura, comportamento, negócio, contratos, requisitos e arquivos especializados correlatos. Pode ser modularizado em vários `.md` para indexação seletiva e menor reprocessamento.
- **Exceção:** arquivos locais criados pelo RCF para regras de negócio submetem-se ao RCF, sem alterar o AGENTS global.
- **Compatibilização:** AGENTS define **como executar**; RCF define **o que o projeto exige**. Aplicar ambos. AGENTS não altera negócio; RCF não altera a identidade operacional do AGENTS.

### 1.2 Ordem aplicável

Após instruções superiores da plataforma, resolver conflitos conforme a matéria:

1. **Governança operacional:** `AGENTS.md` → RCF global → RCF específicos → `README.md` → `continue.ia`/`continue.dev` → demais documentos formais.
2. **Projeto, arquitetura e negócio:** RCF global → RCF específicos → `README.md` → `continue.ia`/`continue.dev` → demais documentos; o AGENTS permanece obrigatório quanto ao método, sem substituir a norma material.
3. **Regra local não replicável:** `agents.local.md`, limitada pelo AGENTS global e pelos RCFs aplicáveis.

Conflitos transversais devem ser resolvidos sem alterar o comportamento do projeto nem o conteúdo intrínseco do AGENTS. Persistindo ambiguidade, aplicar §12.5.

## 2. Edição normativa e densidade textual

Esta seção é a autoridade global para edição de RCFs, AGENTS, `agents.local.md`, `continue.ia`/`continue.dev`, README e documentação análoga; substitui regras editoriais inferiores conflitantes.

### 2.1 Regra de ouro

Maximizar informação por caractere: eliminar redundância, introduções longas, floreios, preenchimento e explicações óbvias; preservar integralmente regras, restrições, exceções, prioridades, precedências, condicionantes, dependências, precisão, profundidade, contexto, rastreabilidade, nuances interpretativas, exemplos, analogias, contraexemplos e referências úteis. **Concisão reduz forma, nunca substância.** Preferir referências internas e microexplicações quando reduzirem tokens sem perda semântica.

### 2.2 Perfis obrigatórios

- `AGENTS.md`, `agents.local.md`, `continue.ia`/`continue.dev` e associados: **90% máquina/IA; 10% humano** — sintaxe diretiva, estrutural e maximamente densa.
- RCFs: **75% máquina/IA; 25% humano** — alta densidade técnica com contexto humano mínimo suficiente.
- README e documentação análoga: **50% máquina/IA; 50% humano** — equilíbrio entre didática e indexação limpa.

### 2.3 Preservação de autoria

- Alterações manuais do desenvolvedor não podem regredir.
- Todo parágrafo, título ou elemento criado/alterado por máquina deve receber marcador estável, não renderizado e não imprimível, conforme mecanismo definido pelo fluxo/RCF; o marcador não pode afetar conteúdo, diffs semânticos, build ou publicação.
- Cabeçalhos, comentários úteis e convenções existentes devem ser preservados. Comentário só muda se ficar incorreto ou induzir interpretação errada.

## 3. Mapa de arquivos, leitura e cache

Manter em contexto um mapa estrutural ultra-sucinto dos **arquivos úteis**: somente fontes, normas, configurações e artefatos necessários ao desenvolvimento e à retomada.

- Excluir do mapa builds, transpilações, compilações, testes intermediários, temporários, lixo e artefatos sem valor histórico.
- Avaliar arquivos novos/modificados para distinguir alterações manuais e atualizar o mapa quando úteis.
- Ler fisicamente apenas arquivo indispensável ausente do contexto ou divergente da versão física.
- Em contexto parcial, processar somente faltantes/modificados necessários.
- Não reler, reanalisar ou reexecutar norma, arquivo, comando, tentativa, verificação, planejamento ou raciocínio já suficiente, salvo mudança observável, nova evidência, decurso relevante, atualização de versão ou ganho concreto esperado.
- Persistir no contexto disponível: AGENTS, RCFs, FTs, decisões, arquivos já analisados, alterações, comandos falhos e resultados. `continue.ia`/`continue.dev` é a memória durável; o cache da IA é complementar, nunca substituto.
- Otimização não autoriza superficialidade: quando o contexto for insuficiente, executar toda leitura, análise e validação necessárias para maximizar eficiência, desempenho, acerto, segurança e aderência, buscando erro nulo.

## 4. Modelo de execução orientado por estado

Ciclo obrigatório:

`Solicitação → intenção → FT → planejamento/atualização → execução incremental → atualização contínua do continue → validação → commit → push → próxima etapa`

Antes de implementar:

1. identificar intenção, contexto e objetivos;
2. localizar a FT correspondente no `continue.ia`/`continue.dev`;
3. classificá-la como continuação, ampliação, dependência ou nova FT;
4. identificar etapa e tarefa atuais;
5. atualizar o planejamento quando necessário;
6. executar exatamente do estado registrado.

Não reiniciar análise, verificação ou planejamento concluído sem justificativa técnica objetiva. Concluir integralmente as pendências da FT correspondente antes de iniciar implementação posterior incompatível com ela.

## 5. Frentes de Trabalho (FT)

Toda solicitação pertence a exatamente uma FT; várias FTs podem coexistir.

### 5.1 Estrutura mínima

Cada FT deve conter:

- `id` permanente e imutável (`FT-001`, `FT-002`...);
- nome descritivo, evolutivo quando representar melhor o objetivo;
- objetivo sucinto, evolutivo quando representar melhor o contexto;
- prioridade e status;
- escopo `Técnico` ou `Negócio`;
- início, última atualização e conclusão em timestamp;
- planejamento integral de etapas e tarefas;
- estado de interrupção/retomada, quando aplicável.

Uma FT contém uma ou mais etapas; cada etapa, uma ou mais tarefas. Só conclui quando todas as etapas planejadas estiverem concluídas.

### 5.2 Escopo universal

1. **Técnico — estrutura/mecanismo (The Engine):** construir, programar, projetar, corrigir ou estruturar ferramenta, lógica ou sistema. Objetivo: fazer a engrenagem funcionar. Exemplos: software, cálculo estrutural, planilha automatizada, roteador, blueprint mecânico.
2. **Negócio — conteúdo/substância (The Substance):** preencher, comunicar, pesquisar ou produzir o material que trafega na estrutura. Objetivo: gerar informação/mensagem final. Exemplos: artigo, pesquisa histórica, relatório de vendas, roteiro, campanha.

### 5.3 Segregação

Quando reduzir contexto e processamento, cada FT pode residir em subarquivo próprio, dentro de subdiretório claramente nomeado na raiz. Esses arquivos devem permanecer versionados; se padrões do `.gitignore` os alcançarem, usar exceção explícita (`!`) para impedir exclusão acidental.

## 6. Planejamento, etapas e tarefas

### 6.1 Planejamento

Criar o planejamento inicial antes da implementação. Cada etapa deve registrar nome, posição `X/N`, objetivo sucinto e dependências técnicas existentes. Exemplo ilustrativo:

```text
FT-003 — Centralização das Configurações
1/8 Levantamento
2/8 Estrutura JSON
3/8 Migração das Validações
4/8 Atualização da UI
5/8 Ajustes do Build
6/8 Testes
7/8 Documentação
8/8 Validação Final
```

O planejamento é dinâmico e pode ser expandido, reduzido, reorganizado, renumerado, dividido ou consolidado; toda mudança deve ser imediatamente refletida no `continue.ia`/`continue.dev`. Manter sempre a lista prevista de etapas e tarefas. Itens concluídos não podem ser eliminados enquanto a FT estiver ativa.

Após a conclusão:

- resumir o registro integral com compressão médio-agressiva, sem omissão material;
- manter o histórico por **exatamente 15 dias**;
- remover integralmente FTs concluídas há mais de 15 dias.

### 6.2 Etapas

Toda implementação relevante deve ser dividida em etapas pequenas, independentes, verificáveis e ajustadas ao contexto.

Cada etapa:

- pertence obrigatoriamente a uma FT;
- possui nome e posição `X/N`;
- discrimina todas as tarefas previstas;
- termina em estado funcional: sistema executável e consistente, ainda que não implemente toda a FT ou todo o RCF.

### 6.3 Tarefas

Tarefa é a granularidade mínima de execução e retomada. Cada tarefa:

- pertence a uma etapa de uma FT;
- possui nome e posição `X/N`;
- deve ser prevista e discriminada;
- preferencialmente deixa estado funcional, sem obrigatoriedade equivalente à etapa.

### 6.4 Conclusão incremental

Ao concluir tarefa ou etapa:

1. validar consistência e impacto;
2. atualizar imediatamente o `continue.ia`/`continue.dev`;
3. aplicar commit conforme RCF; na ausência de regra completa, usar PT-BR, até 512 caracteres, distinguindo `fix`, melhoria/aprimoramento e ajuste;
4. executar commit e push imediatamente, quando tecnicamente possível;
5. só então iniciar o próximo item.

Regras adicionais:

- Não acumular várias etapas antes do commit.
- Commit de etapa deve representar estado funcional.
- Tarefa pequena/sutil — inclusive múltiplos ajustes mínimos de texto/posição — pode dispensar validação, commit e push próprios e ser consolidada na conclusão da etapa, quando isso reduzir custo sem afetar rastreabilidade.
- Alteração moderada exige no mínimo 2 commits; agressiva, 4, sem substituir commits obrigatórios por etapa.

## 7. `continue.ia` / `continue.dev`: memória operacional oficial

No repositório deve existir **exatamente um** arquivo canônico: `continue.ia` ou `continue.dev`; referências legadas a `continua.ia` designam o mesmo conceito e devem convergir ao nome canônico adotado. O arquivo complementa, sem eliminar, a memória contextual da IA.

### 7.1 Formato

Deve ser rastreável, indexável, legível por humanos/máquinas/IAs e segregável em conjuntos/subconjuntos. Aceitos: sintaxe própria, YAML, JSON ou formato equivalente. Evitar XML por ineficiência, salvo justificativa técnica. Compatibilidade com IDEs que leiam Continue/continue.dev é desejável, não obrigatória. Aplicar o perfil editorial 90/10.

### 7.2 Objetivos

- retomada praticamente exata após interrupção;
- mínimo reprocessamento e repetição;
- preservação de decisões, verificações e falhas;
- redução de processamento sem perda de qualidade.

### 7.3 Registro mínimo por FT

Registrar separadamente:

- id, nome, escopo, objetivo, prioridade e status;
- timestamps de início, última atualização e conclusão;
- etapa atual `X/N` e nome;
- lista integral de etapas;
- tarefas planejadas, atual/em execução e concluídas;
- progresso parcial e próximo ponto executável;
- linha de raciocínio adotada em forma objetiva e retomável;
- decisões arquiteturais;
- verificações concluídas;
- comandos relevantes;
- pendências, limitações e dependências;
- hipóteses descartadas;
- causas objetivas de falhas;
- decisões antirretrabalho.

Nunca registrar somente `3/12`. Registrar, no mínimo:

```text
FT-00X — <nome>
Etapa X/N — <nome>
Tarefa Y/M — <nome>
```

### 7.4 Atualização contínua

Atualizar durante toda a execução, não apenas ao concluir etapa/tarefa, incluindo:

- conclusão de tarefa ou etapa;
- evolução do planejamento;
- decisão relevante;
- hipótese descartada;
- verificação que elimina possibilidades;
- falha, causa e solução;
- qualquer dado que permita retomada sem reprocessamento.

### 7.5 Aprendizado de ambiente

Manter base concisa e dinâmica de problemas, tentativas, soluções e ajustes:

- `MACHINE_ID`: vincular cada registro à máquina/sistema. Tratar falha como local por padrão; classificá-la global somente com evidência de recorrência em múltiplas máquinas.
- `DATA_REF`: última atualização obrigatória em `YYYYMMDDHHMM`, permitindo expurgo de registros obsoletos.
- `CACHE`: manter no contexto quando disponível; reprocessar integralmente apenas após atualização da base ou quando um subarquivo dedicado exigir recarga.
- Bloquear repetição de ação historicamente falha/insuficiente. Retentar somente após decurso significativo, alteração documentada do ambiente, nova evidência ou atualização de versão.

## 8. Interrupção e retomada

Ao detectar iminente esgotamento de tempo, créditos, contexto ou trava de custo computacional:

1. interromper controladamente;
2. salvar no arquivo canônico todo progresso real, estado, decisões, histórico e pendências imediatas;
3. anexar ao id da tarefa atual a flag `[INTERROMPIDO_POR_LIMITACAO_DE_RECURSOS]` e resumo ultra-sucinto do próximo passo.

Na interação subsequente, antes de implementar:

1. procurar a flag;
2. carregar o estado e validar alterações manuais ocorridas durante a pausa;
3. se a nova solicitação equivaler a continuar, retomar imediatamente; caso contrário, apresentar resumo mínimo do ponto de parada e solicitar decisão de retomada;
4. remover a flag somente após retomada bem-sucedida.

Sem flag, localizar FT, etapa e tarefa correspondentes e continuar exatamente do registro. Nova FT deve ser registrada com objetivo, planejamento, etapas e tarefas previstas antes da execução. Mudança significativa de escopo exige reorganização e registro objetivos.

## 9. Branches, commits, push e merge

- Todo desenvolvimento ocorre no branch `dev`.
- Ao concluir uma FT, realizar merge em `main` ou `master` somente se o sistema global estiver funcional; considerar outras FTs em andamento cujo estado torne o merge inseguro.
- Antes de alterar, verificar branch e working tree.

Se o branch atual não for `dev` e houver alterações unstaged, parar e solicitar escolha explícita, ignorando qualquer opção da IDE que dispense a pergunta:

1. alternar para `dev`, preservando seu conteúdo original;
2. criar/atualizar `dev` a partir do último commit de `main`/`master`;
3. alternar para `dev`, levando o estado atual e mesclando-o;
4. continuar no branch atual.

Quando tecnicamente possível, cada tarefa e, obrigatoriamente com maior prioridade, cada etapa terminam em commit seguido de push. Não declarar commit/push/merge sem comprovação objetiva (crie comando npm que automatizem e reduzam custos de IA).

## 10. Implementação, regressão e sincronização

Nenhuma implementação pode regredir:

- arquitetura, negócio, UX ou API pública;
- build, cache, desempenho ou compatibilidade;
- CI/CD, GitHub Actions, GitHub Pages, publicação, workflows e pipelines;
- bundles offline;
- `_site`, `dist/` ou diretório equivalente de produto final.

Objetivo permanente: melhorar e evoluir. Regressão só é admissível mediante solicitação explícita do desenvolvedor; confirmar expressamente para eliminar possível incompreensão.

Sempre que arquitetura, regras, comportamento, build, fluxo, UX, UI, operadores, notações, recursos ou documentação mudarem, sincronizar automaticamente, conforme aplicabilidade:

- `AGENTS.md` e `agents.local.md`;
- README;
- RCFs pertinentes;
- `continue.ia`/`continue.dev`;
- implementação e UI afetadas.

## 11. Build, runtime e produto final

### 11.1 Restrições gerais

Proibido:

- alterar negócio sem autorização normativa;
- introduzir regressão;
- duplicar código;
- adicionar dependência desnecessária;
- aumentar complexidade sem benefício técnico;
- realizar refatoração ampla, reorganização gratuita ou mudança comportamental não solicitada.

Manter, quando aplicável e conforme RCF: ES2020+ ou versão definida, GitHub Pages, GitHub Actions, bundles offline, workflows, pipelines e diretório final (`_site`, `dist/` ou equivalente).

Priorizar: menor build, instalação, download, consumo, latência e tempo de carregamento; maior autonomia do produto final; evolução contínua do RCF sem perda de princípios.

### 11.2 Segregação runtime/build

O diretório final deve ser autônomo e conter somente artefatos/assets finais, scripts necessários e dependências indispensáveis ao runtime. Nada usado exclusivamente em desenvolvimento, build, transpilação, bundling, minificação, otimização, geração de assets, documentação, lint, testes ou automação pode integrá-lo nem ser instalado nele.

Sempre que tecnicamente possível, incorporar ao artefato final os recursos resolvidos na compilação, eliminando dependência de runtime e materializando somente partes usadas. Exemplo: se apenas alguns SVGs, ícones, fontes, CSS, componentes ou templates da Font Awesome forem usados, incorporar somente esses itens; não incluir a biblioteca integral nem mantê-la em runtime quando o build absorveu sua função. Aplicar o mesmo princípio a toda biblioteca/framework, preservando funcionalidade.

### 11.3 CDN

O RCF decide sobre CDN. Em silêncio ou incongruência:

- produto deliberadamente online: CDN é padrão quando a URL compartilhada puder aproveitar cache do navegador;
- preferir incorporação local parcial/customizada quando reduzir tamanho, latência ou banda;
- bundle offline: manter todos os recursos necessários localmente e evitar rede por definição;
- bundle não é necessariamente offline; o RCF deve explicitar a finalidade quando a decisão não for inequívoca.

## 12. Padrões de implementação

### 12.1 Análise

- Idioma obrigatório: PT-BR.
- Antes de alterar: detectar falhas, prevenir regressões, validar impacto e entregar solução final.
- Não apresentar hipótese como conclusão sem validação.
- Aplicar rigor, minúcia, melhores práticas e codificação defensiva contra bugs/falhas previsíveis.

### 12.2 Alteração

Objetivo: diff mínimo.

Preservar estrutura, fluxo, comentários úteis, contratos, convenções e compatibilidade. Permitida somente refatoração cirúrgica: localizada, mesmo objetivo e mesmo contrato. Documentar motivo, objetivo, impacto e validação. Após estabilização, manter apenas comentários necessários.

### 12.3 Bugs e proteções

Código aparentemente redundante pode conter correção não documentada. Na dúvida, preservar e marcar:

```text
// PRESERVADO: potencial correção de bug não documentada
```

Correção/prevenção nova deve usar, em uma linha salvo necessidade estrita:

```text
// FIX-BUG: <descrição mínima>
// PROTECAO: <descrição mínima>
```

Não remover sem análise: `catch` vazio, tratamento de erro ou validação existente.

### 12.4 Estilo

- Proibidos pronomes autorreferenciais/interlocutórios: “eu”, “você”, “nós”.
- Evitar “talvez”, “pode ser”, “provavelmente” e adjetivos subjetivos.
- Priorizar declarações determinísticas, baixa redundância, baixo acoplamento e baixo custo cognitivo.

### 12.5 Ambiguidade

Aplicar a interpretação mais restritiva, de menor alteração e maior preservação. Em conflito interno, prevalece a regra que menos altera comportamento. Se insolúvel, registrar exatamente:

```text
AMBIGUIDADE INSOLUVEL: <ponto>. Preservando original.
```

## 13. Validação

Comprovar objetivamente, conforme finalidade e RCF:

- ausência de regressões;
- produto final autônomo;
- presença exclusiva de dependências de runtime no diretório final;
- ausência de dependências de desenvolvimento no produto final;
- preservação de comportamento após incorporação de recursos no build;
- independência dos bundles;
- funcionamento de GitHub Pages, Actions, publicação, workflows e pipelines;
- reprodutibilidade do build;
- redução do tamanho final sempre que tecnicamente possível;
- funcionamento dos critérios específicos previstos pelo RCF, inclusive exemplos como links de ajuda, painel retrátil sem JavaScript, validações centralizadas e hierarquia `Global → Sessão → Execução`, quando existentes.

## 14. Documentação e RCF

Os RCFs pertinentes devem normatizar, quando aplicável:

- segregação runtime/build;
- proibição de dependência de desenvolvimento no produto final, salvo justificativa técnica explícita;
- centralização das regras de validação em arquivo único;
- hierarquia de configuração `Global → Sessão → Execução`;
- gestão de implementações por FT no arquivo canônico;
- atualização contínua da memória operacional, inclusive ao concluir tarefas;
- sincronização entre implementação, UI, documentação, AGENTS e RCF quando arquitetura, operadores, notações, recursos ou fluxos mudarem.

## 15. “Implementações em andamento”

Manter na raiz um `.md` gerado automaticamente do `continue.ia`/`continue.dev` por script NPM, nunca editado manualmente, e linkado diretamente no README. Finalidade exclusiva: resumo visual ultra-sucinto das FTs em andamento; por padrão, omitir FTs de escopo `Negócio`, salvo regra diversa do RCF.

### 15.1 Conteúdo

- texto introdutório curto antes da listagem;
- subtítulo próprio por FT;
- objetivo resumido;
- escopo, quando o RCF determinar sua exibição;
- nenhuma informação alheia ao progresso.

### 15.2 Tabela

Usar HTML, não tabela Markdown, para permitir `rowspan`/`colspan`:

- uma linha por etapa, com nome;
- tarefas vinculadas, individualizadas por nome;
- status de etapa e tarefa limitado a `pendente`, `em andamento` ou `concluído`;
- ícone/emoji com cor correspondente e mapeamento único definido pelo gerador;
- dentro da tabela, somente nome da etapa, nome da tarefa e ícone de status.

O detalhamento da memória operacional não pode ser reproduzido nesse arquivo.

## 16. Saída final

Toda entrega deve incluir:

```text
COMMIT_SUGERIDO: <texto PT-BR, objetivo, suficientemente detalhado, máximo 512 caracteres; separar fix, melhoria/aprimoramento e ajuste quando aplicável>
PENDENCIAS: <informar explicitamente etapas, tarefas ou pendências restantes; usar “nenhuma” quando concluído>
```
