# Solicitação canônica - FT-022

- Origem: prompt humano recebido em 2026-08-27T12:41:37-03:00, acompanhado de evidência visual PNG.
- Identidade: correção cirúrgica dos marcadores e do alinhamento justificado no rodapé das Declarações Unificadas.
- SHA-256 do corpo canônico: `D72FAF145458C1374A0249F51673A5B3F077E013F9D2B953400489F84522BCD6`.
- SHA-256 da evidência visual: `0E83ADFD479DEFF8C8495A643566C3675A573C5234FBBFAB364C48260F460265`.
- FTs vinculadas: FT-022 (normatização) e FT-023 (implementação posterior).
- RCF de destino: `src/declaracoes/unificada/RCF.md`.
- Estado de incorporação: incorporado integralmente no RCF específico e no contexto da FT-023; implementação não iniciada.

<!-- source:start -->
Conforme o anexo, corrija **cirurgicamente** o formulário de **Declarações Unificadas**, preservando integralmente os demais recursos, estilos, normas e comportamentos válidos existentes.

* No texto de rodapé que qualifica/lista pessoas físicas e jurídicas, o marcador `[N]` DEVE:

  * permanecer em **negrito**;
  * ser renderizado como `<sup>`;
  * possuir fundo cinza configurável, com padrão equivalente a **20%**, utilizando a configuração centralizada apropriada;
  * ser exibido visualmente como `[ N ]`, preservando os espaços;
  * comportar-se como **bloco textual indivisível**, sem quebra, fragmentação ou separação interna caso não caiba ao final da linha (`nowrap` ou mecanismo semanticamente equivalente).

* Quando esse mesmo marcador for **referenciado no corpo do texto**, DEVE:

  * permanecer em **negrito**;
  * NÃO usar `<sup>`;
  * NÃO possuir fundo cinza;
  * manter sua semântica e vinculação já existentes.

* O anexo também demonstra regressão/problema no alinhamento justificado: a linha imediatamente posterior a `eletronicamente por ` apresenta recuo/espaço indevido à esquerda, desalinhando o parágrafo.

  * Identifique e corrija a **causa real** desse espaçamento;
  * o parágrafo DEVE manter alinhamento justificado contínuo e uniforme, sem indentação/recuo artificial em linhas subsequentes;
  * NÃO introduza correção específica baseada apenas no texto citado se a causa for estrutural/generalizável.

Valide ambos os contextos do marcador (`qualificação/listagem` versus `referência`) e o comportamento do parágrafo em diferentes quebras de linha, sem regressão de layout, impressão, responsividade ou demais estilos normatizados.
<!-- source:end -->
