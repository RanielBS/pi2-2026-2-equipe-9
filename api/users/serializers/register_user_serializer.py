
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

from users.dtos.farm_dto import FarmDTO
from users.dtos.register_user_dto import RegisterUserDTO
from users.models.user_model import UserRole
from users.serializers.register_farm_serializer import RegisterFarmSerializer


class RegisterUserSerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=150,
        required=True
    )

    accept_terms = serializers.BooleanField(
        required=True
    )

    phone = PhoneNumberField(
        region="BR",
        required=True
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        required=True
    )

    confirm_password = serializers.CharField(
        write_only=True,
        required=True
    )

    role = serializers.ChoiceField(
        choices=[
            UserRole.PRODUCER,
            UserRole.TECHNICIAN
        ],
        default=UserRole.PRODUCER
    )

    professional_register = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=False
    )

    specialty = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=False
    )

    farm = RegisterFarmSerializer(
        required=False,
        allow_null=True
    )

    def validate(self, data):

        if not data["accept_terms"]:
            raise serializers.ValidationError({
                "accept_terms": (
                    "É necessário aceitar os Termos de Uso "
                    "e a Política de Privacidade."
                )
            })

        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "As senhas não coincidem."
            })

        role = data["role"]

        if role == UserRole.TECHNICIAN:
            if not data.get("professional_register"):
                raise serializers.ValidationError({
                    "professional_register": (
                        "O registro profissional é obrigatório para técnicos."
                    )
                })

            if not data.get("specialty"):
                raise serializers.ValidationError({
                    "specialty": (
                        "A especialidade é obrigatória para técnicos."
                    )
                })

        return data

    def to_dto(self):

        data = self.validated_data
        farm_data = data.get("farm")

        farm_dto = None

        if farm_data:
            farm_dto = FarmDTO(
                name=farm_data["name"],
                state=farm_data["state"],
                location=farm_data["location"],
                municipality=farm_data["municipality"]
            )

        return RegisterUserDTO(
            name=data["name"],
            phone=str(data["phone"]),
            password=data["password"],
            role=data["role"],
            farm=farm_dto,
            professional_register=data.get("professional_register"),
            specialty=data.get("specialty")
        )
