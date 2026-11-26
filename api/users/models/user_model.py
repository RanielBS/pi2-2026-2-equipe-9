
from django.db import models


class UserStatus(models.IntegerChoices):
    INACTIVE = 0, "Inativo"
    ACTIVE = 1, "Ativo"
    BLOCKED = 2, "Bloqueado"


class UserRole(models.TextChoices):
    ADMIN = "admin", "Administrador"
    PRODUCER = "produtor", "Agricultor"
    TECHNICIAN = "tecnico", "Técnico"

class TechnicianApprovalStatus(models.TextChoices):
    NOT_REQUIRED = "nao_exigida", "Não exigida"
    PENDING = "pendente", "Pendente"
    APPROVED = "aprovado", "Aprovado"
    REJECTED = "rejeitado", "Rejeitado"

class User(models.Model):
    id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=150)

    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    login_identifier = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True
    )

    password_hash = models.CharField(max_length=255)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    is_admin = models.BooleanField(default=False)

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PRODUCER
    )

    professional_register = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    specialty = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )

    status = models.PositiveSmallIntegerField(
        choices=UserStatus.choices,
        default=UserStatus.ACTIVE
    )

    approval_status = models.CharField(
        max_length=20,
        choices=TechnicianApprovalStatus.choices,
        default=TechnicianApprovalStatus.NOT_REQUIRED
    )

    can_approve_technicians = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Users"
