# LISTA DE TAREFAS (TO-DO) — DIRETRIZES DE IMPLEMENTAÇÃO E REGRAS DE NEGÓCIO

## 1. Padronização e Homologação de Linhas 'PREVISTO' (Cálculo de Médias por Coluna)
*   [x] **Isolamento de Estado:** Garantir de forma imperativa que as linhas identificadas com o valor `"PREVISTO"` na coluna `"PREVISTO/REALIZADO"` fiquem totalmente imunes às oscilações e variações sazonais aplicadas às linhas do tipo `"REALIZADO"`.
*   [x] **Cálculo de Média Contextualizada:** Implementar rotina para calcular a média aritmética simples de todos os registros preenchidos como `"REALIZADO"`, segregando estritamente os escopos de cada coluna de valor.
*   [x] **Bloqueio de Contaminação Dinâmica:** Impedir sumariamente a mistura de conceitos contábeis:
    *   A média gerada sobre a coluna `"vendas à vista"` deve abastecer única e exclusivamente as células de `"vendas à vista"` das linhas `"PREVISTO"`.
    *   A média gerada sobre a coluna `"venda a prazo"` deve abastecer única e exclusivamente as células de `"venda a prazo"` das linhas `"PREVISTO"`.
*   [x] **Injeção de Valores Constantes:** Aplicar o resultado das respectivas médias de forma arbitrária e rigorosamente idêntica (valor fixo e constante) em todas as linhas marcadas como `"PREVISTO"`.
*   [x] **Garantia de Simetria Linear:** Validar que, para as linhas `"PREVISTO"`, os valores presentes em uma mesma coluna sejam sempre 100% iguais entre si ao longo de todos os meses projetados, sem exigir qualquer paridade ou igualdade de valores entre colunas distintas (ex: o valor constante de "à vista" pode diferir do valor constante de "à prazo").

## 2. Automação de Cronograma e Gatilhos de Data (Assinatura e Status Mensal)
*   [x] **Gatilho para Meses Futuros ou Atual (`Mês Inicial` $\ge$ `Mês Corrente`):**
    *   [x] Detectar se o parâmetro `"Mês Inicial"` fornecido é igual ou cronologicamente posterior ao mês atual do sistema.
    *   [x] Injetar automaticamente o valor da `"data de assinatura"` para o **primeiro dia útil** do mês imediatamente posterior ao `"Mês Inicial"` selecionado.
    *   [x] Forçar a marcação de status do `"Mês Inicial"` estritamente como `"Realizado"`.
    *   [x] Classificar e marcar todos os meses subsequentes do cronograma obrigatoriamente como `"Previsto"`.
*   [x] **Gatilho para Meses Passados (`Mês Inicial` $<$ `Mês Corrente`):**
    *   [x] Detectar se o parâmetro `"Mês Inicial"` foi retroagido para um período anterior ao mês atual do sistema.
    *   [x] Substituir e ajustar automaticamente a `"data de assinatura"` para refletir a **data atual (hoje)** em tempo real de execução.

## 3. Validação e Consistência (IA Crítica)
*   [x] **Prevenção de Regressão Crítica:** Executar varredura lógica após qualquer alteração no formulário para garantir que nenhum cálculo de média utilize dados projetados (`"PREVISTO"`) como entrada, mantendo o fluxo estritamente unidirecional (`"REALIZADO"` $\rightarrow$ gera média $\rightarrow$ popula `"PREVISTO"`).
*   [x] **Alinhamento de Roteamento Temporal:** Certificar-se de que os ajustes automáticos de data de assinatura disparem a atualização em cascata das regras descritas no bloco de cálculo de médias sem travar a interface do usuário (UI).

## Ícone de MPL2

* [x] O ícone de MPL2 exibido no cabeçalho deve utilizar o .svg existente em `src\assets\img\mpl2.svg`. No github pages, ele deve ser lincado, e não incorporado, e no bundles, deve ser incorporado.

## Aderência a centralização de configs

* [x] Todas as configurações deve ser unificadas, não necessariamente em um único arquivo, mas em um único local. A segregação em multiplos arquivo é permitido pelo `agents.md` e permite separar por contexto, entretando não deve-se permitir que os dados claramente personalizáveis, existam soltos em várias estruturas hierarquicas, e nem diretamente em múltiplos arquivos de código/script.

## barra de campos preenchíveis cor destacável

* [x] torne a cor da barra retrátivel de campos preenchível mais destacada, talvez até com alguma cor que destoe da paleta de cores geral do tema, mas ainda se mantenha bonita no layout. Adicione algum ícone ou emoji, não muito chamativo, mas suscinentemente adequado para dar maior destaque à ela.

## Alterações minimas mas suficiente

* [x] ajustes agents.local.md para normatizar codificação minimos suficientes para implementar, mas o suficiente para garantir a integração completa e funcional da solicitação, de tal forma a evitar potencial quebra de recursos e códigos

## Aplicação

- [x] Aplicado em 2026-07-22: migração operacional para .ia.rules, regras de faturamento, MPL2, centralização de configuração, destaque da barra e norma local mínima suficiente validadas por npm run check.

