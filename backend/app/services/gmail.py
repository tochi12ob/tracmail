import base64
from datetime import datetime, timezone
from typing import Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from app.config import get_settings
from app.models.schemas import EmailCreate

settings = get_settings()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
]


def get_oauth_flow() -> Flow:
    """Create Google OAuth flow for Gmail."""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.google_redirect_uri],
            }
        },
        scopes=SCOPES,
    )
    flow.redirect_uri = settings.google_redirect_uri
    return flow


def get_auth_url(state: str) -> str:
    """Generate Gmail OAuth authorization URL."""
    flow = get_oauth_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return auth_url


def exchange_code_for_tokens(code: str) -> dict:
    """Exchange authorization code for access and refresh tokens."""
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    return {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_expiry": credentials.expiry,
    }


def get_gmail_service(access_token: str, refresh_token: str):
    """Create Gmail API service instance."""
    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    )
    return build("gmail", "v1", credentials=credentials)


def get_user_email(service) -> str:
    """Get the email address of the authenticated user."""
    profile = service.users().getProfile(userId="me").execute()
    return profile["emailAddress"]


def fetch_emails(
    service, max_results: int = 50, page_token: Optional[str] = None
) -> tuple[list[dict], Optional[str]]:
    """Fetch emails from Gmail inbox."""
    results = (
        service.users()
        .messages()
        .list(
            userId="me",
            maxResults=max_results,
            pageToken=page_token,
            labelIds=["INBOX"],
        )
        .execute()
    )

    messages = results.get("messages", [])
    next_page_token = results.get("nextPageToken")

    return messages, next_page_token


def get_email_details(service, message_id: str) -> dict:
    """Get full email details including body."""
    message = (
        service.users()
        .messages()
        .get(userId="me", id=message_id, format="full")
        .execute()
    )
    return message


def parse_email(message: dict, account_id: str) -> EmailCreate:
    """Parse Gmail message into EmailCreate schema."""
    headers = {h["name"].lower(): h["value"] for h in message["payload"]["headers"]}

    from_header = headers.get("from", "")
    sender_email = from_header
    sender_name = None

    if "<" in from_header and ">" in from_header:
        sender_name = from_header.split("<")[0].strip().strip('"')
        sender_email = from_header.split("<")[1].split(">")[0]

    body_text = extract_body_text(message["payload"])

    internal_date = int(message.get("internalDate", 0))
    received_at = datetime.fromtimestamp(internal_date / 1000, tz=timezone.utc)

    return EmailCreate(
        account_id=account_id,
        gmail_id=message["id"],
        thread_id=message["threadId"],
        sender_email=sender_email,
        sender_name=sender_name,
        subject=headers.get("subject", "(No Subject)"),
        snippet=message.get("snippet", ""),
        body_text=body_text,
        received_at=received_at,
        is_read="UNREAD" not in message.get("labelIds", []),
        labels=message.get("labelIds", []),
    )


def extract_body_text(payload: dict) -> str:
    """Extract plain text body from email payload."""
    body_text = ""

    if "body" in payload and payload["body"].get("data"):
        body_text = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")
    elif "parts" in payload:
        for part in payload["parts"]:
            if part["mimeType"] == "text/plain" and part["body"].get("data"):
                body_text = base64.urlsafe_b64decode(part["body"]["data"]).decode(
                    "utf-8"
                )
                break
            elif part["mimeType"] == "multipart/alternative":
                body_text = extract_body_text(part)
                if body_text:
                    break

    return body_text[:10000] if body_text else ""  # Limit body size
