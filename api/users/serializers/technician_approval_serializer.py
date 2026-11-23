
from rest_framework import serializers

from users.models.user_model import TechnicianApprovalStatus


class ReviewTechnicianSerializer(serializers.Serializer):
    approval_status = serializers.ChoiceField(
        choices=[
            TechnicianApprovalStatus.APPROVED,
            TechnicianApprovalStatus.REJECTED
        ],
        required=True
    )


class TechnicianApprovalAuthoritySerializer(serializers.Serializer):
    can_approve_technicians = serializers.BooleanField(
        required=True
    )
