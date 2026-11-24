
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class PlantAnalysisResult:
    CommonName: str
    ScientificName: str
    SusceptibleAnimalSpecies: Optional[List[str]]
    HumanRisks: str
    Description: str
    CommonSymptoms: List[str]
    RecommendedActions: List[str]
    ConfidenceScore: int

    @classmethod
    def from_dict(cls, data):
        from .plant_analysis_response import InvalidPlantAnalysisResponse

        if not isinstance(data, dict):
            raise InvalidPlantAnalysisResponse(
                "O resultado da planta deve ser um objeto."
            )

        campos_texto = [
            "CommonName",
            "ScientificName",
            "HumanRisks",
            "Description",
        ]

        campos_lista = [
            "CommonSymptoms",
            "RecommendedActions",
        ]

        campos_obrigatorios = (
            campos_texto
            + campos_lista
            + ["SusceptibleAnimalSpecies", "ConfidenceScore"]
        )

        for campo in campos_obrigatorios:
            if campo not in data:
                raise InvalidPlantAnalysisResponse(
                    f"Campo obrigatório ausente: {campo}."
                )

        for campo in campos_texto:
            if not isinstance(data[campo], str):
                raise InvalidPlantAnalysisResponse(
                    f"O campo {campo} deve ser um texto."
                )

        for campo in campos_lista:
            if (
                not isinstance(data[campo], list)
                or not all(isinstance(item, str) for item in data[campo])
            ):
                raise InvalidPlantAnalysisResponse(
                    f"O campo {campo} deve ser uma lista de textos."
                )

        especies = data["SusceptibleAnimalSpecies"]

        if especies is not None and (
            not isinstance(especies, list)
            or not all(isinstance(item, str) for item in especies)
        ):
            raise InvalidPlantAnalysisResponse(
                "SusceptibleAnimalSpecies deve ser uma lista de textos ou null."
            )

        confianca = data["ConfidenceScore"]

        if (
            not isinstance(confianca, int)
            or isinstance(confianca, bool)
            or not 0 <= confianca <= 100
        ):
            raise InvalidPlantAnalysisResponse(
                "ConfidenceScore deve ser um inteiro entre 0 e 100."
            )

        return cls(**data)
