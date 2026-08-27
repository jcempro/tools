# Subcontexto 03 - Tabelas semânticas das Declarações Unificadas

- Fase: concluída na FT-021.
- Objetivo: dimensionar colunas equivalentes conforme sua estrutura e conteúdo real, com marcador textual de seleção centralizado.
- Entradas: Markdown compilado, HTML sanitizado, SCSS local, paginação e testes documentais.
- Restrições: inferência determinística; nenhuma heurística por texto de uma declaração específica; preservar padding mínimo e conteúdo textual legível.
- Entregáveis: classificação estrutural reutilizável no módulo e regras CSS semânticas.
- Estado: implementado e validado; classificação estrutural pós-sanitização e célula de marcador compacta/centralizada materializadas sem heurística posicional.
- Aceite: colunas de marcador compactas, colunas textuais não comprimidas e ausência de regressão nas demais tabelas.

## Handoff

- Classificar após sanitização e antes da medição somente colunas cujo corpo não vazio seja integralmente `X`, sem estrutura mesclada ambígua; aplicar classe semântica e CSS de largura mínima/centralização, preservando o fluxo comum das demais colunas.
