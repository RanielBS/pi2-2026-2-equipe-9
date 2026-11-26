import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";
import fotoTeste from "../../assets/images/fototeste.jpeg";
import BotaoVoltarMenu from "../../components/BotaoVoltarMenu";

import "./Retorno.css";
import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";

export default function Retorno() {
  const [menuAberto, setMenuAberto] = useState(false);
  const requisicaoFeita = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [id, user?.id, analysis, fetchAnalysisById]);

  const imagemEnviada = location.state?.imagemUrl || fotoTeste;

  const formatList = (field) => {
    if (!field) return "Não informado";
    if (Array.isArray(field)) return field.length > 0 ? field.join(", ") : "Não informado";
    return field;
  };

  const formatarMensagemErroAmigavel = (erroBruto) => {
    const texto = String(erroBruto || "").toLowerCase();

    if (
      texto.includes("not a plant") ||
      texto.includes("não é uma planta") ||
      texto.includes("nao e uma planta")
    ) {
      return {
        titulo: "A imagem enviada não corresponde a uma planta",
        descricao:
          "Não identificamos nenhuma planta na foto enviada. Por favor, tire uma nova foto focando na folha, flor ou caule da planta.",
      };
    }

    if (
      texto.includes("404") ||
      texto.includes("not found") ||
      texto.includes("request failed") ||
      texto.includes("status code") ||
      texto.includes("não encontrada")
    ) {
      return {
        titulo: "Não foi possível identificar a planta",
        descricao:
          "Não conseguimos reconhecer a planta na imagem enviada ou os dados da análise não estão disponíveis. Tente enviar uma nova foto mais próxima e bem iluminada.",
      };
    }

    return {
      titulo: "Não foi possível concluir a análise",
      descricao:
        "A imagem enviada não pôde ser identificada com segurança. Tente novamente com outra foto da planta.",
    };
  };

  if (loading) {
    return (
      <div className="retorno-page retorno-status">
        <Loading />
        <p>Carregando o resultado da sua análise...</p>
      </div>
    );
  }

  if (error) {
    const infoErro = formatarMensagemErroAmigavel(error);

    return (
      <div className="retorno-page">
        <header className="retorno-header">
          <div className="retorno-cabecalho">
            <button
              type="button"
              className="retorno-menu"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div
              className="retorno-logo"
              onClick={() => navigate("/home")}
              style={{ cursor: "pointer" }}
            >
              <img
                className="retorno-logo-texto"
                src={logoClara}
                alt="AnalisaAI"
              />
            </div>
          </div>
        </header>

        <main className="retorno-erro">
          <h2>{infoErro.titulo}</h2>
          <p>{infoErro.descricao}</p>

          <button
            type="button"
            onClick={() => navigate("/home")}
          >
            Enviar outra foto
          </button>
        </main>

        <MenuLateral
          menuAberto={menuAberto}
          setMenuAberto={setMenuAberto}
        />
      </div>
    );
  }

  if (!analysis || (Array.isArray(analysis) && analysis.length === 0)) {
    return (
      <div className="retorno-page">
        <header className="retorno-header">
          <div className="retorno-cabecalho">
            <button
              type="button"
              className="retorno-menu"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div
              className="retorno-logo"
              onClick={() => navigate("/home")}
              style={{ cursor: "pointer" }}
            >
              <img
                className="retorno-logo-texto"
                src={logoClara}
                alt="AnalisaAI"
              />
            </div>
          </div>
        </header>

        <main className="retorno-erro">
          <h2>Não foi possível identificar a planta</h2>
          <p>
            A imagem enviada não corresponde a uma planta ou não possui nitidez suficiente para identificação. Tente novamente com outra foto.
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
          >
            Enviar outra foto
          </button>
        </main>

        <MenuLateral
          menuAberto={menuAberto}
          setMenuAberto={setMenuAberto}
        />
      </div>
    );
  }

  const rawItem = Array.isArray(analysis) ? analysis[0] : analysis;
  const planta = rawItem?.analysis_result || rawItem || {};

  const commonName = planta.CommonName || planta.common_name || "";
  const scientificName = planta.ScientificName || planta.scientific_name || "";

  const valoresInvalidos = [
    "",
    "não informado",
    "nao informado",
    "unknown",
    "desconhecido",
    "not identified",
    "none",
    "null",
    "n/a",
  ];

  const naoEhPlanta =
    rawItem?.is_plant === false ||
    planta?.is_plant === false ||
    String(commonName).toLowerCase().includes("não é uma planta") ||
    String(commonName).toLowerCase().includes("not a plant");

  const plantaNaoIdentificada =
    valoresInvalidos.includes(String(commonName).trim().toLowerCase()) &&
    valoresInvalidos.includes(String(scientificName).trim().toLowerCase());

  if (naoEhPlanta || plantaNaoIdentificada) {
    return (
      <div className="retorno-page">
        <header className="retorno-header">
          <div className="retorno-cabecalho">
            <button
              type="button"
              className="retorno-menu"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div
              className="retorno-logo"
              onClick={() => navigate("/home")}
              style={{ cursor: "pointer" }}
            >
              <img
                className="retorno-logo-texto"
                src={logoClara}
                alt="AnalisaAI"
              />
            </div>
          </div>
        </header>

        <main className="retorno-erro">
          <h2>
            {naoEhPlanta
              ? "A imagem enviada não corresponde a uma planta"
              : "Não foi possível identificar a planta"}
          </h2>
          <p>
            {naoEhPlanta
              ? "Não detectamos nenhuma planta na foto enviada. Selecione uma imagem que mostre claramente a planta."
              : "A inteligência artificial não conseguiu identificar a espécie com segurança. Tente tirar uma foto mais próxima, focada e com boa iluminação."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
          >
            Enviar outra foto
          </button>
        </main>

        <MenuLateral
          menuAberto={menuAberto}
          setMenuAberto={setMenuAberto}
        />
      </div>
    );
  }

  const nomePopularExibicao = commonName || "Não informado";
  const humanRisks = planta.HumanRisks || planta.human_risks || "Não informado";
  const susceptibleSpecies =
    planta.SusceptibleAnimalSpecies || planta.susceptible_animal_species;
  const commonSymptoms = planta.CommonSymptoms || planta.common_symptoms;
  const recommendedActions =
    planta.RecommendedActions || planta.recommended_actions;

  return (
    <div className="retorno-page">
      <header className="retorno-header">
        <div className="retorno-cabecalho">
          <button
            type="button"
            className="retorno-menu"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            className="retorno-logo"
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer" }}
          >
            <img
              className="retorno-logo-texto"
              src={logoClara}
              alt="AnalisaAI"
            />
          </div>
        </div>
      </header>

      <main className="retorno-conteudo">
        <BotaoVoltarMenu/>
        <h1>Planta detectada</h1>

        <div className="retorno-informacoes">
          <div className="retorno-planta">
            <div className="retorno-imagem">
              <img
                src={imagemEnviada}
                alt={`Foto de ${nomePopularExibicao}`}
              />
            </div>

            {scientificName && (
              <div className="retorno-nome-cientifico">
                <span>Nome científico</span>
                <strong>{scientificName}</strong>
              </div>
            )}
          </div>

          <div className="retorno-coluna">
            <div className="retorno-grupo">
              <span>Nome Popular</span>
              <strong>{nomePopularExibicao}</strong>
            </div>

            <div className="retorno-grupo">
              <span>
                Espécie animal suscetível
                <br />
                a intoxicação
              </span>

              <strong>
                {formatList(susceptibleSpecies)}
              </strong>
            </div>

            <div className="retorno-grupo">
              <span>Riscos para os seres humanos</span>
              <strong>{humanRisks}</strong>
            </div>
          </div>

          <div className="retorno-coluna retorno-coluna-direita">
            <div className="retorno-grupo">
              <span>Sintomas comuns</span>
              <strong>
                {formatList(commonSymptoms)}
              </strong>
            </div>

            <div className="retorno-grupo">
              <span>Ações recomendadas</span>
              <strong>
                {formatList(recommendedActions)}
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