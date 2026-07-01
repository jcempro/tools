# RCF - Requirements & Control Framework

# Projeto

Relação de Faturamento

---

# 1. Objetivo

Desenvolver uma aplicação Web destinada à geração da "Relação de Faturamento", substituindo integralmente a planilha Excel existente, preservando seu resultado funcional, porém eliminando suas limitações estruturais, centralizando todas as regras de negócio em código, desacoplando completamente interface, lógica e impressão.

A planilha existente deve ser tratada apenas como referência visual e funcional, nunca como referência arquitetural.

---

# 2. Objetivo Funcional

Permitir que o usuário informe os dados necessários para geração de um documento oficial de relação de faturamento anual, contendo:

- Dados da empresa;
- Período de referência;
- Relação mensal do faturamento;
- Totais;
- Situação de cada mês (Previsto ou Realizado);
- Dados de assinatura;
- Percentuais de recebimento;
- Regime tributário;
- Layout oficial para impressão A4.

---

# 3. Arquitetura

A aplicação deverá possuir separação absoluta entre:

- Modelo de Dados;
- Regras de Negócio;
- Interface Web;
- Documento para Impressão.

Nenhuma regra poderá depender do layout.

Nenhuma regra poderá depender de posição de componentes visuais.

O PDF/A4 deverá ser apenas uma renderização dos dados.

---

# 4. Modelo de Dados

A entidade principal deverá possuir, no mínimo:

Empresa
    Razão Social
    CNPJ

Documento
    Cidade
    UF
    Data de Assinatura
    Mês/Ano de Referência

Mercado Interno
    Lista contendo exatamente 12 meses

Cada mês
    Mês/Ano
    Venda à Vista
    Venda a Prazo
    Prazo Médio de Recebimento
    Situação

Assinantes
    Nome
    CPF

Percentuais
    Cartões
    Cheques
    Títulos

Regime Tributário

---

# 5. Regras Gerais

A aplicação deverá trabalhar sempre com exatamente doze meses consecutivos.

Não poderá existir menos.

Não poderá existir mais.

Toda alteração deverá manter esta propriedade.

---

# 6. Dados da Empresa

Razão Social será aceita exatamente como informada.

CNPJ poderá ser informado:

- apenas números;
- parcialmente formatado;
- completamente formatado.

Internamente deverá permanecer armazenado apenas com seus dígitos.

Na apresentação deverá sempre utilizar máscara oficial:

00.000.000/0000-00

Caracteres inválidos deverão ser removidos automaticamente.

---

# 7. Assinantes

O sistema deverá aceitar um ou mais assinantes.

Cada assinante possuirá:

- Nome;
- CPF.

CPF obedecerá exatamente às mesmas regras do CNPJ.

Quando houver mais de um assinante, os nomes deverão ser concatenados utilizando:

" ou "

Exemplo

João ou Maria ou José

Os respectivos CPFs deverão seguir exatamente a mesma lógica.

---

# 8. Cidade

O usuário poderá alterar livremente a localidade.

O formato obrigatório será:

Cidade/UF

Exemplos válidos

Pirassununga/SP

Campinas/SP

São Paulo/SP

O sistema deverá validar automaticamente:

- existência da barra;
- UF com duas letras;
- remoção de espaços excedentes;
- normalização automática quando possível.

---

# 9. Data de Assinatura

Por padrão deverá assumir a data atual.

O usuário poderá alterá-la livremente.

Toda regra temporal utilizará exclusivamente esta data.

Jamais a data atual do sistema.

---

# 10. Formatação da Data

A data apresentada no documento deverá utilizar obrigatoriamente o padrão brasileiro extenso.

Exemplo

03 de junho de 2026

Jamais:

03/06/2026

ou

2026-06-03

---

# 11. Período da Relação

O documento sempre conterá doze meses consecutivos.

O mês final corresponderá ao último mês classificado como Realizado.

O primeiro mês corresponderá exatamente onze meses antes.

---

# 12. Campo Mês/Ano de Referência

Este campo representa sempre:

Último mês classificado como Realizado.

Seu valor deverá refletir automaticamente esta condição.

---

# 13. Classificação Previsto / Realizado

A classificação será calculada utilizando exclusivamente a Data de Assinatura.

Meses anteriores ou iguais ao mês da assinatura serão classificados como:

Realizado

Meses posteriores serão classificados como:

Previsto

A data atual do computador jamais deverá influenciar este cálculo.

---

# 14. Faturamento Bruto Anual

O faturamento bruto anual será definido por:

Soma(Vendas à Vista)

+

Soma(Vendas a Prazo)

O valor anual deverá permanecer invariável durante toda a edição.

---

# 15. Distribuição Inicial

Quando informado apenas o faturamento anual, o sistema deverá distribuir automaticamente os valores pelos doze meses.

A distribuição deverá obedecer simultaneamente:

- tendência crescente;
- comportamento não linear;
- pequenas oscilações mensais;
- aparência natural;
- soma exatamente igual ao valor anual.

Não será permitido crescimento perfeitamente linear.

---

# 16. Algoritmo de Distribuição

O algoritmo deverá ser determinístico.

A mesma entrada deverá produzir exatamente o mesmo resultado.

Jamais utilizar aleatoriedade verdadeira.

A sequência deverá apenas simular comportamento natural.

---

# 17. Edição Manual

O usuário poderá alterar qualquer mês.

Sempre que isto ocorrer:

o valor anual permanecerá inalterado.

Os meses restantes deverão ser redistribuídos automaticamente.

---

# 18. Redistribuição

Os meses alterados manualmente deverão permanecer bloqueados.

Somente os meses não editados poderão sofrer compensação.

A redistribuição deverá preservar:

- tendência crescente;
- zigue-zague;
- soma anual.

---

# 19. Meses Previstos

Quando existirem meses classificados como Previsto:

seus valores deverão ser calculados automaticamente.

Cada coluna utilizará sua própria média.

Venda à Vista utilizará somente valores realizados de Venda à Vista.

Venda a Prazo utilizará somente valores realizados de Venda a Prazo.

Jamais misturar ambas.

---

# 20. Prazo Médio de Recebimento

Cada mês possuirá seu próprio prazo.

O usuário poderá alterá-lo.

Não haverá dependência entre meses.

---

# 21. Percentuais de Recebimento

Os campos:

- Cartões;
- Cheques;
- Títulos;

serão editáveis.

Aceitarão apenas percentuais válidos.

---

# 22. Regime Tributário

Campo livre.

Sem cálculo associado.

---

# 23. Interface Web

A interface Web não deverá reproduzir o layout A4.

Ela deverá priorizar:

- produtividade;
- clareza;
- rapidez de edição;
- validações em tempo real.

O documento A4 será apenas uma visualização.

---

# 24. Impressão

A impressão deverá reproduzir fielmente o layout oficial.

Todo o documento deverá ocupar exatamente uma folha A4.

Nenhum elemento poderá extrapolar a página.

---

# 25. PDF

O PDF deverá possuir aparência equivalente ao documento oficial.

Diferenças máximas aceitáveis:

- pequenas diferenças tipográficas entre navegadores.

Jamais diferenças estruturais.

---

# 26. Validações

O sistema deverá impedir:

CPF inválido.

CNPJ inválido.

Valores negativos.

Datas inválidas.

UF inválida.

Percentuais inválidos.

Meses duplicados.

Mais ou menos de doze meses.

---

# 27. Invariantes

As propriedades abaixo jamais poderão ser violadas:

- exatamente doze meses;
- faturamento anual igual à soma mensal;
- referência igual ao último mês realizado;
- meses consecutivos;
- nenhum valor negativo;
- PDF sempre em uma única página;
- CNPJ armazenado apenas em formato numérico;
- CPF armazenado apenas em formato numérico;
- apresentação sempre formatada;
- lógica completamente desacoplada do layout.

---

# 28. Critérios de Aceitação

Será considerado correto quando:

- produzir exatamente doze meses;
- manter o faturamento anual invariável;
- redistribuir automaticamente alterações;
- classificar corretamente Previsto/Realizado;
- gerar documento visualmente equivalente ao modelo oficial;
- validar automaticamente entradas;
- produzir PDF A4 fiel ao layout.

---

# 29. Restrições Arquiteturais

É proibido:

utilizar planilhas internas;

utilizar fórmulas espalhadas pela interface;

duplicar regras de negócio;

misturar lógica com componentes visuais;

utilizar qualquer cálculo dependente da renderização da página.

Toda regra deverá existir em apenas um único ponto do código.

---

# 30. Evolução

Novos campos, novas tabelas ou novas regras deverão ser adicionados preservando:

- desacoplamento;
- determinismo;
- rastreabilidade;
- reutilização;
- compatibilidade com o layout oficial;
- compatibilidade com futuras versões do documento.