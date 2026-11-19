
from rest_framework import serializers


class FarmResponseSerializer(serializers.Serializer):
    """Serializer para resposta de dados da fazenda."""
    name = serializers.CharField()
    state = serializers.CharField(required=False)
    location = serializers.CharField()
    municipality = serializers.CharField()


class UserResponseSerializer(serializers.Serializer):
    """Serializer para resposta de dados do usuário."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField()
    is_admin = serializers.BooleanField()
    role = serializers.CharField(required=False)
    professional_register = serializers.CharField(
        required=False,
        allow_null=True
    )
    specialty = serializers.CharField(
        required=False,
        allow_null=True
    )
    status = serializers.CharField()
    farm = FarmResponseSerializer(required=False, allow_null=True)


class LoginResponseSerializer(serializers.Serializer):
    """Serializer para resposta de login."""
    token = serializers.CharField()
    user = UserResponseSerializer()


class RegisterUserResponseSerializer(serializers.Serializer):
    """Serializer para resposta de registro de usuário."""
    user = UserResponseSerializer()
