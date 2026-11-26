
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models.user_model import User, UserStatus
from analysis.models import (
    SearchRequest,
    PlantAnalysisResult,
    TechnicalReview,
)


class TechnicalReviewRoutesTests(APITestCase):


    def test_nao_permite_correcao_sem_especie_final(self):
        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "A identificação da IA está incorreta.",
                "corrigidoPeloTecnico": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            TechnicalReview.objects.filter(
                search_request=self.analysis
            ).exists()
        )



    def test_usuario_anonimo_nao_acessa_fila(self):
        response = self.client.get(
            reverse("analysis-pending")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_usuario_anonimo_nao_pode_revisar(self):
        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "Tentativa de revisão sem autenticação.",
                "corrigidoPeloTecnico": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertFalse(
            TechnicalReview.objects.filter(
                search_request=self.analysis
            ).exists()
        )


    def setUp(self):
        self.producer = User.objects.create(
            name="Produtor Teste",
            phone="88991111111",
            password_hash="senha123",
            role="produtor",
            status=1,
        )

        self.technician = User.objects.create(
            name="Tecnico Teste",
            phone="88992222222",
            password_hash="senha123",
            role="tecnico",
            status=1,
            approval_status="aprovado",
        )

        self.analysis = SearchRequest.objects.create(
            user=self.producer,
            image="analysis/planta_teste.jpg",
            result_type=SearchRequest.RESULT_COMPLETE,
            status=SearchRequest.STATUS_COMPLETED,
        )

        self.original_result = PlantAnalysisResult.objects.create(
            search_request=self.analysis,
            common_name="Milho",
            scientific_name="Zea mays",
            susceptible_animal_species="Bovinos",
            description="Planta utilizada como alimento.",
            human_risks="Nenhum risco conhecido.",
            common_symptoms="Folhas amareladas.",
            recommended_actions="Avaliar a planta.",
            confidence_score=95.00,
        )

    def test_tecnico_acessa_fila_pendente(self):
        self.client.force_authenticate(user=self.technician)

        response = self.client.get(
            reverse("analysis-pending")
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["especieIa"], "Milho")

    def test_produtor_nao_acessa_fila(self):
        self.client.force_authenticate(user=self.producer)

        response = self.client.get(
            reverse("analysis-pending")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_tecnico_pendente_nao_acessa_fila(self):
        self.technician.approval_status = "pendente"
        self.technician.save()

        self.client.force_authenticate(user=self.technician)

        response = self.client.get(
            reverse("analysis-pending")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_tecnico_pendente_nao_pode_revisar(self):
        self.technician.approval_status = "pendente"
        self.technician.save()

        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "Tentativa de revisão.",
                "corrigidoPeloTecnico": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertFalse(
            TechnicalReview.objects.filter(
                search_request=self.analysis
            ).exists()
        )

    def test_tecnico_inativo_nao_pode_revisar(self):
        self.technician.status = UserStatus.INACTIVE
        self.technician.save()

        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "Tentativa de revisão.",
                "corrigidoPeloTecnico": False,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertFalse(
            TechnicalReview.objects.filter(
                search_request=self.analysis
            ).exists()
        )

    def test_tecnico_confirma_diagnostico(self):
        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "Diagnóstico da IA confirmado.",
                "corrigidoPeloTecnico": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        review = TechnicalReview.objects.get(
            search_request=self.analysis
        )

        self.assertFalse(review.was_corrected)
        self.assertEqual(
            review.technical_opinion,
            "Diagnóstico da IA confirmado.",
        )
        self.assertEqual(self.original_result.common_name, "Milho")

    def test_tecnico_corrige_diagnostico(self):
        self.client.force_authenticate(user=self.technician)

        response = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "Capim-colonião",
                "parecerTecnico": "A identificação original estava incorreta.",
                "corrigidoPeloTecnico": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        review = TechnicalReview.objects.get(
            search_request=self.analysis
        )

        self.assertTrue(review.was_corrected)
        self.assertEqual(review.final_species, "Capim-colonião")

        # O resultado original da IA deve continuar preservado.
        self.assertEqual(self.original_result.common_name, "Milho")

    def test_analise_nao_pode_ser_revisada_duas_vezes(self):
        self.client.force_authenticate(user=self.technician)

        dados_revisao = {
            "especieFinal": "",
            "parecerTecnico": "Diagnóstico confirmado.",
            "corrigidoPeloTecnico": False,
        }

        primeira_resposta = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            dados_revisao,
            format="json",
        )

        segunda_resposta = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            dados_revisao,
            format="json",
        )

        self.assertEqual(
            primeira_resposta.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            segunda_resposta.status_code,
            status.HTTP_409_CONFLICT,
        )

        self.assertEqual(
            TechnicalReview.objects.filter(
                search_request=self.analysis
            ).count(),
            1,
        )

    def test_analise_revisada_nao_aparece_na_fila(self):
        self.client.force_authenticate(user=self.technician)

        # Primeiro, o técnico confirma o diagnóstico.
        resposta_revisao = self.client.patch(
            reverse(
                "analysis-review",
                kwargs={"pk": self.analysis.id},
            ),
            {
                "especieFinal": "",
                "parecerTecnico": "Diagnóstico confirmado.",
                "corrigidoPeloTecnico": False,
            },
            format="json",
        )

        self.assertEqual(
            resposta_revisao.status_code,
            status.HTTP_200_OK,
        )

        # Depois, consulta novamente a fila.
        response = self.client.get(
            reverse("analysis-pending")
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
