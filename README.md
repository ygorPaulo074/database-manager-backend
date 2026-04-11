# Database Manager Backend

## Descrição

Sistema backend para gerenciamento de instâncias de bancos de dados utilizando containers Docker. Permite criar, iniciar, parar e remover instâncias de PostgreSQL, MySQL, Redis e outros bancos suportados pelo Docker. Projetado para uso em ambiente de desenvolvimento local.

## Funcionalidades

- ✅ Criar instâncias de bancos de dados via Docker
- ✅ Iniciar/parar instâncias
- ✅ Listar instâncias ativas
- ✅ Remover instâncias
- ✅ Verificação automática de disponibilidade de portas
- ✅ Documentação da API com Swagger UI
- 🚧 Backup e restore (em desenvolvimento)
- 🚧 Logs de instâncias (em desenvolvimento)

## Tecnologias

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework Web**: Express.js
- **ORM**: Prisma (com PostgreSQL)
- **Container Management**: Dockerode
- **Documentação**: Swagger/OpenAPI
- **Segurança**: Helmet, CORS
- **Logging**: Morgan

## Pré-requisitos

- Node.js (versão 18+)
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
   - Crie um banco PostgreSQL local ou use Docker
   - Configure a variável de ambiente `DATABASE_URL` no arquivo `.env`:
     ```
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

O servidor iniciará na porta 3000 (ou definida em `PORT`).

### Produção
```bash
npm run build
npm start
```

## API

A documentação completa da API está disponível via Swagger UI em `http://localhost:3000/api-docs` quando o servidor estiver rodando.

### Endpoints Principais

- `POST /instances` - Criar nova instância
- `GET /instances` - Listar instâncias
- `POST /instances/:id/start` - Iniciar instância
- `POST /instances/:id/stop` - Parar instância
- `DELETE /instances/:id` - Remover instância

## Estrutura do Projeto

```
src/
├── api/
│   ├── routes/
│   │   ├── instances.ts    # Rotas de instâncias
│   │   ├── backups.ts      # Rotas de backups (vazio)
│   │   └── logs.ts         # Rotas de logs (vazio)
│   └── server.ts           # Configuração do servidor (vazio)
├── core/
│   ├── docker-manager.ts   # Gerenciamento de containers Docker
│   ├── instance-service.ts # Lógica de negócio das instâncias
│   └── backup-service.ts   # Serviço de backups (vazio)
├── db/
│   ├── client.ts           # Cliente Prisma
│   └── generated/          # Cliente Prisma gerado
└── app.ts                  # Configuração principal do Express
```

### Responsabilidades de cada módulo

- **`api/`** – Expõe endpoints HTTP. Não contém regras de negócio nem acesso direto ao Docker.
- **`core/docker-manager.ts`** – Comunicação de baixo nível com o Docker (criação, início, parada, logs).
- **`core/instance-service.ts`** – Aplica regras de negócio:
  - Nomes e portas únicas.
  - **Restrição “uma instância ligada por vez”** (implementada internamente ou com auxílio de `instance-lock.ts`).
  - Coordenação entre Docker e banco de metadados.
- **`core/backup-service.ts`** – Executa comandos de dump/restore dentro de containers.
- **`db/`** – Gerencia o armazenamento de metadados (instâncias, backups, configurações).
- **`ui/`** – Interface visual para o usuário; consome a API.

## Funcionalidades Planejadas

- [x] Definição da arquitetura modular
- [ ] Criar/remover instâncias (PostgreSQL, MySQL, Redis)
- [ ] Iniciar/parar/relistar instâncias
- [ ] **Restrição**: apenas uma instância em execução por vez (evita conflitos de recursos locais)
- [ ] Visualização de logs em tempo real (SSE ou WebSocket)
- [ ] Backup manual (pg_dump, mysqldump)
- [ ] Métricas básicas (CPU, memória via `docker stats`)
- [ ] Persistência dos metadados em PostgreSQL 
- [ ] Interface web simples (listagem, botões de ação)
- [ ] (Opcional) CLI com `commander` para comandos rápidos

## Regra de Negócio – Uma Instância por Vez

Para economizar recursos locais e evitar conflitos de porta, o sistema permite **apenas uma instância de banco ativa (running)** por vez.

- Se uma instância já estiver rodando e o usuário tentar iniciar outra:
  - A instância ativa é **automaticamente parada** antes de iniciar a nova.
- A lógica fica centralizada em `InstanceService.startInstance(id)`.
- Se a restrição precisar persistir entre reinicializações do DaaS, o `activeInstanceId` será armazenado na tabela `Settings` do PostgreSQL.


## Pré‑requisitos:

Docker Engine instalado e rodando

Node.js 18+ ou 20+

Acesso ao socket do Docker (/var/run/docker.sock no Linux, equivalente no Windows/Mac)

Próximos Passos
Implementar docker-manager.ts com os métodos básicos (criar, iniciar, parar, remover).

Criar o instance-service.ts e a regra “uma instância por vez”.

Configurar PostgreSQL e os modelos com Prisma.

Desenvolver uma API REST mínima (listar, criar, iniciar/parar).

Construir uma interface web simples (pode ser apenas HTML + fetch).