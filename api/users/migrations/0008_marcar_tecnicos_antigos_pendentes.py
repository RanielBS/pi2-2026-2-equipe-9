
from django.db import migrations


def marcar_tecnicos_antigos_pendentes(apps, schema_editor):
    User = apps.get_model("users", "User")

    User.objects.filter(
        role="tecnico",
        approval_status="nao_exigida"
    ).update(
        approval_status="pendente"
    )


def reverter_marcacao(apps, schema_editor):
    User = apps.get_model("users", "User")

    User.objects.filter(
        role="tecnico",
        approval_status="pendente"
    ).update(
        approval_status="nao_exigida"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_user_approval_status_user_can_approve_technicians"),
    ]

    operations = [
        migrations.RunPython(
            marcar_tecnicos_antigos_pendentes,
            reverter_marcacao
        ),
    ]
