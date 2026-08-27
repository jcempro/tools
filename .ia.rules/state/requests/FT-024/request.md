# Fonte canonica da solicitacao FT-024/FT-025

- Origem: prompt humano recebido no Codex.
- Recebido em: 2026-08-27T13:20:14-03:00.
- Corpo canônico SHA-256: `0314903BC654F1836C565780FD3348CF615421AE4CE6CCAE742DC9BFE2513C1D`.
- FTs vinculadas: FT-024; FT-025.
- RCF de destino: `src/csv-bd/RCF.md`.
- Estado de incorporacao: integralmente normatizada pela FT-024; implementação e auditoria final permanecem na FT-025.

## Corpo integral

No módulo **Conversor de CSV**, corrija o erro/aviso `... identifica linhas materialmente distintas em resultado prévio`: ele NÃO DEVE ser emitido nem impedir a conversão apenas porque múltiplos registros compartilham o mesmo indexador.

A implementação atual presume incorretamente relação `1:1`. Passe a admitir como legítimas relações **1:N** e **N:N** entre as tabelas, preservando todas as correspondências válidas.

O requisito de evitar duplicação aplica-se somente a:

* linhas **exatamente iguais**; ou
* futuramente, linhas com equivalência suficientemente alta para indicar provável duplicidade.

A inferência por similaridade NÃO faz parte desta implementação: registre-a como **feature futura**. PODE ser prevista configuração centralizada `float`/percentual para limiar de similaridade, mas NÃO implemente heurística incompleta agora.

Nesta correção:

* múltiplos registros com o mesmo indexador NÃO PODEM bloquear conversão nem ser tratados automaticamente como duplicação;
* todo indexador DEVE ser **normalizado antes da comparação/vinculação**, eliminando diferenças meramente formais pertinentes ao tipo de chave, como pontuação, espaços, parênteses e equivalentes, sem alterar seu valor semântico;
* a normalização DEVE ser aplicada de forma consistente aos dois lados da relação;
* correspondências 1:N/N:N DEVEM preservar todos os registros legítimos, sem perda, colapso indevido, transbordamento ou associação entre chaves distintas;
* NÃO alterar outros comportamentos, validações ou contratos do módulo além do necessário para corrigir essa premissa de cardinalidade.
