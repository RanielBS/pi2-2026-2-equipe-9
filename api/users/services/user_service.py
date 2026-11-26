
from datetime import UTC, datetime, timedelta

import jwt
from decouple import config
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from rest_framework.exceptions import ParseError, PermissionDenied

from users.dtos.login_dto import LoginDto
from users.dtos.register_user_dto import RegisterUserDTO
from users.dtos.update_user_dto import UpdateUserDTO
from users.models.farm_model import Farm
from users.models.technician_profile_model import TechnicianProfile
from users.models.user_model import (
    User,
    UserRole,
    UserStatus,
    TechnicianApprovalStatus
)


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
    def _technician_profile_data(profile):
        if not profile:
            return None

        return {
            "technician_type": profile.technician_type,
            "is_professor": profile.is_professor,
            "institution": profile.institution,
            "course": profile.course,
            "qualification_description": profile.qualification_description
        }

    @staticmethod
    def _user_data(user, farm=None):
        profile = getattr(user, "technician_profile", None)

        return {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "is_admin": user.is_admin,
            "role": user.role,
            "professional_register": user.professional_register,
            "specialty": user.specialty,
            "status": user.status,
            "approval_status": user.approval_status,
            "can_approve_technicians": user.can_approve_technicians,
            "farm": UserService._farm_data(farm),
            "technician_profile": UserService._technician_profile_data(profile)
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
            if dto.professional_register and User.objects.filter(
                professional_register=dto.professional_register
            ).exists():
                raise ParseError("Registro profissional já cadastrado")

        approval_status = (
            TechnicianApprovalStatus.PENDING
            if dto.role == UserRole.TECHNICIAN
            else TechnicianApprovalStatus.NOT_REQUIRED
        )

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
            status=UserStatus.ACTIVE,
            approval_status=approval_status,
            can_approve_technicians=False
        )

        if dto.role == UserRole.TECHNICIAN:
            TechnicianProfile.objects.create(
                user=user,
                technician_type=dto.technician_type,
                is_professor=dto.is_professor,
                institution=dto.institution or "",
                course=dto.course or "",
                qualification_description=(
                    dto.qualification_description or ""
                )
            )

        farm = None

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

        if dto.login_identifier:
            user = User.objects.filter(
                login_identifier=dto.login_identifier,
                role=UserRole.ADMIN,
                is_admin=True
            ).first()

            mensagem_erro = "Identificador ou senha incorretos"

        elif dto.phone:
            user = User.objects.filter(
                phone=dto.phone,
                role__in=[
                    UserRole.PRODUCER,
                    UserRole.TECHNICIAN
                ],
                is_admin=False
            ).first()

            mensagem_erro = "Telefone ou senha incorretos"

        else:
            raise ParseError("Informe telefone ou identificador.")

        if not user:
            raise ParseError(mensagem_erro)

        if not check_password(dto.password, user.password_hash):
            raise ParseError(mensagem_erro)

        if user.status != UserStatus.ACTIVE:
            raise ParseError("Esta conta está inativa ou bloqueada.")

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

        login_identifier = dto.login_identifier.strip().lower()

        if User.objects.filter(
            login_identifier=login_identifier
        ).exists():
            raise ParseError("Identificador administrativo já existe")

        requester = User.objects.filter(
            id=dto.requested_by
        ).first()

        if not requester:
            raise ParseError("Usuário solicitante não encontrado")

        if (
            not requester.is_admin
            or requester.role != UserRole.ADMIN
            or requester.status != UserStatus.ACTIVE
        ):
            raise ParseError(
                "Apenas administradores ativos podem criar administradores"
            )

        user = User.objects.create(
            name=dto.name,
            phone=None,
            login_identifier=login_identifier,
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

        if not requester.is_admin or requester.status != UserStatus.ACTIVE:
            raise ParseError(
                "Apenas administradores ativos podem realizar esta operação"
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

        if not requester.is_admin or requester.status != UserStatus.ACTIVE:
            raise ParseError(
                "Apenas administradores ativos podem realizar esta operação"
            )

        users = User.objects.filter(
            is_admin=False
        ).select_related(
            "technician_profile"
        ).order_by("id")

        result = []

        for user in users:
            farm = None

            if user.role == UserRole.PRODUCER:
                farm = Farm.objects.filter(user=user).first()

            result.append({
                "id": user.id,
                "name": user.name,
                "phone": user.phone,
                "is_admin": user.is_admin,
                "role": user.role,
                "professional_register": user.professional_register,
                "specialty": user.specialty,
                "status": user.status,
                "approval_status": user.approval_status,
                "can_approve_technicians": user.can_approve_technicians,
                "farm": UserService._farm_data(farm),
                "technician_profile": UserService._technician_profile_data(
                    getattr(user, "technician_profile", None)
                )
            })

        return result

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

        if not requester.is_admin or requester.status != UserStatus.ACTIVE:
            raise ParseError(
                "Apenas administradores ativos podem alterar status"
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

    @staticmethod
    def _can_approve_technicians(user):

        if user.status != UserStatus.ACTIVE:
            return False

        if user.is_admin:
            return True

        return (
            user.role == UserRole.TECHNICIAN
            and user.approval_status == TechnicianApprovalStatus.APPROVED
            and user.can_approve_technicians
        )

    @staticmethod
    def list_pending_technicians(requester):

        if not UserService._can_approve_technicians(requester):
            raise PermissionDenied(
                "Você não tem permissão para aprovar técnicos."
            )

        technicians = User.objects.filter(
            role=UserRole.TECHNICIAN,
            approval_status=TechnicianApprovalStatus.PENDING
        ).select_related(
            "technician_profile"
        ).order_by("id")

        result = []

        for technician in technicians:
            result.append({
                "id": technician.id,
                "name": technician.name,
                "phone": technician.phone,
                "professional_register": technician.professional_register,
                "specialty": technician.specialty,
                "status": technician.status,
                "approval_status": technician.approval_status,
                "can_approve_technicians": technician.can_approve_technicians,
                "technician_profile": UserService._technician_profile_data(
                    getattr(technician, "technician_profile", None)
                )
            })

        return result

    @staticmethod
    @transaction.atomic
    def review_technician(requester, user_id, approval_status):

        if not UserService._can_approve_technicians(requester):
            raise PermissionDenied(
                "Você não tem permissão para aprovar técnicos."
            )

        if approval_status not in [
            TechnicianApprovalStatus.APPROVED,
            TechnicianApprovalStatus.REJECTED
        ]:
            raise ParseError("Situação de aprovação inválida.")

        technician = User.objects.filter(
            id=user_id,
            role=UserRole.TECHNICIAN
        ).first()

        if not technician:
            raise ParseError("Técnico não encontrado.")

        if technician.approval_status != TechnicianApprovalStatus.PENDING:
            raise ParseError(
                "Este técnico não está aguardando aprovação."
            )

        technician.approval_status = approval_status

        technician.save(update_fields=["approval_status"])

        return {
            "message": "Situação de aprovação atualizada com sucesso.",
            "user_id": technician.id,
            "approval_status": technician.approval_status
        }

    @staticmethod
    @transaction.atomic
    def set_technician_approval_authority(
        requester,
        user_id,
        can_approve
    ):

        if (
            requester.status != UserStatus.ACTIVE
            or not requester.is_admin
        ):
            raise PermissionDenied(
                "Somente administradores ativos podem conceder ou retirar "
                "a autoridade de aprovação."
            )

        if not isinstance(can_approve, bool):
            raise ParseError(
                "A permissão deve ser informada como verdadeiro ou falso."
            )

        technician = User.objects.filter(
            id=user_id,
            role=UserRole.TECHNICIAN
        ).first()

        if not technician:
            raise ParseError("Técnico não encontrado.")

        if technician.approval_status != TechnicianApprovalStatus.APPROVED:
            raise ParseError(
                "A autoridade só pode ser concedida a técnicos aprovados."
            )

        technician.can_approve_technicians = can_approve

        technician.save(update_fields=["can_approve_technicians"])

        return {
            "message": "Autoridade de aprovação atualizada com sucesso.",
            "user_id": technician.id,
            "can_approve_technicians": technician.can_approve_technicians
        }
