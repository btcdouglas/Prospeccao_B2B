# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral

**SDR AI-Augmented** — sistema de prospecção B2B híbrida (IA + humano) para geração e qualificação de leads. Veja `.claude/SOUL.md` para visão/ética e `.claude/ROADMAP.md` para milestones.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.11 + FastAPI + Uvicorn |
| ORM | SQLModel (Pydantic v2 + SQLAlchemy 2.0) |
| Database | PostgreSQL 16 (campos JSON via `sa_column=Column(JSON)`) |
| Queue | Redis + Celery (`app.core.celery_app`) |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Gerenciador Python | `uv` (não pip) |
| Gerenciador Node | npm |

## Comandos

```bash
# Subir ambiente completo
docker compose up -d

# Rebuildar após mudanças no backend
docker compose build backend celery-worker && docker compose up -d backend celery-worker

# Rebuildar frontend
docker compose build frontend && docker compose up -d frontend

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f sdr_celery

# Backend local (sem Docker)
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests
cd backend && uv run pytest tests/ -v --cov=app

# Lint
cd backend && uv run ruff check . && uv run ruff format .

# Migrations Alembic (a implementar)
cd backend && uv run alembic revision --autogenerate -m "desc"
cd backend && uv run alembic upgrade head

# Frontend local
cd frontend && npm install && npm run dev
```

## Arquitetura

```
backend/app/
├── main.py              # FastAPI app; on_startup cria tabelas via SQLModel.metadata.create_all
├── core/
│   ├── config.py        # pydantic-settings: lê .env da raiz do repo (ROOT_DIR/../../../.env)
│   ├── database.py      # engine SQLAlchemy + create_db_and_tables() + get_session()
│   ├── celery_app.py    # Celery app (broker=Redis); workers consomem app.tasks.*
│   └── llm.py           # Cliente Groq (llama-3.3-70b-versatile)
├── models/
│   ├── campaign.py      # Campaign (id, name, tipo, target_industry, config, status)
│   └── lead.py          # Lead (email unique, company, tech_stack JSON, meta_data JSON, bant_score 0-100)
├── schemas/lead.py      # LeadBase / LeadCreate / LeadUpdate / LeadRead (Pydantic v2)
├── api/leads.py         # CRUD /leads/ (GET list+filter, POST, GET id, PATCH, DELETE)
└── tasks/
    └── scraping.py      # Celery task: scrape_company_leads(domain, tech_stack) — stub

frontend/src/
├── app/
│   ├── layout.tsx       # Root layout com Tailwind (bg-gray-950)
│   ├── globals.css      # @tailwind base/components/utilities
│   └── page.tsx         # Dashboard principal → <LeadsList>
├── components/
│   └── LeadsList.tsx    # Tabela de leads com status colorido e BANT score
├── lib/api.ts           # axios wrapper; baseURL = NEXT_PUBLIC_API_URL
└── types/lead.ts        # Interfaces Lead e LeadCreate
```

### Fluxo de dados principal

```
Frontend (3000) → GET/POST /leads/ → FastAPI (8000) → SQLModel → PostgreSQL (5432)
                                                    → Celery task → Redis (6379) → Worker
```

### Ponto crítico: campos JSON no modelo Lead

`tech_stack` e `meta_data` são armazenados como JSON no PostgreSQL via `sa_column=Column(JSON)` — **não** como `str`. O schema `LeadRead` espera `list[str]` e `dict`. Qualquer mudança nesses campos deve manter consistência entre model e schema.

## Variáveis de Ambiente (`.env` na raiz)

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | `postgresql://sdr:sdr_password@localhost:5432/sdr_db` |
| `REDIS_URL` | `redis://localhost:6379/0` |
| `SECRET_KEY` | ≥32 caracteres (LGPD/auth futuro) |
| `GROQ_API_KEY` | Chave Groq (LLM atual) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `APOLLO_API_KEY` | Enriquecimento (Fase 3) |
| `SENDGRID_API_KEY` | Envio de email (Fase 2) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` (frontend → backend) |

## Endpoints ativos

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/test-llm` | Teste de conectividade com Groq |
| GET | `/leads/` | Lista leads (params: `status`, `skip`, `limit`) |
| POST | `/leads/` | Cria lead |
| GET | `/leads/{id}` | Busca lead por ID |
| PATCH | `/leads/{id}` | Atualiza status/bant_score/role/name |
| DELETE | `/leads/{id}` | Remove lead |
| GET | `/docs` | Swagger UI |

## Regras Críticas

1. **Nunca `str()` em campos JSON** — `tech_stack` e `meta_data` vão direto para o ORM como `list`/`dict`
2. **Celery app** em `app.core.celery_app` (não `app.tasks`) — o worker referencia este módulo
3. **`config.py` lê `.env` da raiz** (3 níveis acima de `app/core/`): não mover `.env`
4. **`uv` em vez de pip** — dependências em `pyproject.toml`, nunca `requirements.txt`
5. **Alembic ainda não configurado** — mudanças de schema exigem `DROP TABLE` + restart por enquanto
