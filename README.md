# 🔐 Environment Configuration Manager

A centralized configuration management system with version control, environment promotion, and automatic encryption. Replace scattered `.env` files with a secure, versioned config store.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)

---

## 📖 What It Does

Instead of managing `.env` files in each project:

| Traditional `.env` | This Config Manager |
|-------------------|---------------------|
| Files scattered across projects | All configs in one place |
| No history of changes | Full version history |
| Manual copy-paste between environments | One-click promote (dev → staging → prod) |
| Can't undo changes | Instant rollback to any version |
| Secrets in plain text files | Automatic encryption of sensitive values |

---

## 🎯 How to Use

### Step 1: Create a Configuration
1. Login to the dashboard
2. Click **+ New Config**
3. Enter a name (e.g., `my-app`)
4. Add your key-value pairs
5. Save

### Step 2: Your App Reads the Config
Your app calls the API at startup to get its configuration:
```javascript
const config = await fetch('http://your-config-manager/configs/prod/my-app', {
    headers: { 'X-API-Key': 'your-api-key' }
}).then(r => r.json());

// Use values from config.data[0].data
```

### Step 3: Update & Promote
- **Edit**: Make changes → saves as new version (v1 → v2)
- **Diff**: Compare any two versions
- **Rollback**: Undo a bad change instantly
- **Promote**: Push tested config from dev → staging → prod

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **Login Required** | Admin authentication via Supabase |
| 🔐 **Auto-Encryption** | Keys with SECRET, PASSWORD, TOKEN, KEY are encrypted |
| 🔑 **API Protection** | All API calls require X-API-Key header |
| 📝 **Version History** | Every change creates a new version |
| 🔍 **Visual Diff** | See what changed between versions |
| ⏪ **Rollback** | Restore any previous version |
| 🚀 **Environment Promotion** | dev → staging → prod workflow |

---

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql`
3. Enable Email auth & create a user

### 3. Set Environment Variables

**backend/.env:**
```env
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
CONFIG_API_KEY=any-secret-string
ENCRYPTION_KEY=exactly32characters!!!!!!!!!!!
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_CONFIG_API_KEY=same-as-backend-api-key
```

### 4. Run
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:3001** → Login → Start managing configs!

---

## 📡 API Endpoints

| Endpoint | What it does |
|----------|--------------|
| `GET /configs` | List all configs |
| `POST /configs/:env/:name` | Create/update config (new version) |
| `GET /configs/:env/:name` | Get all versions |
| `POST /configs/:env/:name/rollback` | Rollback to a version |
| `POST /configs/promote` | Promote between environments |

All endpoints require header: `X-API-Key: your-key`

---

## 🔐 Security

- **Dashboard**: Protected by Supabase Auth (admin creates users)
- **API**: Protected by API key in header
- **Database**: Sensitive values encrypted with AES-256-GCM

---

## 📄 License

MIT
