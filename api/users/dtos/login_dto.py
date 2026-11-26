from dataclasses import dataclass
from typing import Optional


@dataclass
class LoginDto:
    password: str
    phone: Optional[str] = None
    login_identifier: Optional[str] = None