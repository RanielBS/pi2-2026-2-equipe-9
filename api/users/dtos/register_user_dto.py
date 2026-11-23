
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

    technician_type: Optional[str] = None
    is_professor: bool = False
    institution: Optional[str] = None
    course: Optional[str] = None
    qualification_description: Optional[str] = None
