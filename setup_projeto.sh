#!/bin/bash
set -e
echo "=== Criando estrutura do projeto SDR AI-Augmented ==="
mkdir -p .claude
mkdir -p backend/app/{api,core,models,schemas,services,agents,tasks}
mkdir -p backend/tests/{unit,integration}
mkdir -p backend/alembic/versions
mkdir -p frontend/src/{app,components,lib,hooks,types}
mkdir -p frontend/public
mkdir -p docs
echo "[1/10] .gitignore..."
cat > .gitignore << 'EOF'
__pycache__/
*.py[cod]
*.so
.Python
venv/
.venv/
*.egg-info/
dist/
build/
*.egg
.pytest_cache/
.coverage
node_modules/
.next/
out/
.env
.env.local
*.pem
.vscode/
.idea/
*.swp
.DS_Store
*.log
logs/
*.db
uploads/
EOF
echo "[2/10] .env.example..."
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://sdr:sdr_password@localhost:5432/sdr_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=CHANGE_THIS_MIN_32_CHARS
ANTHROPIC_API_KEY=
APOLLO_API_KEY=
CLEARBIT_API_KEY=
SENDGRID_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF
echo "[3/10] docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: sdr_db
      POSTGRES_USER: sdr
      POSTGRES_PASSWORD: sdr_password
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sdr"]
      interval: 10s
      timeout: 5s
      retries: 5
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]
  backend:
    build: {context: ./backend, dockerfile: Dockerfile}
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://sdr:sdr_password@postgres:5432/sdr_db
      - REDIS_URL=redis://redis:6379/0
    volumes: [./backend:/app]
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_healthy}
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  frontend:
    build: {context: ./frontend, dockerfile: Dockerfile}
    ports: ["3000:3000"]
    volumes: [./frontend:/app, /app/node_modules]
    depends_on: [backend]
    command: npm run dev
  celery-worker:
    build: {context: ./backend, dockerfile: Dockerfile}
    environment:
      - DATABASE_URL=postgresql://sdr:sdr_password@postgres:5432/sdr_db
      - REDIS_URL=redis://redis:6379/0
    volumes: [./backend:/app]
    depends_on: [postgres, redis, backend]
    command: celery -A app.tasks.celery worker --loglevel=info
volumes:
  postgres_data:
  redis_data:
EOF
echo "[4/10] backend/pyproject.toml..."
cat > backend/pyproject.toml << 'EOF'
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "sdr-ai-agent"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi[standard]>=0.115.0",
    "sqlmodel>=0.0.22",
    "psycopg2-binary>=2.9.9",
    "celery>=5.4.0",
    "redis>=5.2.0",
    "pydantic>=2.9.0",
    "python-dotenv>=1.0.1",
    "httpx>=0.27.0",
    "alembic>=1.13.0",
    "pytest>=8.3.0",
    "ruff>=0.7.0",
]

[tool.setuptools]
packages = ["app"]

[tool.ruff]
target-version = "py311"
line-length = 100
EOF
echo "[5/10] backend/Dockerfile..."
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc postgresql-client && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml .
RUN pip install --no-cache-dir -e "."
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
echo "[6/10] frontend/package.json..."
cat > frontend/package.json << 'EOF'
{
  "name": "sdr-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {"dev": "next dev", "build": "next build", "start": "next start", "lint": "next lint"},
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "axios": "^1.7.7"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.14"
  }
}
EOF
echo "[7/10] frontend/Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
EOF
echo "[8/10] __init__.py files..."
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/services/__init__.py
touch backend/app/agents/__init__.py
touch backend/app/tasks/__init__.py
touch backend/tests/__init__.py
echo "[9/10] README files..."
cat > README.md << 'EOF'
# SDR AI-Augmented
## Quick Start
cp .env.example .env
docker-compose up -d
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
EOF
echo "[10/10] Criando .claude/..."
mkdir -p .claude
touch .claude/CLAUDE.md .claude/SOUL.md .claude/ROADMAP.md .claude/PROMPT_MESTRE.md
echo ""
echo "=== Estrutura criada com sucesso! ==="
echo "Próximos passos:"
echo "1. cp .env.example .env"
echo "2. Preencher .env com suas API keys"
echo "3. docker-compose up -d"
echo "4. Preencher .claude/CLAUDE.md, SOUL.md, ROADMAP.md, PROMPT_MESTRE.md"
