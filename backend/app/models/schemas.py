from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class User(BaseModel):
    id: str
    email: str


class TokenVerifyRequest(BaseModel):
    access_token: str


class EmailAccountBase(BaseModel):
    email_address: str


class EmailAccountCreate(EmailAccountBase):
    access_token: str
    refresh_token: str
    token_expiry: datetime


class EmailAccount(EmailAccountBase):
    id: str
    user_id: str
    last_sync_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GmailAuthUrl(BaseModel):
    auth_url: str


class EmailBase(BaseModel):
    gmail_id: str
    thread_id: str
    sender_email: str
    sender_name: Optional[str] = None
    subject: str
    snippet: str
    received_at: datetime
    is_read: bool
    labels: list[str] = []


class EmailCreate(EmailBase):
    account_id: str
    body_text: Optional[str] = None


class Email(EmailBase):
    id: str
    account_id: str
    body_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmailAnalysisBase(BaseModel):
    priority_score: int
    explanation: str
    action_items: list[str] = []
    urgency_factors: dict = {}


class EmailAnalysisCreate(EmailAnalysisBase):
    email_id: str


class EmailAnalysis(EmailAnalysisBase):
    id: str
    email_id: str
    analyzed_at: datetime

    class Config:
        from_attributes = True


class EmailWithAnalysis(Email):
    analysis: Optional[EmailAnalysis] = None


class UserPreferences(BaseModel):
    id: str
    user_id: str
    vip_contacts: list[str] = []
    vip_domains: list[str] = []


class UserPreferencesUpdate(BaseModel):
    vip_contacts: Optional[list[str]] = None
    vip_domains: Optional[list[str]] = None


class PriorityFeedback(BaseModel):
    is_correct: bool
    actual_priority: Optional[int] = None


class SyncResponse(BaseModel):
    synced_count: int
    analyzed_count: int
