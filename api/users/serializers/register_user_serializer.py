
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

from users.dtos.farm_dto import FarmDTO
from users.dtos.register_user_dto import RegisterUserDTO
from users.models.user_model import UserRole
from users.models.technician_profile_model import TechnicianType
from users.serializers.register_farm_serializer import RegisterFarmSerializer


class RegisterUserSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=150, required=True)

    accept_terms = serializers.BooleanField(required=True)

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
        allow_blank=True
    )

    specialty = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    technician_type = serializers.ChoiceField(
        choices=TechnicianType.choices,
        required=False
    )

    is_professor = serializers.BooleanField(
        required=False,
        default=False
    )

    institution = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True
    )

    course = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    qualification_description = serializers.CharField(
        required=False,
        allow_blank=True
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

        if data["role"] == UserRole.TECHNICIAN:

            technician_type = data.get("technician_type")
            is_professor = data.get("is_professor", False)

            if not technician_type:
                raise serializers.ValidationError({
                    "technician_type": (
                        "Informe se o técnico é estudante ou profissional."
                    )
                })

            if is_professor and technician_type != TechnicianType.PROFESSIONAL:
                raise serializers.ValidationError({
                    "is_professor": (
                        "Professores devem ser classificados como profissionais."
                    )
                })

            if technician_type == TechnicianType.STUDENT:

                if not data.get("institution"):
                    raise serializers.ValidationError({
                        "institution": (
                            "A instituição de ensino é obrigatória para estudantes."
                        )
                    })

                if not data.get("course"):
                    raise serializers.ValidationError({
                        "course": "O curso é obrigatório para estudantes."
                    })

            if technician_type == TechnicianType.PROFESSIONAL:

                if not data.get("specialty"):
                    raise serializers.ValidationError({
                        "specialty": (
                            "A especialidade é obrigatória para profissionais."
                        )
                    })

                if not data.get("qualification_description"):
                    raise serializers.ValidationError({
                        "qualification_description": (
                            "Informe sua formação ou qualificação profissional."
                        )
                    })

                if is_professor and not data.get("institution"):
                    raise serializers.ValidationError({
                        "institution": (
                            "A instituição de ensino é obrigatória para professores."
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
            professional_register=(
                data.get("professional_register") or None
            ),
            specialty=data.get("specialty") or None,
            technician_type=data.get("technician_type"),
            is_professor=data.get("is_professor", False),
            institution=data.get("institution") or None,
            course=data.get("course") or None,
            qualification_description=(
                data.get("qualification_description") or None
            )
        )
