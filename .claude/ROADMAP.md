# ROADMAP.md — Milestones do Projeto B2B f.AInder

## Fase 0: Setup (Dia 1–2)
- [x] Criar repositório
- [x] Configurar backend/frontend/Docker
- [ ] Criar .claude/*.md files

**Critério:** `docker-compose up` sobe ambiente em < 5 min

---

## Fase 1: MVP Core (Semana 1–2)

### 1.1 Modelos Database
- [ ] Lead (email, company, role, tech_stack, bant_score, status)
- [ ] Campaign (name, tipo, target_industry, config)
- [ ] Migrações Alembic
- [ ] Seed script (50 leads)

### 1.2 API CRUD
- [ ] GET /api/leads (listar + pagination)
- [ ] POST /api/leads (criar)
- [ ] PATCH /api/leads/{id} (atualizar)
- [ ] DELETE /api/leads/{id}
- [ ] Swagger docs

### 1.3 Dashboard Frontend
- [ ] LeadsList.tsx (tabela)
- [ ] LeadCard.tsx (card individual)
- [ ] CampaignCreate.tsx (formulário)
- [ ] Dashboard.tsx (KPIs)

### 1.4 Celery Task
- [ ] Configurar Celery + Redis
- [ ] Task scrape_company_leads (dummy data)
- [ ] Worker rodando

**Critério Aceitação Fase 1:**
✅ Backend em /health, /leads, /campaigns  
✅ Frontend listando leads  
✅ Celery worker rodando  
✅ 50 leads no database  
✅ Docker sobe tudo em < 5 min  
✅ Tests coverage > 80%  

---

## Fase 2: Email Outreach (Semana 3–4)

- [ ] SendGrid integration
- [ ] Template personalizável
- [ ] LLM personalização (Claude API)
- [ ] Follow-up automático (3–5 emails)
- [ ] Unsubscribe link obrigatório
- [ ] Tracking open/click

**Critério:** 100 emails → 40% open → 10% response

---

## Fase 3: Enriquecimento (Semana 5)

- [ ] Apollo.io API ($49/mês)
- [ ] Clearbit API (free 100/mês)
- [ ] Hunter.io API (free 50/mês)
- [ ] BANT score automático (0–100)

---

## Fase 4: CRM Integration (Semana 6)

- [ ] HubSpot integration
- [ ] Pipedrive (alternativa)
- [ ] Sync bidirecional

---

## Fase 5: Polimento (Semana 7–8)

- [ ] Auth0 authentication
- [ ] Multi-tenancy
- [ ] Analytics dashboard (ROI)
- [ ] Alerts (email, Slack)
- [ ] Deploy produção (GCP Cloud Run)

---

## Pós-V1 (Mês 3+)

- [ ] LinkedIn outreach (API oficial)
- [ ] Phone agent (Twilio + LLM)
- [ ] Video personalizadas
- [ ] Multi-idioma (PT, EN, ES)

---

## Timeline Realista

| Fase | Prazo Realista |
|------|----------------|
| Fase 0 | 2 dias |
| Fase 1 | 2 semanas |
| Fase 2 | 2 semanas |
| Fase 3 | 1 semana |
| Fase 4 | 1 semana |
| Fase 5 | 2 semanas |
| **TOTAL MVP** | **7 semanas** |

---

## Dependencies Críticas

| Dependency | Custo | Alternativa |
|------------|-------|-------------|
| Apollo.io API | $49/mês | Clearbit (free 100/mês) |
| SendGrid | Free 100/dia | Postmark, Resend |
| Claude API | ~$15/mês | GPT-4o, Gemini Pro |
| Auth0 | Free 7k MAU | Clerk, Supabase |

---

**Status atual:** Fase 0 (setup) — em andamento