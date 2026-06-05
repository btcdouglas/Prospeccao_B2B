# SOUL.md — Alma do Projeto B2B f.AInder

## Por que este projeto existe

> "SDRs humanos gastam 70% do tempo em tarefas repetitivas. 
> Este sistema remove o trabalho sujo, permitindo que humanos foquem no que importa: 
> relacionamento, negociação e fechamento."

**Missão:** Aumentar produtividade de comerciais B2B em 5–10x sem perder toque humano.

**Valores:**
1. **Hibridismo > Automação total** — IA faz o escalável, humano faz o humano
2. **Transparência** — lead sabe que está falando com IA quando relevante
3. **Ética** — não spam, respeitar GDPR/LGPD, opt-out sempre
4. **Dados > Opinião** — decisões baseadas em métricas
5. **Iteração rápida** — MVP em 4 semanas, melhorar depois

## O que este projeto NÃO é

- ❌ Não é ferramenta de spam/cold email em massa
- ❌ Não é substituto completo do profissional de prospecção humano
- ❌ Não é sistema "set and forget"
- ❌ Não é solução mágica

## Princípios de Design

### 1. Human-in-the-Loop
Agente → Qualifica → Humano → Valida → Agente → Prossegue
Nenhum lead é "fechado" sem toque humano.

### 2. Graceful Degradation
- Se API falha → fonte secundária
- Se LLM não responde → cache
- Se email bounces → tentar telefone/LinkedIn

### 3. Observabilidade
- Cada lead tem log completo
- Dashboard mostra conversão por etapa
- Alertas quando métricas caem

### 4. Privacy by Design
- Dados criptografados (AES-256)
- PII minimizada
- Deletar leads não convertidos após 12 meses

## Visão de Futuro (6–12 meses)

| Fase | O que | Timeline |
|------|-------|----------|
| MVP | Scraping + email + dashboard | Semana 1–4 |
| V1 | LinkedIn + CRM + Celery | Semana 5–8 |
| V2 | Multi-idioma + Phone | Mês 3 |
| V3 | AI Voice + Video | Mês 4–6 |
| V4 | Marketplace de agents | Mês 6–12 |

## Métricas Pessoais (Douglas)

- **ROI mínimo:** 10x (R$ 10k → R$ 100k/ano)
- **Time-to-value:** Primeiro lead em < 14 dias
- **Manutenção:** < 5h/semana após MVP
- **Escalabilidade:** 10x mais leads sem rebuild

## Tom de Voz

### Emails para Leads
- Profissional mas humano, evitar jargão
- Personalizado (mencionar algo específico)
- Conciso (máx 150 palavras)
- CTA claro ("Tem 15 minutos terça às 14h?")

### Dashboard
- Dados claros, sem vanity metrics
- Foco em conversão (reuniões agendadas)
- Alertas proativos

## Riscos Técnicos Conhecidos

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| LinkedIn bloqueia scraping | Alta | API oficial (Apollo), proxies |
| LLM fica caro | Média | Cache de prompts, budget $15/mês |
| Email vai para spam | Média | SPF/DKIM/DMARC, warmup domain |
| Violação LGPD | Média | Consentimento explícito, opt-out |

## Mantras do Projeto

- "Human-in-the-loop sempre"
- "Dados > Opinião"
- "Iteração rápida > Perfeição"
- "Type safety não é opcional"
- "Ética não é negociável"