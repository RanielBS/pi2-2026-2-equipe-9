import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import "./Resultado.css";

import MenuLateral from "../MenuLateral/MenuLateral";
import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";
import Loading from "../../components/Loading";

import logo from "../../assets/images/Logo-AnalisaAI.png";

export default function Resultado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const requisicaoFeita = useRef(null);

  const {
    analysis,
    loading,
    error,
    fetchAnalysisById,
  } = useAnalysisStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (!id || !user?.id) return;

    const rawItem = Array.isArray(analysis) ? analysis[0] : analysis;
    const jaCarregado =
      rawItem && String(rawItem.search_request_id || rawItem.id) === String(id);

    if (jaCarregado) return;

    if (requisicaoFeita.current === id) return;
    requisicaoFeita.current = id;

    fetchAnalysisById(id, user.id);
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="resultado-page resultado-status">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="resultado-page resultado-status">
        <p>Erro ao carregar análise: {error}</p>

        <button
          type="button"
          onClick={() => navigate("/historico")}
        >
          Voltar ao Histórico
        </button>
      </div>
    );
  }

  if (!analysis || (Array.isArray(analysis) && analysis.length === 0)) {
    return (
      <div className="resultado-page resultado-status">
        <p>Nenhuma informação encontrada para esta planta.</p>

        <button
          type="button"
          onClick={() => navigate("/historico")}
        >
          Voltar ao Histórico
        </button>
      </div>
    );
  }

  const rawItem = Array.isArray(analysis) ? analysis[0] : analysis;
  const planta = rawItem?.analysis_result || rawItem || {};

  const commonName = planta.CommonName || planta.common_name || "Não informado";
  const scientificName = planta.ScientificName || planta.scientific_name;
  const description = planta.Description || planta.description || "Não informado";
  const humanRisks = planta.HumanRisks || planta.human_risks || "Não informado";
  const susceptibleSpecies = planta.SusceptibleAnimalSpecies || planta.susceptible_animal_species;
  const commonSymptoms = planta.CommonSymptoms || planta.common_symptoms;
  const recommendedActions = planta.RecommendedActions || planta.recommended_actions;
  const imageUrl = rawItem?.image || planta.image;

  return (
    <div className="resultado-page">
      <header className="cabecalho-padrao">
        <div className="cabecalho-padrao-esquerda">
          <button
            type="button"
            className="botao-menu-padrao"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            className="logo-padrao"
            onClick={() => navigate("/home")}
          >
            <img src={logo} alt="AnalisaAI" />
          </div>
        </div>
      </header>

      <main className="resultado-conteudo">
        <button
          type="button"
          className="resultado-voltar"
          onClick={() => navigate("/historico")}
        >
          ← Voltar ao Histórico
        </button>

        <h1>Detalhes da Planta</h1>

        <div className="resultado-informacoes">
          <div className="resultado-planta">
            <div className="resultado-foto">
              <img
                src={imageUrl}
                alt={commonName}
              />
            </div>

            {scientificName && (
              <div className="resultado-cientifico">
                <span>Nome científico</span>
                <strong>{scientificName}</strong>
              </div>
            )}
          </div>

          <div className="resultado-coluna">
            <div className="resultado-grupo">
              <span>Nome Popular</span>
              <strong>{commonName}</strong>
            </div>

            <div className="resultado-grupo">
              <span>Descrição</span>
              <strong>{description}</strong>
            </div>

            <div className="resultado-grupo">
              <span>
                Espécies suscetíveis à intoxicação
              </span>

              <strong>
                {Array.isArray(susceptibleSpecies)
                  ? susceptibleSpecies.join(", ")
                  : susceptibleSpecies || "Não informado"}
              </strong>
            </div>
          </div>

          <div className="resultado-coluna">
            <div className="resultado-grupo">
              <span>Riscos para os seres humanos</span>
              <strong>{humanRisks}</strong>
            </div>

            <div className="resultado-grupo">
              <span>Sintomas comuns</span>

              <strong>
                {Array.isArray(commonSymptoms)
                  ? commonSymptoms.join(", ")
                  : commonSymptoms || "Não informado"}
              </strong>
            </div>

            <div className="resultado-grupo">
              <span>Ações recomendadas</span>

              <strong>
                {Array.isArray(recommendedActions)
                  ? recommendedActions.join(", ")
                  : recommendedActions || "Não informado"}
              </strong>
            </div>
          </div>
        </div>
      </main>

      <MenuLateral
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />
    </div>
  );
}