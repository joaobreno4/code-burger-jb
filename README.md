# CodeBurger | DevClub

Sistema de gerenciamento de pedidos de uma hamburgueria, desenvolvido com Node.js + React durante o curso da DevClub.

**Deploy:** https://code-burger-jb.vercel.app

## Tecnologias

**Backend (local)**
- Node.js + Express 5
- Sequelize ORM + PostgreSQL
- UUID para identificadores de pedidos
- CORS + nodemon

**Backend (produção — Vercel)**
- Vercel Serverless Functions (`api/`)
- Neon Serverless PostgreSQL (via Vercel Marketplace)

**Frontend**
- React 19 + Vite
- React Router DOM
- Axios
- Design responsivo (mobile-first, breakpoint 480px)

## Estrutura do projeto

```
code-burger-jb/
├── api/                        # Vercel Serverless Functions (produção)
│   ├── orders.js               # GET /api/orders, POST /api/orders
│   └── orders/[id].js          # PUT /api/orders/:id, DELETE /api/orders/:id
├── src/                        # Backend Express (desenvolvimento local)
│   ├── config/database.js
│   ├── models/
│   ├── routes.js
│   └── server.js               # Porta 3001
├── frontend/                   # React + Vite (porta 5173)
│   ├── public/favicon.png
│   └── src/pages/
│       ├── Home/               # Formulário de novo pedido
│       └── Orders/             # Listagem e acompanhamento de pedidos
└── vercel.json                 # Configuração de build e roteamento
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

## Configuração local

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

O Vite já tem proxy configurado: chamadas para `/api/*` são redirecionadas automaticamente para `localhost:3001`.

Acesse **http://localhost:5173**

## Deploy (Vercel)

O projeto está publicado em produção na Vercel com Neon como banco de dados serverless.

**URL:** https://code-burger-jb.vercel.app

A Vercel utiliza os arquivos em `api/` como Serverless Functions e o conteúdo de `frontend/dist` como site estático. O banco é provisionado automaticamente via integração Neon no Vercel Marketplace.

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/orders` | Lista todos os pedidos |
| `POST` | `/api/orders` | Cria um novo pedido |
| `PUT` | `/api/orders/:id` | Atualiza o status de um pedido |
| `DELETE` | `/api/orders/:id` | Remove um pedido |

### Fluxo de status

```
Em preparação → Pronto → Entregue
```

### Exemplos

**Criar pedido**
```bash
curl -X POST https://code-burger-jb.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{"clientName": "João", "order": "X-Burguer + Fritas"}'
```

**Avançar status**
```bash
curl -X PUT https://code-burger-jb.vercel.app/api/orders/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "Pronto"}'
```

## Telas

| Home | Orders |
|------|--------|
| ![Home](.github/screenshots/home.png) | ![Orders](.github/screenshots/orders.png) |

**Home** — cliente preenche nome e descrição do pedido e submete o formulário.

**Orders** — lista todos os pedidos vindos do banco em tempo real. Exibe "Nenhum pedido encontrado." quando a lista está vazia. Cada card permite avançar o status ou deletar o pedido. Layout responsivo: em mobile os cards empilham verticalmente.
