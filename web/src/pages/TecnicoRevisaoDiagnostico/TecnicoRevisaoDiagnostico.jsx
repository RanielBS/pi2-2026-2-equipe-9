
import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";
import useAnalysisStore from "../../stores/analysisStore";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import iconMenu from "../../assets/images/icon-menu.png";
import iconPerson from "../../assets/images/icon-person.png";
import "./TecnicoRevisaoDiagnostico.css";

export default function TecnicoRevisaoDiagnostico() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    submitTechnicalReview,
    loading,
    error: storeError,
  } = useAnalysisStore();

  const analiseData = location.state;

  const [menuAberto, setMenuAberto] = useState(false);
  const [parecerTecnico, setParecerTecnico] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [especieSelecionada, setEspecieSelecionada] = useState(
    analiseData?.especieIa || ""
  );
  const [erroLocal, setErroLocal] = useState(null);

  if (!analiseData) {
    return <Navigate to="/fila-tecnico" replace />;
  }

  const handleConfirmar = async () => {
    if (!parecerTecnico.trim()) {
      setErroLocal("Por favor, insira um parecer técnico antes de enviar.");
      return;
    }

    if (modoEdicao && !especieSelecionada.trim()) {
      setErroLocal("Informe a espécie identificada na correção.");
      return;
    }

    setErroLocal(null);

    const payload = {
      status: modoEdicao ? "Corrigido pelo Técnico" : "Confirmado",
      especieFinal: modoEdicao ? especieSelecionada.trim() : null,
      parecerTecnico: parecerTecnico.trim(),
      corrigidoPeloTecnico: modoEdicao,
    };

    try {
      await submitTechnicalReview(analiseData.id, payload);

      alert("Parecer técnico enviado com sucesso ao produtor!");
      navigate("/fila-tecnico");
    } catch (err) {
      console.error("Falha ao enviar revisão técnica:", err);

      const mensagem =
        err.response?.data?.message ||
        "Não foi possível registrar a revisão. Tente novamente.";

      setErroLocal(mensagem);
    }
  };

  if (loading) {
    return <Loading mensagem="A enviar parecer técnico..." />;
  }

  return (
    <div className="revisao-diagnostico-page">
      <header className="tecnico-cabecalho">
        <img
          className="icon-menu-btn"
          src={iconMenu}
          alt="Menu"
          onClick={() => setMenuAberto(true)}
        />

        <img
          className="logo-btn"
          src={logo}
          alt="AnalisaAI"
          onClick={() => navigate("/home")}
        />

        <img
          className="icon-person-btn"
          src={iconPerson}
          alt="Perfil"
          onClick={() => navigate("/editar-perfil")}
        />
      </header>

      <MenuLateral
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <main className="revisao-container">
        <h2 className="revisao-titulo">
          Revisão Técnica de Diagnóstico
        </h2>

        <p className="revisao-subtitulo">
          Produtor: <strong>{analiseData.produtorNome || "--"}</strong>
          {" | "}
          Fazenda: <strong>{analiseData.fazendaNome || "--"}</strong>
          {" | "}
          Data: {analiseData.dataEnvio
            ? new Date(analiseData.dataEnvio).toLocaleDateString("pt-BR")
            : "--"}
        </p>

        {(erroLocal || storeError) && (
          <div
            className="home-erro-banner-pilula"
            style={{
              width: "100%",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <span className="home-erro-icon">!</span>
            <p>{erroLocal || storeError}</p>
          </div>
        )}

        <div className="revisao-grid">
          <div className="card-analisa">
            <h3>Foto Enviada</h3>

            {analiseData.imagemUrl ? (
              <img
                className="foto-preview-revisao"
                src={analiseData.imagemUrl}
                alt="Planta analisada"
              />
            ) : (
              <p>Imagem não disponível.</p>
            )}
          </div>

          <div className="card-analisa">
            <h3>Diagnóstico da IA</h3>

            <div>
              <p style={{ fontSize: "14px", opacity: 0.8 }}>
                Espécie Detectada:
              </p>

              <p className="especie-destaque">
                {analiseData.especieIa || "Não identificada"}
              </p>

              <p className="confianca-badge">
                Nível de Confiança:{" "}
                <strong>
                  {analiseData.confiancaIa != null
                    ? `${analiseData.confiancaIa}%`
                    : "--"}
                </strong>
              </p>
            </div>

            {!modoEdicao ? (
              <button
                type="button"
                className="btn-corrigir-especie"
                onClick={() => setModoEdicao(true)}
              >
                Corrigir Espécie
              </button>
            ) : (
              <div className="box-edicao-especie">
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#e2e8f0",
                  }}
                >
                  Informe a espécie correta:
                </label>

                <input
                  type="text"
                  className="input-busca-especie"
                  value={especieSelecionada}
                  onChange={(e) => setEspecieSelecionada(e.target.value)}
                  placeholder="Digite o nome da espécie..."
                />

                <button
                  type="button"
                  className="btn-corrigir-especie"
                  onClick={() => setModoEdicao(false)}
                  style={{ marginTop: "12px" }}
                >
                  Confirmar espécie
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-analisa" style={{ marginBottom: "24px" }}>
          <h3>Parecer Técnico e Recomendações</h3>

          <textarea
            className="textarea-parecer"
            rows="5"
            value={parecerTecnico}
            onChange={(e) => {
              setParecerTecnico(e.target.value);
              setErroLocal(null);
            }}
            placeholder="Digite as observações técnicas, riscos para o gado, recomendações de manejo e orientações ao produtor..."
          />
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            type="button"
            className="btn-confirmar-envio"
            onClick={handleConfirmar}
            disabled={loading}
          >
            Confirmar e Enviar Diagnóstico
          </button>
        </div>
      </main>
    </div>
  );
}
