from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


# -----------------------------
# Request (create)
# -----------------------------
class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    first_name: str
    last_name: str
   