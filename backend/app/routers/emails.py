from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from app.dependencies import get_current_user
from app.models.schemas import (
    User,
    EmailWithAnalysis,
    PriorityFeedback,
    UserPreferences,
    UserPreferencesUpdate,
)
from app.services.supabase import get_supabase_admin

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("", response_model=list[EmailWithAnalysis])
async def list_emails(
    current_user: User = Depends(get_current_user),
    min_priority: Optional[int] = Query(None, ge=0, le=100),
    max_priority: Optional[int] = Query(None, ge=0, le=100),
    is_read: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """List emails with their analysis, optionally filtered by priority."""
    supabase = get_supabase_admin()

    # Get user's account IDs
    accounts_response = (
        supabase.table("email_accounts")
        .select("id")
        .eq("user_id", current_user.id)
        .execute()
    )

    if not accounts_response.data:
        return []

    account_ids = [a["id"] for a in accounts_response.data]

    query = (
        supabase.table("emails")
        .select("*, email_analysis(*)")
        .in_("account_id", account_ids)
        .order("received_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if is_read is not None:
        query = query.eq("is_read", is_read)

    emails_response = query.execute()

    results = []
    for email in emails_response.data:
        analysis = email.pop("email_analysis", None)
        if analysis and len(analysis) > 0:
            analysis_data = analysis[0]

            if min_priority is not None and analysis_data["priority_score"] < min_priority:
                continue
            if max_priority is not None and analysis_data["priority_score"] > max_priority:
                continue

            results.append(EmailWithAnalysis(**email, analysis=analysis_data))
        else:
            if min_priority is None and max_priority is None:
                results.append(EmailWithAnalysis(**email, analysis=None))

    return results


@router.get("/priority", response_model=list[EmailWithAnalysis])
async def get_priority_emails(
    current_user: User = Depends(get_current_user),
    threshold: int = Query(60, ge=0, le=100),
    limit: int = Query(20, ge=1, le=50),
):
    """Get high-priority emails above the threshold."""
    return await list_emails(
        current_user=current_user,
        min_priority=threshold,
        limit=limit,
        offset=0,
    )


@router.get("/{email_id}", response_model=EmailWithAnalysis)
async def get_email(email_id: str, current_user: User = Depends(get_current_user)):
    """Get a single email with its analysis."""
    supabase = get_supabase_admin()

    accounts_response = (
        supabase.table("email_accounts")
        .select("id")
        .eq("user_id", current_user.id)
        .execute()
    )

    account_ids = [a["id"] for a in accounts_response.data]

    email_response = (
        supabase.table("emails")
        .select("*, email_analysis(*)")
        .eq("id", email_id)
        .in_("account_id", account_ids)
        .single()
        .execute()
    )

    if not email_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Email not found"
        )

    email = email_response.data
    analysis = email.pop("email_analysis", None)
    analysis_data = analysis[0] if analysis and len(analysis) > 0 else None

    return EmailWithAnalysis(**email, analysis=analysis_data)


@router.post("/{email_id}/feedback")
async def submit_feedback(
    email_id: str,
    feedback: PriorityFeedback,
    current_user: User = Depends(get_current_user),
):
    """Submit feedback on priority scoring accuracy."""
    supabase = get_supabase_admin()

    accounts_response = (
        supabase.table("email_accounts")
        .select("id")
        .eq("user_id", current_user.id)
        .execute()
    )

    account_ids = [a["id"] for a in accounts_response.data]

    email_response = (
        supabase.table("emails")
        .select("id")
        .eq("id", email_id)
        .in_("account_id", account_ids)
        .execute()
    )

    if not email_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Email not found"
        )

    if feedback.actual_priority is not None:
        supabase.table("email_analysis").update(
            {"priority_score": feedback.actual_priority}
        ).eq("email_id", email_id).execute()

    return {"message": "Feedback recorded"}


@router.get("/preferences/me", response_model=UserPreferences)
async def get_preferences(current_user: User = Depends(get_current_user)):
    """Get user's email preferences."""
    supabase = get_supabase_admin()

    response = (
        supabase.table("user_preferences")
        .select("*")
        .eq("user_id", current_user.id)
        .single()
        .execute()
    )

    if not response.data:
        insert_response = (
            supabase.table("user_preferences")
            .insert(
                {
                    "user_id": current_user.id,
                    "vip_contacts": [],
                    "vip_domains": [],
                }
            )
            .execute()
        )
        return UserPreferences(**insert_response.data[0])

    return UserPreferences(**response.data)


@router.put("/preferences/me", response_model=UserPreferences)
async def update_preferences(
    preferences: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update user's email preferences."""
    supabase = get_supabase_admin()

    update_data = {}
    if preferences.vip_contacts is not None:
        update_data["vip_contacts"] = preferences.vip_contacts
    if preferences.vip_domains is not None:
        update_data["vip_domains"] = preferences.vip_domains

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    response = (
        supabase.table("user_preferences")
        .upsert(
            {
                "user_id": current_user.id,
                **update_data,
            },
            on_conflict="user_id",
        )
        .execute()
    )

    return UserPreferences(**response.data[0])
