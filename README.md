# Modelos JeanCarloEM

Projeto estático para modelos e utilitários Web publicados em GitHub Pages.

O caminho `/` publica um workspace sem aplicativo aberto por padrão. Catálogo, aplicativo inicial e orientação da navegação ficam em `src/assets/config/apps.json`. Temas claro/escuro são persistidos localmente sem alterar a folha impressa. Estilos-fonte usam SCSS e são transpilados para CSS comprimido no build.

O site público carrega o Silktide Consent Manager por CDN conforme `src/assets/config/consent.json`; bundles offline não carregam recursos remotos e exibem o aviso de cookies essenciais e armazenamento local.

O estado técnico retomável está em [handoff.md](handoff.md).

## Desenvolvimento

```bash
npm install
npm run dev
```

Com recarregamento automático:

```bash
npm run dev-live
```

## Validação e Build

```bash
npm run check
npm run build
npm run publish
```

`src/` é a única fonte canônica para TypeScript, TSX, HTML, CSS e RCFs específicos. `dist/` é a única saída gerada: raiz publicada, artefato de produção e local dos bundles offline `*.bundle.zip`.

`scripts/config.json` é a fonte central da toolchain: caminhos, URL pública, servidor local, dependências offline, entradas de build e contrato GitHub Pages. `build:web`, `build:offline-bundles`, `validate:publication` e `validate:all` explicitam a especialização. Com commits consolidados e árvore limpa em `dev`, `publish`/`agent:publish` valida, sincroniza o remoto, integra a branch primária, aciona o Pages e confirma o SHA público; `publish:pages` somente prepara o artefato dentro do CI, sem mutar Git.

Toolbar, ícones, tooltips, exportação/importação local e o contrato único de folha/Ctrl+P/PDF são infraestrutura global em `src/assets/`; módulos declaram apenas perfil e conteúdo interno. Ícones usam pacotes Font Awesome modulares e apenas as definições gratuitas efetivamente importadas entram no bundle.

Favicons e manifests devem ser gerados por alvo durante o build a partir do logo global ou do logo próprio do módulo, conforme configuração central. A publicação Web recebe o perfil completo compatível com sua base path; cada Bundle incorpora somente o favicon offline útil de sua própria identidade.

Novos módulos usam identidade visual Adobe-like baseada, preferencialmente, em duas letras estratégicas do nome público. O monograma deve ser próprio, estilizado e legível nos tamanhos reais do catálogo, cabeçalho e favicon; detalhe gráfico é admitido apenas quando sutil e pertinente. A regra é prospectiva e não determina refatoração dos logos preexistentes.

## Conteúdo Markdown de declarações unificadas

O módulo em preparação `declaracoes/unificada` mantém cada declaração, autorização ou adesão em um arquivo Markdown UTF-8 separado, ordenado por `conteudo/manifest.json`. Entram exclusivamente as seis tabelas externas com fundo cinza `#d9d9d9` do ODT, incluindo suas tabelas internas; conteúdo externo a esses blocos não integra os Markdown. Cada arquivo usa exatamente um título `#`, parágrafos, listas e tabelas necessários para reproduzir o documento de origem; HTML arbitrário, scripts, estilos e includes remotos não fazem parte desse modo de autoria.

Correções limitam-se a defeitos sintáticos mecânicos inequívocos da origem/conversão, com registro da transformação. Escolha lexical, obrigações, valores, referências, ordem, alcance semântico e estrutura documental permanecem intactos; dúvida preserva literalmente o ODT para decisão humana.

O build será responsável por validar o manifesto, converter o Markdown para HTML sanitizado e incorporar o resultado tanto na versão Web quanto no Bundle. Os arquivos `.md` são fonte normativa de desenvolvimento e não devem ser buscados ou publicados como recursos de runtime. Frases, templates, fundo e espaçamentos ficam na configuração central `src/assets/config/declaracoes-unificada.json`, não nos arquivos de conteúdo.

Autoria, licença, disclaimer, isenção de responsabilidade e textos institucionais são fonte única do chrome global. O autor exibido é sempre JeanCarloEM, com link para `https://www.jeancarloem.com`.
