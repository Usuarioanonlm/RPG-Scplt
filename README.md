# RPG Scplt — Crônicas de Obsidiana

Um RPG tático de fantasia sombria para navegador, criado com **React**, **TypeScript**, **Tailwind CSS**, **tRPC**, **Express** e **MySQL/TiDB**. A experiência reúne criação de personagem, atributos dinâmicos, inventário, combate por turnos, mercado, campanha progressiva e progresso persistente.

## Recursos

| Sistema | Descrição |
| --- | --- |
| Criação de personagem | Nome, origem, classe e aspecto visual moldam a ficha inicial. |
| Combate tático | Turnos alternados, vida, mana, inventário, defesa e recompensa. |
| Classes distintas | Guardião Rúnico, Duelista de Bruma e Tecelão Astral têm atributos e vantagens próprias. |
| Duelo visual | Poses de arma, conjuração, ataque inimigo, dano crítico, impacto e indicadores de intenção. |
| Conta de cronista | Cadastro e entrada por nick e senha; a senha é derivada com `scrypt` antes de ser armazenada. |
| Crônica persistente | Personagem, ouro, inventário, equipamentos, combate e progresso são salvos automaticamente. |
| Responsividade | Interface otimizada para desktop e telas móveis. |

## Desenvolvimento local

```bash
pnpm install
pnpm dev
```

Para validar a produção:

```bash
pnpm check
pnpm build
pnpm test
```

## Banco de dados e GitHub

O esquema persistente está versionado no repositório em [`drizzle/schema.ts`](drizzle/schema.ts), com a primeira migração em [`drizzle/0000_green_lionheart.sql`](drizzle/0000_green_lionheart.sql). As tabelas `rpgAccounts` e `rpgCharacters` armazenam, respectivamente, a conta por nick e a ficha ativa da campanha.

Para alterar o esquema, gere a migração, revise o SQL e aplique-o no banco configurado pelo ambiente:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

O GitHub recebe todo o código-fonte, o esquema e as migrações como arquivos normais. **Não** versione arquivos `.env`, senhas, tokens ou a URL real do banco. O GitHub Pages pode exibir uma versão estática, mas contas, login e banco de dados exigem uma hospedagem com backend Node.js e banco persistente.

## Publicação

O fluxo em [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) é adequado apenas para a versão estática. Para usar nick, senha e progresso persistente em produção, publique a aplicação full-stack em uma hospedagem compatível com Node.js e banco de dados, mantendo o repositório GitHub como fonte versionada do código e das migrações.

## Licença

MIT
