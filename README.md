# CodeBurger | DevClub

Sistema de gerenciamento de pedidos de uma hamburgueria, desenvolvido com Node.js + React durante o curso da DevClub.

## Tecnologias

**Backend**
- Node.js + Express 5
- Sequelize ORM + PostgreSQL
- UUID para identificadores de pedidos
- CORS + nodemon

**Frontend**
- React 19 + Vite
- React Router DOM
- Axios

## Estrutura do projeto

```
code-burger-jb/
├── src/                    # Backend
│   ├── config/database.js  # Configuração do Sequelize
│   ├── models/             # Model Order (UUID, clientName, order, status)
│   ├── routes.js           # Rotas REST da API
│   └── server.js           # Entrypoint Express (porta 3001)
└── frontend/               # Frontend React + Vite (porta 5173)
    ├── public/favicon.png
    └── src/
        └── pages/
            ├── Home/       # Formulário de novo pedido
            └── Orders/     # Listagem e acompanhamento de pedidos
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

## Configuração

### Banco de dados

Crie o banco antes de subir o servidor:

```sql
CREATE DATABASE codeburger_jb;
```

Por padrão o backend usa as variáveis abaixo. Crie um `.env` na raiz para sobrescrever:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=codeburger_jb
```

O Sequelize cria a tabela `orders` automaticamente na primeira inicialização (`sequelize.sync()`).

## Rodando o projeto

### Backend (porta 3001)

```bash
# Na raiz do projeto
npm install
npm run dev
```

### Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**

## API

Base URL: `http://localhost:3001`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/orders` | Lista todos os pedidos |
| `POST` | `/orders` | Cria um novo pedido |
| `PUT` | `/orders/:id` | Atualiza o status de um pedido |
| `DELETE` | `/orders/:id` | Remove um pedido |

### Fluxo de status

```
Em preparação → Pronto → Entregue
```

### Exemplos

**Criar pedido**
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"clientName": "João", "order": "X-Burguer + Fritas"}'
```

**Avançar status**
```bash
curl -X PUT http://localhost:3001/orders/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "Pronto"}'
```

## Telas

**Home** — cliente preenche nome e descrição do pedido e submete o formulário.

**Orders** — lista todos os pedidos vindos do banco em tempo real. Exibe "Nenhum pedido encontrado." quando a lista está vazia. Cada card permite avançar o status ou deletar o pedido.
