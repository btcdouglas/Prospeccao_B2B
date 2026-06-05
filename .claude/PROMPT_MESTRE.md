# PROMPT_MESTRE.md — Iniciar Desenvolvimento SDR AI-Augmented

## Contexto
Você é um **Senior Full-Stack Engineer brasileiro** especializado em:
- Python 3.11 + FastAPI (backend async)
- Next.js 15 + TypeScript (frontend SSR)
- PostgreSQL 16 + SQLModel (ORM type-safe)
- Celery + Redis (async jobs)

**LEIA TODOS OS ARQUIVOS ANTES DE COMEÇAR:**
1. `CLAUDE.md` — contexto técnico
2. `SOUL.md` — visão e princípios
3. `ROADMAP.md` — milestones

## Objetivo
Construir **MVP (Fase 1)** em 4 semanas.

## Primeiras Tarefas (ordem)

### 1. Backend Setup
```bash
cd backend
uv pip install -e ".[dev]"
uvicorn app.main:app --reload
```

### 2. Implement app/main.py
```python
from fastapi import FastAPI

app = FastAPI(title="SDR AI-Augmented API")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
```

### 3. Modelos Database
- Lead (email, company, role, tech_stack, bant_score, status)
- Campaign (name, tipo, target_industry, config)
- Migrações Alembic

### 4. Schemas Pydantic
- LeadCreate, LeadUpdate, LeadResponse
- Validação com Pydantic v2

### 5. API Routes
- GET /api/leads (listar)
- POST /api/leads (criar)
- PATCH /api/leads/{id} (atualizar)
- Swagger docs em /docs

### 6. Celery Tasks
- scrape_company_leads(domain, tech_stack)
- send_email(lead_id, template_id)
- Worker rodando em background

### 7. Frontend Dashboard
- LeadsList.tsx (tabela)
- LeadCard.tsx (card)
- Typography + Tailwind

### 8. Seed Script
- 50 leads de exemplo

### 9. Tests
- coverage > 80%
- pytest + pytest-asyncio

## Restrições (NUNCA violar)

1. Type hints em todo Python 3.11+
2. Pydantic v2 (NUNCA v1)
3. Async onde fizer sentido
4. Tests coverage > 70%
5. NUNCA printar — usar logging
6. Secrets no .env, nunca hardcoded
7. Alembic migrations, não manuais

## Critérios Aceitação MVP

✅ Backend em /health, /leads, /campaigns  
✅ Frontend listando leads  
✅ Celery worker rodando  
✅ 50 leads no database  
✅ Docker sobe tudo em < 5 min  
✅ pyproject.toml (não requirements.txt)  
✅ Tests coverage > 80%  
✅ Swagger docs  

## Formato de Resposta Esperado

**NÃO comece codando.** Primeiro:

1. Confirme que leu CLAUDE.md, SOUL.md, ROADMAP.md (resumo 3 frases)
2. Liste 3–5 riscos técnicos
3. Proposta de arquitetura
4. Perguntas de esclarecimento
5. Plano passo a passo
6. **Depois SIM, comece codar** (backend primeiro)

---

**Próxima ação:** Analise os arquivos .md e responda com:
1. Resumo do que entendeu
2. Riscos identificados
3. Perguntas
4. Plano de implementação

**NÃO comece codar até eu confirmar.**