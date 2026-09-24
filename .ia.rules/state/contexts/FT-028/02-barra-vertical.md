# Subcontexto 02 - Barra vertical em sobreposicao

- Fase: contrato FT-030; codigo FT-031.
- Objetivo: eliminar transparencia interferente por estado opaco tematico e limiar discreto de scroll.
- Entradas: TODO raiz, `evidencia5.png`, RCF global, chrome compartilhado, temas e testes visuais.
- Dependencias: FTs 014/015; geometria e interacao atuais preservadas.
- Fora de escopo: mudanca progressiva proporcional ao scroll ou deslocamento compensatorio.
- Validacao: temas, scroll antes/depois do limiar, viewports, navegacao, contraste e Web/Bundle.
- Diagnostico: o trilho sticky possui fundo transparente e, depois de alcançar `top: 0`, deixa de coincidir com a superfície cromática presa ao shell, permitindo que toolbar e conteúdo apareçam através dele.
- Decisao: estado binário no limiar sticky por sentinela e `IntersectionObserver` ou CSS nativo equivalente, superfície temática opaca e transição de `140ms`, sem listener de scroll ou alteração geométrica.
- Estado: contrato concluído; FT-031 bloqueada até nova autorização humana posterior ao commit normativo.
