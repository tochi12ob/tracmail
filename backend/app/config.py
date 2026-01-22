from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "http://localhost:8000/api/accounts/callback"

    openai_api_key: str

    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
