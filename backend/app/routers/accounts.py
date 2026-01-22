from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
import secrets

from app.dependencies import get_current_user
from app.models.schemas import User, EmailAccount, GmailAuthUrl, SyncResponse
from app.services.supabase import get_supabase_admin
from app.services.gmail import (
    get_auth_url,
    exchange_code_for_tokens,
    get_gmail_service,
    get_user_email,
    fetch_emails,
    get_email_details,
    parse_email,
)
from app.services.analyzer import analyze_email
from app.config import get_settings

router = APIRouter(prefix="/accounts", tags=["accounts"])
settings = get_settings()

oauth_states: dict[str, str] = {}


@router.get("", response_model=list[EmailAccount])
async def list_accounts(current_user: User = Depends(get_current_user)):
    """List all connected email accounts for the current user."""
    supabase = get_supabase_admin()

    response = (
        supabase.table("email_accounts")
        .select("id, user_id, email_address, last_sync_at, created_at")
        .eq("user_id", current_user.id)
        .execute()
    )

    return response.data


@router.post("/connect", response_model=GmailAuthUrl)
async def connect_gmail(current_user: User = Depends(get_current_user)):
    """Start Gmail OAuth flow."""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = current_user.id

    auth_url = get_auth_url(state)
    return GmailAuthUrl(auth_url=auth_url)


@router.get("/callback")
async def gmail_callback(code: str, state: str):
    """Handle Gmail OAuth callback."""
    user_id = oauth_states.pop(state, None)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state",
        )

    try:
        tokens = exchange_code_for_tokens(code)
        service = get_gmail_service(tokens["access_token"], tokens["refresh_token"])
        email_address = get_user_email(service)
        supabase = get_supabase_admin()

        supabase.table("email_accounts").upsert(
            {
                "user_id": user_id,
                "email_address": email_address,
                "access_token": tokens["access_token"],
                "refresh_token": tokens["refresh_token"],
                "token_expiry": tokens["token_expiry"].isoformat(),
            },
            on_conflict="user_id,email_address",
        ).execute()

        return RedirectResponse(url=f"{settings.app_url}/dashboard?connected=true")

    except Exception as e:
        return RedirectResponse(
            url=f"{settings.app_url}/dashboard?error={str(e)[:100]}"
        )


@router.post("/{account_id}/sync", response_model=SyncResponse)
async def sync_emails(account_id: str, current_user: User = Depends(get_current_user)):
    """Sync emails from Gmail and analyze them."""
    supabase = get_supabase_admin()

    account_response = (
        supabase.table("email_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not account_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    account = account_response.data

    service = get_gmail_service(account["access_token"], account["refresh_token"])

    prefs_response = (
        supabase.table("user_preferences")
        .select("*")
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    vip_contacts = []
    vip_domains = []
    if prefs_response.data:
        vip_contacts = prefs_response.data.get("vip_contacts", [])
        vip_domains = prefs_response.data.get("vip_domains", [])

    messages, _ = fetch_emails(service, max_results=30)

    synced_count = 0
    analyzed_count = 0

    for msg in messages:
        existing = (
            supabase.table("emails")
            .select("id")
            .eq("account_id", account_id)
            .eq("gmail_id", msg["id"])
            .execute()
        )

        if existing.data:
            continue

        full_message = get_email_details(service, msg["id"])
        email_data = parse_email(full_message, account_id)

        insert_response = (
            supabase.table("emails")
            .insert(
                {
                    "account_id": email_data.account_id,
                    "gmail_id": email_data.gmail_id,
                    "thread_id": email_data.thread_id,
                    "sender_email": email_data.sender_email,
                    "sender_name": email_data.sender_name,
                    "subject": email_data.subject,
                    "snippet": email_data.snippet,
                    "body_text": email_data.body_text,
                    "received_at": email_data.received_at.isoformat(),
                    "is_read": email_data.is_read,
                    "labels": email_data.labels,
                }
            )
            .execute()
        )

        if insert_response.data:
            email_id = insert_response.data[0]["id"]
            synced_count += 1

            # Analyze email
            analysis = analyze_email(
                email_id=email_id,
                sender_email=email_data.sender_email,
                sender_name=email_data.sender_name,
                subject=email_data.subject,
                body_text=email_data.body_text or "",
                received_at=email_data.received_at,
                vip_contacts=vip_contacts,
                vip_domains=vip_domains,
            )

            supabase.table("email_analysis").insert(
                {
                    "email_id": email_id,
                    "priority_score": analysis.priority_score,
                    "explanation": analysis.explanation,
                    "action_items": analysis.action_items,
                    "urgency_factors": analysis.urgency_factors,
                }
            ).execute()

            analyzed_count += 1

    supabase.table("email_accounts").update(
        {"last_sync_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", account_id).execute()

    return SyncResponse(synced_count=synced_count, analyzed_count=analyzed_count)


@router.delete("/{account_id}")
async def disconnect_account(
    account_id: str, current_user: User = Depends(get_current_user)
):
    """Disconnect a Gmail account."""
    supabase = get_supabase_admin()

    response = (
        supabase.table("email_accounts")
        .delete()
        .eq("id", account_id)
        .eq("user_id", current_user.id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    return {"message": "Account disconnected successfully"}
