
from django.db import models


class TechnicianType(models.TextChoices):
    STUDENT = "estudante", "Estudante"
    PROFESSIONAL = "profissional", "Profissional"


class TechnicianProfile(models.Model):
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="technician_profile"
    )

    technician_type = models.CharField(
        max_length=20,
        choices=TechnicianType.choices
    )

    is_professor = models.BooleanField(default=False)

    institution = models.CharField(
        max_length=200,
        blank=True
    )

    course = models.CharField(
        max_length=150,
        blank=True
    )

    qualification_description = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "TechnicianProfiles"

    def __str__(self):
        return f"Perfil técnico de {self.user.name}"
