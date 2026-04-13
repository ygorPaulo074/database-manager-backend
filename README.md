# Database Manager Backend

## Descrição

Backend para gerenciamento de instâncias de bancos de dados usando containers Docker. Permite criar, iniciar, parar, listar e remover instâncias de PostgreSQL, MySQL e Redis em um ambiente local.

## Funcionalidades

- ✅ Criar instâncias de bancos de dados via Docker
- ✅ Iniciar/parar instâncias
- ✅ Listar instâncias
- ✅ Remover instâncias
- ✅ Verificação de disponibilidade de portas
- ✅ Documentação da API com Swagger UI
- 🚧 Backup e restore (em desenvolvimento)
- 🚧 Logs de instâncias (em desenvolvimento)

## Tecnologias

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework Web**: Express.js
- **ORM**: Prisma
- **Container Management**: Dockerode
- **Documentação**: Swagger/OpenAPI
- **Segurança**: Helmet, CORS
- **Logging**: Morgan

## Pré-requisitos

- Node.js 18+
- Docker
- PostgreSQL (para metadados do sistema)

## Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd database-manager-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie um banco PostgreSQL local ou use Docker.
   - Configure a variável de ambiente `DATABASE_URL` em um arquivo `.env`:
     ```bash
     DATABASE_URL="postgresql://user:password@localhost:5432/database_manager"
     ```

4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```

## Execução

### Desenvolvimento
```bash
npm run dev
```

O servidor inicia na porta `3000`, ou em `PORT` caso definido.

## API

A documentação da API está disponível em `http://localhost:3000/api-docs` quando o servidor estiver em execução.

### Endpoints Principais

- `POST /instances` - Criar nova instância
- `GET /instances` - Listar instâncias
- `POST /instances/:id/start` - Iniciar instância
- `POST /instances/:id/stop` - Parar instância
- `DELETE /instances/:id` - Remover instância
- `GET /instances/:id/logs` - Obter logs do container

## Estrutura do Projeto

```
src/
├── api/
│   └── routes/
│       └── instances.ts    # Rotas de instâncias
├── core/
│   ├── docker-manager.ts   # Gerencia containers Docker
│   ├── instance-service.ts # Lógica de instâncias
│   └── backup-service.ts   # Backups e restores (em desenvolvimento)
├── db/
│   ├── client.ts           # Cliente Prisma
│   └── generated/          # Cliente Prisma gerado
├── app.ts                  # Configuração do Express
└── index.ts                # Inicialização do servidor
```

### Responsabilidades de cada módulo

- **`api/`** – Expõe a API REST e recebe as requisições HTTP.
- **`core/docker-manager.ts`** – Cria, inicia, para e remove containers Docker.
- **`core/instance-service.ts`** – Gera credenciais, cria instâncias, valida portas e atualiza metadados no banco.
- **`core/backup-service.ts`** – Implementação inicial de comandos de dump/restore.
- **`db/`** – Configura o cliente Prisma e armazena metadados.

## Limitações Conhecidas

- A funcionalidade de backup/restore ainda está em desenvolvimento.
- A coleta de logs por instância é básica.
- Redis: atualmente a criação de instâncias define `REDIS_PASSWORD`, mas a imagem oficial `redis` pode não habilitar autenticação apenas com essa variável de ambiente.
  - Isso pode fazer com que instâncias Redis funcionem sem autenticação real.
  - Esse comportamento pode causar erros de conexão ou resultados inesperados em testes de autenticação.

## Observações

- Não existe um processo `npm run build` ou `npm start` definido no `package.json`; o modo principal disponível é `npm run dev`.
- A documentação Swagger é gerada a partir das anotações em `src/api/routes/instances.ts`.

## Próximos passos

- Ajustar a configuração de Redis para habilitar autenticação de forma confiável.
- Completar backup/restore para PostgreSQL, MySQL e Redis.
- Melhorar a coleta de logs e o tratamento de estados de erro.
- Adicionar testes automatizados e validação de entrada.
