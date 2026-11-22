
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";
import useAnalysisStore from "../../stores/analysisStore";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import iconMenu from "../../assets/images/icon-menu.png";
import iconPerson from "../../assets/images/icon-person.png";
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
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  useEffect(() => {
    fetchPendingAnalyses();
  }, [fetchPendingAnalyses]);

  const dadosExibicao = pendingAnalyses || [];

  const dadosFiltrados = dadosExibicao.filter((item) => {
    const textoMatch =
      (item.produtorNome || "").toLowerCase().includes(termoBusca.toLowerCase()) ||
      (item.fazendaNome || "").toLowerCase().includes(termoBusca.toLowerCase()) ||
      (item.especieIa || "").toLowerCase().includes(termoBusca.toLowerCase());

    const statusMatch =
      filtroStatus === "TODOS" ||
      (filtroStatus === "PENDENTES" && item.status === "Pendente") ||
      (filtroStatus === "REVISADOS" && item.status !== "Pendente");

    return textoMatch && statusMatch;
  });

  const totalPendentes = dadosExibicao.filter(
    (item) => item.status === "Pendente"
  ).length;

  if (loading) {
    return <Loading mensagem="A carregar fila de trabalho técnica..." />;
  }

  return (
    <div className="tecnico-fila-page">
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
              <span className="card-metrica-label">Pendentes na Fila</span>
              <span className="card-metrica-valor">{totalPendentes}</span>
            </div>
          </div>

          <div className="card-analisa card-metrica">
            <div className="card-metrica-info">
              <span className="card-metrica-label">Precisão Acumulada IA</span>
              <span className="card-metrica-valor">--</span>
            </div>
          </div>

          <div className="card-analisa card-metrica">
            <div className="card-metrica-info">
              <span className="card-metrica-label">Concluídas Hoje</span>
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

          <div className="botoes-filtro-status">
            <button
              type="button"
              className={`btn-filtro ${filtroStatus === "TODOS" ? "ativo" : ""}`}
              onClick={() => setFiltroStatus("TODOS")}
            >
              Todos
            </button>

            <button
              type="button"
              className={`btn-filtro ${filtroStatus === "PENDENTES" ? "ativo" : ""}`}
              onClick={() => setFiltroStatus("PENDENTES")}
            >
              Pendentes
            </button>

            <button
              type="button"
              className={`btn-filtro ${filtroStatus === "REVISADOS" ? "ativo" : ""}`}
              onClick={() => setFiltroStatus("REVISADOS")}
            >
              Revisados
            </button>
          </div>
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
                  <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                    {error
                      ? "Não foi possível carregar as análises."
                      : "Nenhuma análise pendente encontrada."}
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
                        {item.confiancaIa ?? "--"}
                        {item.confiancaIa != null ? "%" : ""}
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
                          navigate("/revisao-diagnostico", { state: item })
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
