
from django.db import migrations, models


def atualizar_papeis_existentes(apps, schema_editor):
    User = apps.get_model("users", "User")

    # Administradores existentes continuam sendo administradores.
    User.objects.filter(is_admin=True).update(role="admin")

    # Os demais usuários existentes são agricultores.
    User.objects.filter(is_admin=False).update(role="produtor")


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0005_farm_state"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="professional_register",
            field=models.CharField(
                blank=True,
                max_length=100,
                null=True
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("admin", "Administrador"),
                    ("produtor", "Agricultor"),
                    ("tecnico", "Técnico"),
                ],
                default="produtor",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="specialty",
            field=models.CharField(
                blank=True,
                max_length=150,
                null=True
            ),
        ),
        migrations.RunPython(
            atualizar_papeis_existentes,
            migrations.RunPython.noop,
        ),
    ]
