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

### Pré-requisitos de runtime persistente

A aplicação com conta e salvamento exige **Node.js 22+**, **pnpm 10+** e uma instância **MySQL 8+ ou TiDB** acessível pelo servidor. Antes da primeira execução, instale as dependências, aplique as migrações e configure as variáveis no provedor de hospedagem — nunca em arquivos versionados:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | String de conexão do MySQL/TiDB usada pelo Drizzle. |
| `JWT_SECRET` | Segredo de assinatura das sessões de servidor. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Configurações do provedor de sessão disponibilizado pelo ambiente Manus. |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | Serviços internos usados pela infraestrutura do projeto, quando fornecidos pelo ambiente. |

```bash
pnpm install
pnpm drizzle-kit migrate
pnpm build
NODE_ENV=production pnpm start
```

O GitHub Pages permanece útil apenas para demonstrações estáticas. Para contas por nick e senha, o destino de produção precisa executar o processo Node.js continuamente e permitir conexão segura ao banco.

## Expansão da campanha

A versão persistente adiciona uma camada de progressão e mundo reativo vinculada à ficha do jogador.

| Módulo | Recursos principais |
| --- | --- |
| Progressão | Nível, experiência, pontos de atributo, talentos por classe e bônus aplicados em combate. |
| Combate tático | Veneno, queimadura, barreira, atordoamento, críticos, fraquezas, resistências e fases inimigas. |
| Mundo | Mapa de expedição, eventos, missões, reputação, NPC mercador, codex e conquistas. |
| Base | Base de expedição, forja de equipamentos e uso de Fragmentos de Obsidiana. |
| Continuidade | Checkpoints automáticos em rotas, eventos e vitórias, além de um comando manual de salvamento. |

O estado desses módulos é incluído no JSON de campanha vinculado à conta. A suíte de testes cobre progressão, afinidades, persistência e a restauração dos campos de checkpoint ao carregar uma ficha.

## Licença

MIT
