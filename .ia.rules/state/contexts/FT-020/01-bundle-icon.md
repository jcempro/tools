# Subcontexto 01 - Ícone de download do Bundle

- Fase: normatização; implementação futura na FT-021.
- Objetivo: substituir a representação dupla por uma única instância do ícone Iconify já cadastrado.
- Entradas: `RCF.md`, catálogo e resolvedor globais, consumidores `[data-bundle-download]`, build Web/Bundle.
- Restrições: remover Font Awesome somente se o uso ficar comprovadamente órfão; preservar rótulo acessível, tooltip, ação, rota e demais ícones.
- Entregáveis: regra global precisa, teste de renderização única e inventário mínimo de dependências.
- Estado: em andamento.
- Aceite: um SVG, identidade correta, nenhuma composição ou fallback cruzado e nenhuma alteração fora do consumidor de Bundle.
