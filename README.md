# SDR AI-Augmented

Sistema de prospecção B2B híbrida (IA + humano) para geração e qualificação de leads com conversão típica de **8–15%** — versus 0,5–2% de automação pura.

> "SDRs humanos gastam 70% do tempo em tarefas repetitivas. Este sistema remove o trabalho sujo, permitindo que humanos foquem no que importa: relacionamento, negociação e fechamento."

---

## Como funciona

A IA executa as etapas escaláveis (pesquisa, enriquecimento, personalização, follow-up). O humano faz o que nenhuma IA substitui: qualificação final, negociação e fechamento.

```
Scraping → Enriquecimento → Qualificação BANT → [Humano valida] → Email personalizado → Reunião
```

**O agente faz (automático):**
- Scraping inteligente (LinkedIn, Crunchbase, GitHub)
- Enriquecimento de dados (Apollo, Clearbit, Hunter.io)
- Score BANT automatizado (0–100)
- Personalização de email via LLM (copy única por lead)
- Follow-up automático (3–5 emails, 3–5 dias de intervalo)

**O humano faz:**
- Validação final de qualificação
- Negociação e fechamento
- Gestão de objeções complexas

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI + Uvicorn |
| ORM | SQLModel (Pydantic v2 + SQLAlchemy 2.0) |
| Database | PostgreSQL 16 |
| Queue | Redis + Celery |
| LLM | Groq (llama-3.3-70b-versatile) |
| Infra (prod) | GCP Cloud Run + Cloud SQL |

---

## Quick Start

### Pré-requisitos

- Docker Desktop instalado e rodando
- Chaves de API configuradas no `.env`

### 1. Clonar e configurar

```bash
git clone https://github.com/btcdouglas/Prospeccao_B2B.git
cd Prospeccao_B2B

cp .env.example .env
# Edite .env com suas chaves de API
```

### 2. Subir o ambiente

```bash
# Usando o script de menu (recomendado)
bash sdr.sh

# Ou direto com Docker
docker compose up -d
```

### 3. Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | URL do PostgreSQL | Sim |
| `REDIS_URL` | URL do Redis | Sim |
| `SECRET_KEY` | ≥ 32 caracteres | Sim |
| `GROQ_API_KEY` | Chave Groq (LLM) | Sim |
| `APOLLO_API_KEY` | Enriquecimento de leads | Fase 3 |
| `SENDGRID_API_KEY` | Envio de email | Fase 2 |
| `NEXT_PUBLIC_API_URL` | URL do backend para o frontend | Sim |

---

## Endpoints da API

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/test-llm` | Teste de conectividade com LLM |
| GET | `/leads/` | Lista leads (filtros: `status`, `skip`, `limit`) |
| POST | `/leads/` | Cria lead |
| GET | `/leads/{id}` | Busca lead por ID |
| PATCH | `/leads/{id}` | Atualiza status / BANT score |
| DELETE | `/leads/{id}` | Remove lead |

---

## Comandos de Desenvolvimento

```bash
# Rebuild após mudanças no backend
docker compose build backend celery-worker && docker compose up -d backend celery-worker

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f sdr_celery

# Backend local (sem Docker)
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Testes
cd backend && uv run pytest tests/ -v --cov=app

# Lint
cd backend && uv run ruff check . && uv run ruff format .

# Frontend local
cd frontend && npm install && npm run dev
```

---

## Estrutura do Projeto

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # Rotas FastAPI
│   │   ├── core/         # Config, database, Celery, LLM
│   │   ├── models/       # SQLModel (Lead, Campaign)
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Apollo, PDL, etc.
│   │   └── tasks/        # Celery tasks (scraping)
│   ├── tests/
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── app/          # Next.js App Router
│       ├── components/   # LeadsList, Nav, Prospect*
│       ├── lib/          # axios wrapper
│       └── types/
├── docker-compose.yml
├── sdr.sh                # Script de gerenciamento do ambiente
└── .env.example
```

---

## Roadmap

| Fase | Entregável | Status |
|------|-----------|--------|
| 0 | Setup (backend, frontend, Docker) | ✅ Concluído |
| 1 | MVP Core (CRUD leads, dashboard, Celery) | 🔄 Em andamento |
| 2 | Email Outreach (SendGrid + LLM copy) | ⏳ Pendente |
| 3 | Enriquecimento (Apollo, Clearbit, Hunter) | ⏳ Pendente |
| 4 | CRM Integration (HubSpot/Pipedrive) | ⏳ Pendente |
| 5 | Polimento (Auth0, analytics, deploy GCP) | ⏳ Pendente |

---

## KPIs de Sucesso

| Métrica | Meta |
|---------|------|
| Leads encontrados/dia | 200–500 |
| Leads qualificados (BANT) | 15–30/dia |
| Taxa de abertura email | 40–60% |
| Taxa de resposta | 8–15% |
| Conversão para reunião | 3–7% |

---

## Princípios

- **Human-in-the-loop sempre** — nenhum lead é fechado sem validação humana
- **Ética não é negociável** — opt-out obrigatório, respeito a LGPD/GDPR
- **Dados > Opinião** — decisões baseadas em métricas
- **Iteração rápida** — MVP funcional antes de perfeição
