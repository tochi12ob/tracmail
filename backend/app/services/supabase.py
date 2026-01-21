from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Public client for user-context operations
supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)

# Service client for admin operations (bypasses RLS)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase() -> Client:
    return supabase


def get_supabase_admin() -> Client:
    return supabase_admin
