# Modelos JCEM

Projeto estático para modelos e utilitários Web publicados em GitHub Pages.

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
```

`src/` é a única fonte canônica para TypeScript, TSX, HTML, CSS e RCFs específicos. `dist/` é a única saída gerada: raiz publicada, artefato de produção e local dos bundles offline `*.bundle.zip`.

Entradas explícitas de build, bookmarklets e arquivos raiz publicados ficam em `scripts/config.json`.
