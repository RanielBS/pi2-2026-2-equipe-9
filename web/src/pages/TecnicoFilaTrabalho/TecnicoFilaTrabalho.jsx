
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";
import useAnalysisStore from "../../stores/analysisStore";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import "./TecnicoFilaTrabalho.css";

export default function TecnicoFilaTrabalho() {
  const navigate = useNavigate();

  const {
    fetchPendingAnalyses,
    pendingAnalyses,
    loading,
    error,
  } = useAnalysisStore();

  const [menuAberto, setMenuAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    fetchPendingAnalyses();
  }, [fetchPendingAnalyses]);

  const dadosExibicao = pendingAnalyses || [];

  const dadosFiltrados = dadosExibicao.filter((item) => {
    const busca = termoBusca.toLowerCase();

    return (
      (item.produtorNome || "").toLowerCase().includes(busca) ||
      (item.fazendaNome || "").toLowerCase().includes(busca) ||
      (item.especieIa || "").toLowerCase().includes(busca)
    );
  });

  const totalPendentes = dadosExibicao.length;

  if (loading) {
    return <Loading mensagem="A carregar fila de trabalho técnica..." />;
  }

  return (
    <div className="tecnico-fila-page">
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

      <MenuLateral
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <main className="fila-container">
        <div className="fila-header-titulo">
          <h2>Painel do Técnico Agrícola</h2>
          <p>
            Validação de diagnósticos e emissão de pareceres especializados
          </p>
        </div>

        {error && (
          <div className="home-erro-banner-pilula">
            <span className="home-erro-icon">!</span>
            <p>{error}</p>
          </div>
        )}

        <div className="metricas-grid">
          <div className="card-analisa card-metrica">
            <div className="card-metrica-info">
              <span className="card-metrica-label">
                Pendentes na Fila
              </span>
              <span className="card-metrica-valor">
                {totalPendentes}
              </span>
            </div>
          </div>

          <div className="card-analisa card-metrica">
            <div className="card-metrica-info">
              <span className="card-metrica-label">
                Precisão Acumulada IA
              </span>
              <span className="card-metrica-valor">--</span>
            </div>
          </div>

          <div className="card-analisa card-metrica">
            <div className="card-metrica-info">
              <span className="card-metrica-label">
                Concluídas Hoje
              </span>
              <span className="card-metrica-valor">--</span>
            </div>
          </div>
        </div>

        <div className="card-analisa fila-filtros-bar">
          <input
            type="text"
            className="input-busca-fila"
            placeholder="Buscar por produtor, fazenda ou espécie..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        <div className="card-analisa tabela-wrapper">
          <table className="tabela-fila">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produtor</th>
                <th>Fazenda</th>
                <th>Diagnóstico IA</th>
                <th>Confiança</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ação</th>
              </tr>
            </thead>

            <tbody>
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    {error
                      ? "Não foi possível carregar as análises."
                      : termoBusca
                        ? "Nenhuma análise corresponde à busca."
                        : "Não existem análises pendentes de revisão."}
                  </td>
                </tr>
              ) : (
                dadosFiltrados.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.dataEnvio
                        ? new Date(item.dataEnvio).toLocaleDateString("pt-BR")
                        : "--"}
                    </td>

                    <td style={{ fontWeight: 600 }}>
                      {item.produtorNome || "--"}
                    </td>

                    <td>{item.fazendaNome || "--"}</td>

                    <td>{item.especieIa || "--"}</td>

                    <td>
                      <span className="badge-confianca">
                        {item.confiancaIa != null
                          ? `${item.confiancaIa}%`
                          : "--"}
                      </span>
                    </td>

                    <td>
                      <span className="status-pill status-pendente">
                        {item.status || "Pendente"}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn-acao-revisar"
                        onClick={() =>
                          navigate("/revisao-diagnostico", {
                            state: item,
                          })
                        }
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
