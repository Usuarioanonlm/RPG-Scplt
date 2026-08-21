# Registro de validação — expansão de fichas, missão e mercado

**Data:** 21 de agosto de 2026.  
**Escopo:** múltiplas fichas por conta, missão ramificada, estoque rotativo e venda de materiais.

| Fluxo verificado | Evidência | Resultado |
|---|---|---|
| Arquivo de fichas | Prévia `?roster=1` em celular; contrato de `rpg.load` e `rpg.selectCharacter` em teste | O seletor identifica a ficha ativa, diferencia as crônicas e oferece criação de uma nova ficha. |
| Missão ramificada | Prévia `?mission=1` em desktop e celular; regras puras de desfecho em teste | As escolhas de escolta e saque expõem recompensas distintas, registram um final e persistem no estado da ficha. |
| Mercado rotativo | Prévia `?market=1` em desktop e celular; composição de catálogo em teste | Suprimentos essenciais permanecem visíveis e a seleção de itens viajantes muda com o marco da jornada. |
| Venda de materiais | Mercado em prévia e função de transação em teste | O valor de venda é calculado em cobre, reduz uma unidade do material e preserva os demais itens. |
| Persistência econômica | Teste do carregamento da ficha ativa com ouro, inventário e caminho de missão | O estado serializado mantém ouro, material e a escolha de missão para retomada posterior. |
| Persistência ponta a ponta | Script controlado `scripts/validate-rpg-persistence.mjs` contra o banco gerenciado | Duas fichas foram criadas/atualizadas, a segunda foi selecionada como ativa e o recarregamento confirmou o caminho `salvage`, 64 cobre e 2 Fragmentos de Obsidiana. |

## Execução técnica

O conjunto foi verificado com `pnpm check`, `pnpm test` e `pnpm build`. A suíte contém **12 testes**, incluindo os contratos de carregamento e seleção de ficha, progressão, missão, catálogo rotativo e venda de materiais. A persistência real também foi confirmada pelo script controlado de ponta a ponta, sem utilizar inserções diretas no banco.

> As URLs de prévia usam dados de demonstração apenas no navegador; elas não criam nem modificam contas no banco de dados.
