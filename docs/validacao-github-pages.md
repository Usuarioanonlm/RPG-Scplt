# Validação do GitHub Pages

Em 21 de agosto de 2026, a origem do GitHub Pages foi alterada de **Deploy from a branch** para **GitHub Actions**. A execução manual `32506384834` concluiu com sucesso, gerando o cliente Vite em `dist/public` e publicando o artefato no ambiente `github-pages`.

| Item | Resultado |
|---|---|
| Origem da publicação | GitHub Actions |
| Compilação do cliente | Concluída com sucesso |
| Implantação do Pages | Concluída com sucesso |
| Próxima verificação | Confirmar tela de demonstração e retrato de Oren Vale na URL pública |

## Verificação pública

O domínio `https://usuarioanonlm.github.io/RPG-Scplt/` passou a servir o bundle atualizado `assets/index-BXOaD-y-.js`, que contém a entrada **Demonstração Estática**. A página inicial agora apresenta a tela de acesso de demonstração e não o criador de personagem legado.

O artefato do workflow `32506384834` foi inspecionado e continha a entrada estática esperada. A origem do Pages foi confirmada como `workflow`; a raiz de compatibilidade também foi atualizada para atender o conteúdo que permaneceu em cache na origem legada.

Após a implantação `32508236974`, o botão **Abrir demonstração** foi validado na URL pública: ele abre a mesa tática com Mira Voss, inventário, combate e os comandos de mercado, missão e jornal disponíveis.

O mercado público também foi aberto na demonstração e exibiu corretamente o retrato de **Oren Vale**, o saldo em cobre, a venda de materiais e o catálogo rotativo de seis ofertas.
