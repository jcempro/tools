# Subcontexto 03 - Eficiencia do PDF dedicado

- Fase: contrato FT-032; codigo FT-033.
- Objetivo: aproximar o tamanho do PDF dedicado ao nativo preservando fidelidade e qualidade impressa.
- Entradas: TODO raiz, RCF global, adaptador documental, html2pdf/jsPDF, perfis, PDFs comparativos e testes.
- Dependencias: FTs 005/006; mesma folha logica e geometria compartilhada.
- Fora de escopo: degradacao perceptivel, troca de fluxo ou nova tecnologia sem diagnostico.
- Validacao: estrutura, texto pesquisavel, tamanho antes/depois, render comparado, Web/Bundle e Ctrl+P.
- Diagnostico: o adaptador compartilhado rasteriza a folha inteira via html2canvas em escala `6` e JPEG `0.98`, eliminando texto/vetor nativo e produzindo expansão sem benefício proporcional.
- Decisao: preservar botão/hook/API, convergir a ação dedicada ao fluxo nativo `window.print()`, remover o gerador raster sem consumidor e aceitar no máximo `max(1,5 x nativo, nativo + 256 KiB)` sob comparação reproduzível.
- Estado: contrato concluído; FT-033 bloqueada até nova autorização humana posterior ao commit normativo.
