from rest_framework import serializers


class TechnicalReviewSerializer(serializers.Serializer):
    status = serializers.CharField(required=False)
    especieFinal = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )
    parecerTecnico = serializers.CharField(
        required=True,
        allow_blank=False
    )
    corrigidoPeloTecnico = serializers.BooleanField(required=True)

    def validate(self, attrs):
        if attrs["corrigidoPeloTecnico"] and not attrs.get("especieFinal"):
            raise serializers.ValidationError({
                "especieFinal": "Informe a espécie identificada na correção."
            })

        return attrs