
from dataclasses import dataclass
from typing import Optional

from users.dtos.farm_dto import FarmDTO


@dataclass
class RegisterUserDTO:
    name: str
    phone: str
    password: str
    role: str = "produtor"
    farm: Optional[FarmDTO] = None
    professional_register: Optional[str] = None
    specialty: Optional[str] = None
