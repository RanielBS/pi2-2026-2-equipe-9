
import json

from django.test import SimpleTestCase

from core.ai.responses.plant_analysis_response import (
    PlantAnalysisResponse,
    InvalidPlantAnalysisResponse,
)


class PlantAnalysisResponseTests(SimpleTestCase):

    def criar_resultado(
        self,
        nome="Mamona",
        confianca=95,
        especies=None
    ):
        if especies is None:
            especies = ["Bovinos"]

        return {
            "CommonName": nome,
            "ScientificName": "Ricinus communis",
            "SusceptibleAnimalSpecies": especies,
            "HumanRisks": "Pode causar intoxicação.",
            "Description": "Planta tóxica.",
            "CommonSymptoms": ["Vômito", "Diarreia"],
            "RecommendedActions": ["Procurar atendimento veterinário."],
            "ConfidenceScore": confianca,
        }

    def criar_json(self, result_type, resultados, mensagem=""):
        return json.dumps({
            "ResultType": result_type,
            "ErrorMessage": mensagem,
            "AnalysisResults": resultados,
        })

    def test_aceita_analise_completa_valida(self):
        dados = self.criar_json(
            0,
            [self.criar_resultado()]
        )

        resposta = PlantAnalysisResponse.from_json(dados)

        self.assertEqual(resposta.ResultType, 0)
        self.assertEqual(len(resposta.AnalysisResults), 1)
        self.assertEqual(
            resposta.AnalysisResults[0].ConfidenceScore,
            95
        )

    def test_aceita_analise_parcial_valida(self):
        resultados = [
            self.criar_resultado("Mamona", 70),
            self.criar_resultado("Pinhão-roxo", 65),
        ]

        dados = self.criar_json(1, resultados)

        resposta = PlantAnalysisResponse.from_json(dados)

        self.assertEqual(resposta.ResultType, 1)
        self.assertEqual(len(resposta.AnalysisResults), 2)

    def test_aceita_planta_nao_identificada(self):
        dados = self.criar_json(
            3,
            [],
            "Não foi possível identificar a planta."
        )

        resposta = PlantAnalysisResponse.from_json(dados)

        self.assertEqual(resposta.ResultType, 3)
        self.assertEqual(len(resposta.AnalysisResults), 0)
        self.assertTrue(resposta.ErrorMessage)

    def test_rejeita_json_invalido(self):
        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json("{json inválido")

    def test_rejeita_resposta_vazia(self):
        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json("")

    def test_rejeita_result_type_invalido(self):
        dados = self.criar_json(4, [])

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)

    def test_rejeita_analise_completa_sem_resultado(self):
        dados = self.criar_json(0, [])

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)

    def test_rejeita_analise_completa_com_confianca_abaixo_de_80(self):
        dados = self.criar_json(
            0,
            [self.criar_resultado(confianca=79)]
        )

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)

    def test_rejeita_analise_parcial_com_apenas_um_resultado(self):
        dados = self.criar_json(
            1,
            [self.criar_resultado()]
        )

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)

    def test_rejeita_analise_nao_identificada_com_resultados(self):
        dados = self.criar_json(
            3,
            [self.criar_resultado()],
            "Não foi possível identificar."
        )

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)

    def test_aceita_especies_suscetiveis_com_valor_null(self):
        resultado = self.criar_resultado()
        resultado["SusceptibleAnimalSpecies"] = None

        dados = self.criar_json(
            0,
            [resultado]
        )

        resposta = PlantAnalysisResponse.from_json(dados)

        self.assertIsNone(
            resposta.AnalysisResults[0].SusceptibleAnimalSpecies
        )

    def test_rejeita_campo_obrigatorio_ausente(self):
        resultado = self.criar_resultado()
        del resultado["ScientificName"]

        dados = self.criar_json(0, [resultado])

        with self.assertRaises(InvalidPlantAnalysisResponse):
            PlantAnalysisResponse.from_json(dados)
