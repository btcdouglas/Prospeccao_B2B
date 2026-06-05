import logging

from app.core.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def scrape_company_leads(self, domain: str, tech_stack: list[str]) -> dict:
    """Stub: enriquece leads a partir de um domínio corporativo."""
    logger.info("Scraping %s (tech_stack=%s)", domain, tech_stack)
    return {"domain": domain, "leads_found": 0, "status": "stub"}
