
from datetime import UTC, datetime, timedelta

import jwt
from decouple import config
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from rest_framework.exceptions import ParseError

from users.dtos.login_dto import LoginDto
from users.dtos.register_user_dto import RegisterUserDTO
from users.dtos.update_user_dto import UpdateUserDTO
from users.models.farm_model import Farm
from users.models.user_model import User, UserRole, UserStatus


class UserService:

    @staticmethod
    def _farm_data(farm):
        if not farm:
            return None

        return {
            "name": farm.name,
            "state": farm.state,
            "location": farm.location,
            "municipality": farm.municipality
        }

    @staticmethod
    def _user_data(user, farm=None):
        return {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "is_admin": user.is_admin,
            "role": user.role,
            "professional_register": user.professional_register,
            "specialty": user.specialty,
            "status": user.status,
            "farm": UserService._farm_data(farm)
        }

    @staticmethod
    @transaction.atomic
    def create_user(dto: RegisterUserDTO):

        if User.objects.filter(phone=dto.phone).exists():
            raise ParseError("Telefone já existe")

        if dto.role not in [
            UserRole.PRODUCER,
            UserRole.TECHNICIAN
        ]:
            raise ParseError("Tipo de usuário inválido")

        if dto.role == UserRole.TECHNICIAN:
            if User.objects.filter(
                professional_register=dto.professional_register
            ).exists():
                raise ParseError("Registro profissional já cadastrado")

        user = User.objects.create(
            name=dto.name,
            phone=dto.phone,
            password_hash=make_password(dto.password),
            is_admin=False,
            role=dto.role,
            professional_register=(
                dto.professional_register
                if dto.role == UserRole.TECHNICIAN
                else None
            ),
            specialty=(
                dto.specialty
                if dto.role == UserRole.TECHNICIAN
                else None
            ),
            status=UserStatus.ACTIVE
        )

        farm = None

        # Técnicos não precisam de uma fazenda cadastrada.
        if dto.role == UserRole.PRODUCER and dto.farm:
            farm = Farm.objects.create(
                user=user,
                name=dto.farm.name,
                state=dto.farm.state,
                location=dto.farm.location,
                municipality=dto.farm.municipality
            )

        return {
            "user": UserService._user_data(user, farm)
        }

    @staticmethod
    def login(dto: LoginDto):

        user = User.objects.filter(phone=dto.phone).first()

        if not user:
            raise ParseError("Telefone ou senha incorretos")

        if not check_password(dto.password, user.password_hash):
            raise ParseError("Telefone ou senha incorretos")

        farm = Farm.objects.filter(user=user).first()

        expiration = datetime.now(UTC) + timedelta(hours=24)

        token = jwt.encode(
            {
                "sub": str(user.id),
                "phone": user.phone,
                "exp": expiration
            },
            config("JWT_SECRET_KEY"),
            algorithm="HS256"
        )

        return {
            "token": token,
            "user": UserService._user_data(user, farm)
        }

    @staticmethod
    @transaction.atomic
    def create_admin(dto):

        if User.objects.filter(phone=dto.phone).exists():
            raise ParseError("Telefone já existe")

        requester = User.objects.filter(
            id=dto.requested_by
        ).first()

        if not requester:
            raise ParseError("Usuário solicitante não encontrado")

        if not requester.is_admin:
            raise ParseError(
                "Apenas administradores podem criar administradores"
            )

        user = User.objects.create(
            name=dto.name,
            phone=dto.phone,
            password_hash=make_password(dto.password),
            is_admin=True,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )

        return {
            "user": UserService._user_data(user)
        }

    @staticmethod
    def list_admins(requested_by):

        requester = User.objects.filter(
            id=requested_by
        ).first()

        if not requester:
            raise ParseError(
                "Usuário solicitante não encontrado"
            )

        if not requester.is_admin:
            raise ParseError(
                "Apenas administradores podem realizar esta operação"
            )

        admins = User.objects.filter(is_admin=True)

        return [
            {
                "id": admin.id,
                "name": admin.name,
                "phone": admin.phone,
                "role": admin.role,
                "status": admin.status
            }
            for admin in admins
        ]

    @staticmethod
    def list_users(requested_by):

        requester = User.objects.filter(
            id=requested_by
        ).first()

        if not requester:
            raise ParseError(
                "Usuário solicitante não encontrado"
            )

        if not requester.is_admin:
            raise ParseError(
                "Apenas administradores podem realizar esta operação"
            )

        users = User.objects.filter(is_admin=False)

        return [
            {
                "id": user.id,
                "name": user.name,
                "phone": user.phone,
                "role": user.role,
                "professional_register": user.professional_register,
                "specialty": user.specialty,
                "status": user.status
            }
            for user in users
        ]

    @staticmethod
    @transaction.atomic
    def change_status(dto):

        requester = User.objects.filter(
            id=dto.requested_by
        ).first()

        if not requester:
            raise ParseError(
                "Usuário solicitante não encontrado"
            )

        if not requester.is_admin:
            raise ParseError(
                "Apenas administradores podem alterar status"
            )

        user = User.objects.filter(
            id=dto.user_id
        ).first()

        if not user:
            raise ParseError("Usuário não encontrado")

        if dto.status not in [
            UserStatus.INACTIVE,
            UserStatus.ACTIVE,
            UserStatus.BLOCKED
        ]:
            raise ParseError("Status inválido")

        if user.status == dto.status:
            raise ParseError("O usuário já possui este status")

        user.status = dto.status
        user.save()

        return {
            "message": "Status atualizado com sucesso."
        }

    @staticmethod
    @transaction.atomic
    def update_user(dto: UpdateUserDTO):

        user = User.objects.filter(id=dto.user_id).first()

        if not user:
            raise ParseError("Usuário não encontrado")

        if dto.name:
            user.name = dto.name

        if dto.phone:
            user.phone = dto.phone

        user.save(update_fields=["name", "phone"])

        farm = Farm.objects.filter(user=user).first()

        if farm:
            if dto.farm_name:
                farm.name = dto.farm_name

            if dto.state:
                farm.state = dto.state

            if dto.location:
                farm.location = dto.location

            if dto.municipality:
                farm.municipality = dto.municipality

            farm.save(
                update_fields=[
                    "name",
                    "state",
                    "location",
                    "municipality"
                ]
            )

        return {
            "message": "Dados cadastrais atualizados com sucesso.",
            "user": UserService._user_data(user, farm)
        }
