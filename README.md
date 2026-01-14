# 🔐 Environment Configuration Manager

A centralized configuration management system with version control, environment promotion, and automatic encryption. Replace scattered `.env` files with a secure, versioned config store.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://env-config-manager.vercel.app)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Dashboard** | [https://env-config-manager-git-main-durveshs-projects.vercel.app](https://env-config-manager-git-main-durveshs-projects.vercel.app) |
| **API** | [https://env-config-manager.onrender.com](https://env-config-manager.onrender.com) |

---

## 📖 What It Does

| Problem (Traditional `.env`) | Solution (This App) |
|------------------------------|---------------------|
| Files scattered across projects | All configs in one dashboard |
| No history of changes | Full version history (v1 → v2 → v3) |
| Manual copy-paste between environments | One-click promote (dev → staging → prod) |
| Can't undo changes easily | Instant rollback to any version |
| Secrets in plain text | Auto-encryption of sensitive values |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, Tailwind CSS, TypeScript |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL + JSONB) |
| **Authentication** | Supabase Auth (Email/Password) |
| **Encryption** | AES-256-GCM |
| **Hosting** | Vercel (Frontend) + Render (Backend) |

---

## 🎯 How to Use

### For Admins (Dashboard)

> 🔐 **To get dashboard access:** Contact the admin. For security, there is no public signup - admin creates user accounts via Supabase.

1. **Login** at the dashboard URL
2. **Create Config**: Click "+ New Config" → Enter name + key-value pairs
3. **Edit**: Click on a config → Edit → Changes save as new version
4. **Compare**: Use Diff Viewer to see what changed between versions
5. **Promote**: Move tested config from dev → staging → prod
6. **Rollback**: Revert to any previous version if something breaks

### For Apps (API)

Your applications fetch configs at startup. **You need the `CONFIG_API_KEY` from the admin.**

> 📧 **To get API access:** Contact the admin for the `CONFIG_API_KEY`. This is required to make API calls.

```javascript
const response = await fetch('https://your-api/configs/prod/my-app', {
    headers: { 'X-API-Key': 'your-api-key' }  // Get this from admin
});
const config = (await response.json()).data[0].data;
// Use: config.DATABASE_URL, config.API_KEY, etc.
```

---

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| **User Auth** | Login required to access dashboard |
| **API Key** | All API requests require `X-API-Key` header |
| **Auto-Encryption** | Keys with SECRET, PASSWORD, TOKEN, KEY are encrypted |
| **Admin Control** | Only admins can invite users (no public signup) |

---

## 🛠️ Self-Hosting Setup

### Prerequisites
- Node.js 20+
- Supabase account

### 1. Clone & Install
```bash
git clone https://github.com/durveshgawde/env-config-manager.git
cd env-config-manager
cd backend && npm install
cd ../frontend && npm install
```

### 2. Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Create a `configs` table with columns: `id`, `name`, `environment`, `data` (JSONB), `version`, `created_at`
3. Enable Email Auth + Create a user

### 3. Environment Variables

Create `.env` files in `backend/` and `frontend/` directories. See `.env.example` files for required variables.

### 4. Run Locally
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:3001**

---

## 🚀 Deployment

| Service | Platform | Root Directory |
|---------|----------|----------------|
| Backend | Render | `backend` |
| Frontend | Vercel | `frontend` |

Add the same environment variables to each platform.

---

## 📄 License

MIT
