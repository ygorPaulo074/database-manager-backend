# Mini DaaS Privado — Gerenciador de Instâncias de Banco de Dados

## Visão Geral

Sistema para gerenciar localmente múltiplas instâncias de bancos de dados (PostgreSQL, MySQL, Redis, etc.) utilizando containers Docker.  
Projetado para **uso pessoal em ambiente de desenvolvimento**, com foco em simplicidade, modularidade e controle direto.

## Estado Atual (Design)

- **Backend**: TypeScript + Node.js + Express
- **Orquestração**: Dockerode (cliente da Docker API)
- **Persistência de metadados**: PostgreSQL com Prisma/TypeORM
- **Interface**: Webapp (React ou HTML simples + fetch)
- **Arquitetura**: Modular, com responsabilidades bem definidas

> O projeto está em fase de design/implementação inicial. Este documento reflete a arquitetura definida e as decisões tomadas.

## Tecnologias Escolhidas

| Componente       | Tecnologia           | Justificativa |
|------------------|----------------------|----------------|
| Linguagem        | TypeScript           | Tipagem forte, assíncrono nativo, ecossistema maduro |
| Runtime          | Node.js              | Leve, ideal para APIs e automação local |
| Comunicação c/ Docker | Dockerode       | Abstração completa da API Docker, suporte a streams |
| Banco de metadados | PostgreSQL           | Sem servidor, arquivo único, fácil backup |
| Interface        | Webapp (localhost)   | Acesso rápido pelo navegador, sem dependências de interface nativa |
| Restrição de execução | “Uma instância por vez” | Regra de negócio implementada no `InstanceService` |

## Estrutura Modular
src/
├── api/ # Camada de apresentação (HTTP)
│ ├── routes/ # Endpoints por recurso
│ │ ├── instances.ts
│ │ ├── backups.ts
│ │ └── logs.ts
│ └── server.ts # Configuração do servidor Express
│
├── core/ # Lógica de negócio principal
│ ├── docker-manager.ts # Wrapper técnico sobre Dockerode
│ ├── instance-service.ts # Regras: criação, start/stop, concorrência
│ └── backup-service.ts # Backup/restore de bancos
│
├── db/ # Persistência
│ ├── schema.prisma # Modelos (Instance, Backup, Settings)
│ └── client.ts # Conexão com PostgreSQL 
│
└── index.ts # Entrypoint: inicializa DB, API, serviços

text

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