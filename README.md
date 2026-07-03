# Modelos JCEM

Projeto estático para modelos e utilitários Web publicados em GitHub Pages.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para desenvolvimento com recarregamento automático:

```bash
npm run dev-live
```

## Validação

```bash
npm run check
```

## Build

```bash
npm run build
```

O build materializa o cache intermediário em `site/` a partir de `src/` e prepara `dist/` com arquivos otimizados e bundles offline `*.bundle.zip`.

O código-fonte canônico fica em `src/`, incluindo TypeScript, TSX, HTML, CSS e RCFs específicos. `site/` é cache de construção e `dist/` é a saída final de produção.
