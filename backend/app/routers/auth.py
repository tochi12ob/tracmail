from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models.schemas import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user
