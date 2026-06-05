from groq import Groq

from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def test_groq() -> str:
    resp = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": "Responda apenas: ok"}],
    )
    return resp.choices[0].message.content or ""