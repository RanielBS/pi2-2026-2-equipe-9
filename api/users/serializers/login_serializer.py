
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

from users.dtos.login_dto import LoginDto


class LoginSerializer(serializers.Serializer):

    phone = PhoneNumberField(
        region="BR",
        required=False,
        allow_null=True,
        help_text="Telefone de produtores e técnicos."
    )

    login_identifier = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=False,
        help_text="Identificador de acesso administrativo."
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        required=True,
        help_text="Senha do usuário (mínimo 6 caracteres)."
    )

    def validate(self, data):
        phone = data.get("phone")
        login_identifier = data.get("login_identifier")

        if bool(phone) == bool(login_identifier):
            raise serializers.ValidationError(
                "Informe telefone ou identificador administrativo, "
                "mas não os dois."
            )

        return data

    def to_dto(self):
        phone = self.validated_data.get("phone")
        login_identifier = self.validated_data.get("login_identifier")

        return LoginDto(
            password=self.validated_data["password"],
            phone=str(phone) if phone else None,
            login_identifier=login_identifier
        )
