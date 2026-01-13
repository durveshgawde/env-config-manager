# 🔐 Environment Configuration Manager

A production-grade system to safely manage, version, diff, promote, and roll back application configuration across environments. Features secure authentication, automatic encryption of sensitive values, and complete version history.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🔒 User Authentication** | Supabase Auth with admin-only access control |
| **🔐 Automatic Encryption** | AES-256 encryption for sensitive keys (SECRET, KEY, PASSWORD, TOKEN) |
| **🔑 API Key Protection** | All API routes protected with X-API-Key header |
| **📝 Immutable Versioning** | Every config change creates a new version (full history) |
| **🔍 Visual Diff Viewer** | Side-by-side comparison of versions |
| **⏪ Safe Rollback** | Instantly rollback to any previous version |
| **🚀 Environment Promotion** | Promote configs: dev → staging → prod |
| **✏️ Edit Configs** | Edit existing configs (saves as new version) |

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, Tailwind CSS, TypeScript |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL + JSONB) |
| **Auth** | Supabase Authentication |
| **Encryption** | AES-256-GCM |

## 🛠️ Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/durveshgawde/env-config-manager.git
cd env-config-manager

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Enable **Email Auth**: Authentication → Providers → Email
4. Create a user: Authentication → Users → Add User

### 3. Configure Environment

**backend/.env:**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development

# Security (Required for production)
CONFIG_API_KEY=your-secret-api-key
ENCRYPTION_KEY=your32characterencryptionkey!!
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CONFIG_API_KEY=your-secret-api-key
```

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:3001 → Login with your Supabase user

## 🔐 Security Features

### API Key Authentication

All `/configs` routes require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-secret-api-key" http://localhost:3000/configs
```

### Automatic Encryption

Keys containing these patterns are auto-encrypted in the database:
- `SECRET`, `KEY`, `PASSWORD`, `TOKEN`, `CREDENTIAL`

```
Stored in DB:  { "STRIPE_KEY": "ENC:xK9$#mZ..." }  ← Encrypted
API Response:  { "STRIPE_KEY": "sk_live_abc123" }  ← Decrypted
```

### User Authentication

- Dashboard protected by Supabase Auth
- Admin creates users via Supabase Dashboard
- No public signup (secure by default)

## 📡 API Reference

### Base URL
```
http://localhost:3000
```

### Headers Required
```
X-API-Key: your-secret-api-key
Content-Type: application/json
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (no auth) |
| `GET` | `/configs` | List all configs |
| `POST` | `/configs/:env/:name` | Create new version |
| `GET` | `/configs/:env/:name` | List versions |
| `GET` | `/configs/:env/:name/:version` | Get specific version |
| `GET` | `/configs/:env/:name/diff?from=X&to=Y` | Diff versions |
| `POST` | `/configs/:env/:name/rollback` | Rollback |
| `POST` | `/configs/promote` | Promote between envs |

### Examples

**Create Config:**
```bash
curl -X POST http://localhost:3000/configs/dev/my-app \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"data": {"API_KEY": "secret123"}, "message": "Initial config"}'
```

**Promote to Production:**
```bash
curl -X POST http://localhost:3000/configs/promote \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"configName": "my-app", "fromEnv": "staging", "toEnv": "prod", "version": 5}'
```

## 🏗️ How Your App Uses This

Your applications fetch configs at startup:

```javascript
// In your app
async function loadConfig() {
    const response = await fetch('https://config-manager.example.com/configs/prod/my-app', {
        headers: { 'X-API-Key': process.env.CONFIG_API_KEY }
    });
    const result = await response.json();
    return result.data[0].data; // Latest version
}

const config = await loadConfig();
console.log(config.API_KEY); // "secret123" (decrypted!)
```

## 📁 Project Structure

```
env-config-manager/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── routes/configs.ts  # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/auth.ts # API key auth
│   │   └── lib/encryption.ts  # AES-256 encryption
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/         # Login page
│   │   │   ├── create/        # Create config
│   │   │   ├── diff/          # Diff viewer
│   │   │   └── promote/       # Promotion page
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx  # Route protection
│   │   │   └── Sidebar.tsx    # Navigation + Logout
│   │   └── context/AuthContext.tsx
│   └── package.json
└── supabase/migrations/       # Database schema
```

## 🚀 Deployment

### Environment Variables for Production

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CONFIG_API_KEY`
- `ENCRYPTION_KEY` (exactly 32 characters)

**Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CONFIG_API_KEY`
- `NEXT_PUBLIC_API_URL` (your deployed backend URL)

## 📄 License

MIT License
