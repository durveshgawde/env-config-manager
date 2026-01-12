# Environment Configuration Manager

A production-grade system to safely manage, version, diff, promote, and roll back application configuration across environments. AWS-first architecture with Docker portability.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## 🚀 Features

- **Immutable Versioning** - Every config change creates a new version (never update, always insert)
- **Visual Diff Viewer** - Side-by-side comparison showing added, removed, and changed keys
- **Safe Rollback** - Instantly rollback to any previous version (creates new version with old data)
- **Environment Promotion** - Safely promote configs: dev → staging → prod
- **Docker Ready** - Containerized deployment with Docker Compose
- **AWS Native** - ECS Fargate deployment with CloudWatch logging
- **CI/CD Pipeline** - GitHub Actions for automated testing and deployment

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, Tailwind CSS, TypeScript |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL + JSONB) |
| **Containerization** | Docker, Docker Compose |
| **Cloud** | AWS ECS (Fargate), ECR, ALB, CloudWatch |
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

```
env-config-manager/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── lib/            # Supabase client
│   │   └── types/          # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # API client
│   ├── Dockerfile
│   └── package.json
├── supabase/
│   └── migrations/         # SQL schema
├── aws/
│   └── task-definition.json
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 20+
- Docker (optional, for containerized deployment)
- Supabase account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd env-config-manager

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend
cp frontend/.env.example frontend/.env
```

**backend/.env:**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
```

### 4. Run Locally

**Option A: Without Docker**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: With Docker**
```bash
docker-compose up --build
```

Open http://localhost:3001

## 📡 API Reference

### Base URL
```
http://localhost:3000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/configs` | List all configs |
| `POST` | `/configs/:env/:configName` | Create new version |
| `GET` | `/configs/:env/:configName` | List versions |
| `GET` | `/configs/:env/:configName/:version` | Get specific version |
| `GET` | `/configs/:env/:configName/diff?from=X&to=Y` | Diff between versions |
| `POST` | `/configs/:env/:configName/rollback` | Rollback to version |
| `POST` | `/configs/promote` | Promote between envs |

### Examples

**Create Config Version:**
```bash
curl -X POST http://localhost:3000/configs/dev/auth-service \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"JWT_SECRET": "secret", "TOKEN_EXPIRY": 3600},
    "message": "Initial config"
  }'
```

**Get Diff:**
```bash
curl "http://localhost:3000/configs/dev/auth-service/diff?from=1&to=2"
```

**Promote to Staging:**
```bash
curl -X POST http://localhost:3000/configs/promote \
  -H "Content-Type: application/json" \
  -d '{
    "configName": "auth-service",
    "fromEnv": "dev",
    "toEnv": "staging",
    "version": 3
  }'
```

## 🐳 Docker Deployment

### Build & Run Locally

```bash
docker-compose up --build
```

### Build for Production

```bash
# Backend
cd backend
docker build -t config-manager-api .

# Run
docker run -p 3000:3000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  config-manager-api
```

## ☁️ AWS Deployment

### Prerequisites

1. AWS CLI configured
2. ECR repository created
3. ECS cluster created
4. Secrets stored in SSM Parameter Store

### GitHub Actions Secrets

Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Deploy

Push to `main` branch triggers automatic deployment:
1. Tests run
2. Docker image built
3. Pushed to ECR
4. ECS service updated

### Manual AWS Setup

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name config-manager-api

# 2. Store secrets in SSM
aws ssm put-parameter --name "/config-manager/supabase-url" \
  --value "your_url" --type SecureString
aws ssm put-parameter --name "/config-manager/supabase-anon-key" \
  --value "your_key" --type SecureString

# 3. Create ECS Cluster
aws ecs create-cluster --cluster-name config-manager-cluster

# 4. Register task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# 5. Create service (after ALB setup)
aws ecs create-service \
  --cluster config-manager-cluster \
  --service-name config-manager-service \
  --task-definition config-manager-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## 🗄️ Database Schema

```sql
-- configs: Logical entities
CREATE TABLE configs (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  created_at TIMESTAMPTZ
);

-- config_versions: Immutable history
CREATE TABLE config_versions (
  id UUID PRIMARY KEY,
  config_id UUID REFERENCES configs(id),
  environment TEXT CHECK (environment IN ('dev', 'staging', 'prod')),
  version_number INT,
  data JSONB,
  message TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  UNIQUE(config_id, environment, version_number)
);
```

## 🔒 Security

- **No secrets in configs** - Use Supabase Vault or AWS SSM for secrets
- **Immutable versioning** - Prevents accidental data loss
- **Environment isolation** - Separate configs per environment
- **Validation** - All inputs validated with Zod

## 📈 Resume Section

```
Environment Configuration Manager

• Designed and implemented a version-controlled configuration 
  management system with diffing, rollback, and environment promotion

• Built backend services using Node.js, Docker, and Supabase 
  (Postgres JSONB)

• Deployed containerized APIs on AWS ECS with CI/CD pipelines 
  and CloudWatch logging

• Implemented immutable config versioning to ensure safe 
  production changes
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for production-grade configuration management.
