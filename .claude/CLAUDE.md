# CLAUDE.md — Projeto SDR AI-Augmented

## Visão Geral do Projeto
Sistema de prospecção B2B híbrida (AI + humano) para geração de leads qualificados.
**Não é cold email 100% automatizado** — conversão típica: 8–15% vs 0.5–2% de automação pura.

**Objetivo final:** Executar atividades de SDR Senior (pesquisa, qualificação, primeiro contato) 
com supervisão humana para qualificação final e fechamento.

## Stack Tecnológica
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Python 3.11 + FastAPI + Uvicorn
- **Database:** PostgreSQL 16 (com JSONB para metadata variável)
- **Queue:** Redis + Celery (async jobs para scraping/email)
- **ORM:** SQLModel (Pydantic + SQLAlchemy 2.0)
- **Infra:** GCP GKE + Cloud Run + Cloud SQL
- **Autenticação:** Auth0 (não construir do zero)

## Convenções de Código

### Backend (Python)
- PEP 8 estrito + ruff para lint
- Type hints em TODAS as funções (Python 3.11+)
- Pydantic v2 para validação de dados
- Estrutura: `app/{api,core,models,schemas,services,agents,tasks}`
- Absolute imports: `from app.models import Lead`
- Testes: pytest + coverage > 80%

### Frontend (Next.js 15)
- TypeScript estrito (noImplicitAny = true)
- Functional components + hooks apenas
- Tailwind para styling (NUNCA CSS modules)
- shadcn/ui para componentes base
- Estrutura: `src/{app,components,lib,hooks,types}`

### Database (PostgreSQL)
- Tabelas: snake_case plurais (leads, campaigns)
- PK: id BIGSERIAL PRIMARY KEY
- Timestamps: created_at, updated_at (TIMESTAMPTZ)
- JSONB para metadata variável

## Comandos do Projeto

```bash
# Backend
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests
pytest tests/ -v --cov=app --cov-report=html

# Lint
ruff check . && ruff format .

# Migrations
alembic revision --autogenerate -m "desc"
alembic upgrade head

# Frontend
cd frontend
npm run dev
npm run build

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## Regras Críticas (NUNCA fazer)

1. **NUNCA expor credenciais no código** — sempre .env
2. **NUNCA fazer scraping sem rate limiting** — máx 2 req/segundo por domínio
3. **NUNCA enviar email sem opt-out** — link unsubscribe OBRIGATÓRIO (LGPD/GDPR)
4. **NUNCA tratar lead como "qualificado" sem validação humana**
5. **NUNCA usar LLM com temperature > 0 para decisões críticas**
6. **NUNCA construir auth do zero** — usar Auth0/Clerk
7. **NUNCA ignorar erros do Celery** — configurar retry + dead letter queue
8. **NUNCA printar** — usar `logging` com níveis apropriados
9. **NUNCA usar `Any`** — só quando impossível inferir tipo
10. **NUNCA requirements.txt** — usar `pyproject.toml`

## Contexto de Negócio

### Métricas de Sucesso (KPIs)
| Métrica | Meta |
|---------|------|
| Leads encontrados/dia | 200–500 |
| Leads qualificados (BANT) | 15–30/dia |
| Taxa de abertura email | 40–60% |
| Taxa de resposta | 8–15% |
| Conversão para reunião | 3–7% |

### Regras de Qualificação (BANT)
```python
qualificado = has_budget and has_authority and has_need and has_timeline
# has_authority: role in ["CTO", "VP Engenharia", "Head Infra"]
```

### O que Agente SDR faz (AUTOMÁTICO)
1. Scraping inteligente (LinkedIn, Crunchbase, GitHub)
2. Enriquecimento de dados (Clearbit, Apollo, Hunter.io)
3. Personalização de email (LLM gera copy única)
4. Follow-up automático (3–5 emails, 3–5 dias)
5. Agendamento (Calendly integration)

### O que Agente SDR NÃO faz (HUMANO faz)
1. Qualificação final (confirmar budget, autoridade real)
2. Negociação (preço, escopo, contrato)
3. Fechamento (assinatura, pagamento)
4. Gestão de objeções complexas

## Arquivos Importantes
- `.env.example` — variáveis de ambiente
- `pyproject.toml` — dependencies Python
- `package.json` — dependencies Node
- `docker-compose.yml` — ambiente local
- `CLAUDE.md` — este arquivo
- `SOUL.md` — visão e princípios
- `ROADMAP.md` — milestones
- `PROMPT_MESTRE.md` — prompt desenvolvimento