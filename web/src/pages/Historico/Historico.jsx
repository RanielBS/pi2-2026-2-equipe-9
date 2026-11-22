import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MenuLateral from "../MenuLateral/MenuLateral";
import CardPlanta from "../../components/CardPlanta";
import Loading from "../../components/Loading";

import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";

import "./Historico.css";

export default function Historico() {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const {
    analysisHistory,
    loading,
    error,
    fetchAnalysisHistory,
  } = useAnalysisStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchAnalysisHistory(user.id);
    }
  }, [user?.id]);

  return (
    <div className="historico-page">
      {/* CABEÇALHO PADRÃO */}
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
            <img src={logoClara} alt="AnalisaAI" />
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="historico-conteudo">
        <h1>Histórico</h1>

        {loading && (
          <div className="historico-status">
            <Loading />
          </div>
        )}

        {!loading && error && (
          <div className="historico-status historico-erro">
            <p>Erro ao carregar histórico: {error}</p>
          </div>
        )}

        {!loading && !error && analysisHistory.length === 0 && (
          <div className="historico-status">
            <p>Nenhuma análise realizada ainda</p>
          </div>
        )}

        {!loading && !error && analysisHistory.length > 0 && (
          <div className="historico-listagem">
            {analysisHistory.map((planta) => (
              <CardPlanta
                key={planta.search_request_id}
                imagem={planta.image}
                nome={planta.analysis_result?.common_name}
                descricao={planta.analysis_result?.Description}
                rotaLink={`/resultado/${planta.search_request_id}`}
              />
            ))}
          </div>
        )}
      </main>

      <MenuLateral
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />
    </div>
  );
}