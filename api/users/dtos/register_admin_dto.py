from dataclasses import dataclass


@dataclass
class RegisterAdminDTO:
    requested_by: int
    name: str
    login_identifier: str
    password: str