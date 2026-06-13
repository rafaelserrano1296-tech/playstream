# StreamFlix — Guia de Instalação

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

---

## 1. Banco de Dados

```sql
-- Crie o banco:
CREATE DATABASE streamflix;

-- Execute o schema:
psql -U postgres -d streamflix -f backend/src/config/database.sql
```

---

## 2. Backend

```bash
cd backend
npm install

# Copie e configure o .env:
cp .env.example .env
```

Edite o `.env`:
```
PORT=5000
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/streamflix
JWT_SECRET=coloque_uma_string_aleatoria_longa_aqui
PIX_KEY=sua_chave_pix@email.com
PIX_MERCHANT_NAME=StreamFlix
PIX_MERCHANT_CITY=Sao Paulo
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@gmail.com
SMTP_PASS=senha_app_google
```

```bash
# Iniciar o backend:
npm run dev
# Rodará em http://localhost:5000
```

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Rodará em http://localhost:5173
```

---

## 4. Login Admin

```
E-mail: admin@streamflix.com
Senha:  Admin@123
```
⚠️ **Troque a senha imediatamente após o primeiro login!**

---

## 5. Painel Administrativo

Após login com conta admin, acesse:  
`http://localhost:5173/admin`

Ou pelo menu do usuário → **Painel Admin**

---

## 6. PIX em Produção

Para pagamentos reais, você precisará de um provedor PIX (ex: Mercado Pago, PagSeguro, EfiBank).  
Configure o webhook deles apontando para:  
`POST https://seu-backend.com/api/pagamentos/webhook`

O payload deve conter `{ txid, status: "CONCLUIDA" }`.

---

## 7. Deploy

**Backend:** Railway, Render, Heroku, VPS  
**Frontend:** Vercel, Netlify (buildar com `npm run build`)  
**Banco:** Supabase, ElephantSQL, Neon

---

## Estrutura de Pastas

```
streamflix/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.sql    ← Schema do banco
│   │   │   └── db.js           ← Conexão PostgreSQL
│   │   ├── controllers/        ← Lógica de negócio
│   │   ├── middlewares/        ← Auth JWT
│   │   ├── routes/             ← Rotas da API
│   │   ├── services/           ← PIX, e-mail
│   │   └── server.js           ← Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/         ← Navbar
    │   │   └── ui/             ← Cards, Slider, Loading
    │   ├── contexts/           ← AuthContext
    │   ├── pages/
    │   │   ├── admin/          ← Dashboard, Filmes, Usuários, Pagamentos
    │   │   ├── Home.tsx
    │   │   ├── Login.tsx
    │   │   ├── Cadastro.tsx
    │   │   ├── DetalheFilme.tsx
    │   │   └── ...
    │   ├── services/           ← API axios
    │   ├── types/              ← TypeScript types
    │   └── App.tsx
    ├── vite.config.ts          ← PWA configurado
    └── package.json
```
