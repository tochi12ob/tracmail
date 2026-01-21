import json
from datetime import datetime, timezone
from openai import OpenAI
from app.config import get_settings
from app.models.schemas import EmailAnalysisCreate

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

ANALYSIS_PROMPT = """You are an email priority analyzer for busy professionals. Analyze the following email and determine its priority level.

Email Details:
- From: {sender_email} ({sender_name})
- Subject: {subject}
- Received: {received_at}
- Content: {body_text}

VIP Contacts: {vip_contacts}
VIP Domains: {vip_domains}

Analyze this email and provide:
1. Priority Score (0-100): How urgently does this need attention?
   - 80-100: Critical/Urgent - needs immediate response
   - 60-79: High priority - respond within hours
   - 40-59: Medium priority - respond within a day
   - 20-39: Low priority - can wait
   - 0-19: Not important - newsletters, promotions, etc.

2. Consider these factors:
   - Is the sender a VIP contact or from a VIP domain?
   - Are there urgent keywords (ASAP, urgent, deadline, today)?
   - Are there direct questions requiring response?
   - Is there a clear deadline mentioned?
   - Is it a personal/direct email vs automated/mass email?
   - Sentiment (frustrated, concerned, casual)

Respond in JSON format only:
{{
    "priority_score": <0-100>,
    "explanation": "<one sentence explaining priority>",
    "action_items": ["<action 1>", "<action 2>"],
    "urgency_factors": {{
        "is_vip": <true/false>,
        "has_deadline": <true/false>,
        "has_questions": <true/false>,
        "is_urgent": <true/false>,
        "sentiment": "<positive/neutral/negative/urgent>"
    }}
}}"""


def analyze_email(
    email_id: str,
    sender_email: str,
    sender_name: str | None,
    subject: str,
    body_text: str,
    received_at: datetime,
    vip_contacts: list[str] = None,
    vip_domains: list[str] = None,
) -> EmailAnalysisCreate:
    """Analyze an email using GPT-4 and return priority analysis."""

    vip_contacts = vip_contacts or []
    vip_domains = vip_domains or []

    # Quick pre-filter for obvious low-priority emails
    low_priority_indicators = [
        "unsubscribe",
        "newsletter",
        "noreply",
        "no-reply",
        "notifications@",
        "marketing@",
    ]

    sender_lower = sender_email.lower()
    subject_lower = subject.lower()

    # Check if obviously promotional/automated
    is_likely_automated = any(ind in sender_lower for ind in low_priority_indicators)

    if is_likely_automated and not any(
        vip in sender_lower for vip in vip_contacts
    ):
        return EmailAnalysisCreate(
            email_id=email_id,
            priority_score=10,
            explanation="Automated or marketing email detected",
            action_items=[],
            urgency_factors={
                "is_vip": False,
                "has_deadline": False,
                "has_questions": False,
                "is_urgent": False,
                "sentiment": "neutral",
            },
        )

    # Use GPT-4 for detailed analysis
    prompt = ANALYSIS_PROMPT.format(
        sender_email=sender_email,
        sender_name=sender_name or "Unknown",
        subject=subject,
        received_at=received_at.isoformat(),
        body_text=body_text[:3000] if body_text else "(No content)",
        vip_contacts=", ".join(vip_contacts) if vip_contacts else "None specified",
        vip_domains=", ".join(vip_domains) if vip_domains else "None specified",
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an email priority analyzer. Always respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )

        result_text = response.choices[0].message.content.strip()

        # Parse JSON response
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]

        result = json.loads(result_text)

        return EmailAnalysisCreate(
            email_id=email_id,
            priority_score=max(0, min(100, result.get("priority_score", 50))),
            explanation=result.get("explanation", "Unable to determine priority"),
            action_items=result.get("action_items", []),
            urgency_factors=result.get("urgency_factors", {}),
        )

    except Exception as e:
        # Fallback analysis on error
        return EmailAnalysisCreate(
            email_id=email_id,
            priority_score=50,
            explanation=f"Analysis failed, assigned medium priority: {str(e)[:50]}",
            action_items=[],
            urgency_factors={},
        )


def batch_analyze_emails(
    emails: list[dict],
    vip_contacts: list[str] = None,
    vip_domains: list[str] = None,
) -> list[EmailAnalysisCreate]:
    """Analyze multiple emails."""
    results = []
    for email in emails:
        analysis = analyze_email(
            email_id=email["id"],
            sender_email=email["sender_email"],
            sender_name=email.get("sender_name"),
            subject=email["subject"],
            body_text=email.get("body_text", ""),
            received_at=email["received_at"],
            vip_contacts=vip_contacts,
            vip_domains=vip_domains,
        )
        results.append(analysis)
    return results
