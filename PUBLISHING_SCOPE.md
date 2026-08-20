# Escopo de publicação — RPG Scplt

O repositório público contém o conjunto de arquivos necessário para instalar, compilar, testar e executar a versão persistente do RPG: código React e TypeScript, servidor Express/tRPC, esquema Drizzle, migração SQL, testes, configurações e documentação de runtime.

## Incluído no repositório

| Grupo | Conteúdo |
| --- | --- |
| Cliente | Entrada HTML, inicialização React, páginas de conta e campanha, estilos e conector tRPC. |
| Backend | Procedimentos de conta e persistência, acesso ao banco, núcleo de servidor e contratos compartilhados necessários. |
| Banco | `drizzle/schema.ts`, migração SQL e configuração do Drizzle. |
| Qualidade | Testes Vitest, manifestos, patch de dependência e documentação de runtime. |

## Omitido intencionalmente

Os itens abaixo pertencem ao ambiente de desenvolvimento, não são necessários para a reconstrução comprovada do projeto e não devem ser publicados como código de produção: diretórios `.manus` e `.manus-logs`, dependências `node_modules`, saída `dist`, arquivos de ambiente, notas internas de teste, listas de tarefas, rascunhos de design, configurações locais e ativos brutos que são servidos pelo armazenamento gerenciado.

Alguns componentes auxiliares de template que não são importados pela campanha também podem permanecer somente no workspace. A versão publicada foi verificada em clone limpo com `pnpm build` e `pnpm test`.

## Regra de manutenção

Antes de publicar uma nova funcionalidade, inclua qualquer arquivo novo que seja transitivamente importado pelo cliente ou servidor, atualize a migração quando o esquema mudar e repita os comandos de validação documentados no `README.md`.
