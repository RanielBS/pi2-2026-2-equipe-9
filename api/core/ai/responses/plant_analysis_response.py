
from dataclasses import dataclass
import json
from typing import List

from .plant_analysis_result import PlantAnalysisResult


class InvalidPlantAnalysisResponse(Exception):
    """Indica que a resposta da IA possui formato inválido."""


@dataclass
class PlantAnalysisResponse:
    ResultType: int
    ResponseContent: str
    ErrorMessage: str
    AnalysisResults: List[PlantAnalysisResult]

    @classmethod
    def from_json(cls, json_text: str):
        if not isinstance(json_text, str) or not json_text.strip():
            raise InvalidPlantAnalysisResponse(
                "A resposta da IA está vazia."
            )

        try:
            data = json.loads(json_text)
        except json.JSONDecodeError as ex:
            raise InvalidPlantAnalysisResponse(
                "A resposta da IA não contém um JSON válido."
            ) from ex

        if not isinstance(data, dict):
            raise InvalidPlantAnalysisResponse(
                "A resposta da IA deve ser um objeto JSON."
            )

        campos_obrigatorios = [
            "ResultType",
            "ErrorMessage",
            "AnalysisResults",
        ]

        for campo in campos_obrigatorios:
            if campo not in data:
                raise InvalidPlantAnalysisResponse(
                    f"Campo obrigatório ausente: {campo}."
                )

        result_type = data["ResultType"]

        if (
            not isinstance(result_type, int)
            or isinstance(result_type, bool)
            or result_type not in [0, 1, 3]
        ):
            raise InvalidPlantAnalysisResponse(
                "ResultType deve ser 0, 1 ou 3."
            )

        error_message = data["ErrorMessage"]

        if not isinstance(error_message, str):
            raise InvalidPlantAnalysisResponse(
                "ErrorMessage deve ser um texto."
            )

        analysis_results = data["AnalysisResults"]

        if not isinstance(analysis_results, list):
            raise InvalidPlantAnalysisResponse(
                "AnalysisResults deve ser uma lista."
            )

        if result_type == 0 and len(analysis_results) != 1:
            raise InvalidPlantAnalysisResponse(
                "Uma análise completa deve possuir exatamente um resultado."
            )

        if result_type == 1 and not 2 <= len(analysis_results) <= 3:
            raise InvalidPlantAnalysisResponse(
                "Uma análise parcial deve possuir entre dois e três resultados."
            )

        if result_type == 3 and len(analysis_results) != 0:
            raise InvalidPlantAnalysisResponse(
                "Uma análise não identificada não deve possuir resultados."
            )

        if result_type in [0, 1] and error_message:
            raise InvalidPlantAnalysisResponse(
                "ErrorMessage deve estar vazio em análises completas ou parciais."
            )

        if result_type == 3 and not error_message.strip():
            raise InvalidPlantAnalysisResponse(
                "ErrorMessage deve ser preenchido quando a planta não for identificada."
            )

        resultados = []

        for indice, item in enumerate(analysis_results):
            try:
                resultado = PlantAnalysisResult.from_dict(item)
            except InvalidPlantAnalysisResponse as ex:
                raise InvalidPlantAnalysisResponse(
                    f"Resultado de índice {indice} inválido: {ex}"
                ) from ex

            resultados.append(resultado)

        if result_type == 0 and resultados[0].ConfidenceScore < 80:
            raise InvalidPlantAnalysisResponse(
                "Uma análise completa deve possuir confiança igual ou superior a 80."
            )

        return cls(
            ResponseContent=json_text,
            ResultType=result_type,
            ErrorMessage=error_message,
            AnalysisResults=resultados
        )
