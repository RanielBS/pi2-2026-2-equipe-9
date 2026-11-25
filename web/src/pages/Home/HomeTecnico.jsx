import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MenuLateral from "../MenuLateral/MenuLateral";
import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";
import { toBase64 } from "../../utils/converter";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";
import "../Home/HeaderPadrao.css";
import "../Home/Home.css";
import "../Cadastro/Cadastrar.css";

export default function HomeTecnico() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { fetchPendingAnalyses } = useAnalysisStore();

  useEffect(() => {
    if (typeof fetchPendingAnalyses === "function") {
      fetchPendingAnalyses();
    }
  }, [fetchPendingAnalyses]);

  const extensoesPermitidas = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/webp",
    "image/raw",
  ];

  const aoSelecionarFoto = async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const tipoValido =
      extensoesPermitidas.includes(arquivo.type) ||
      /\.(jpg|jpeg|png|heic|webp|raw)$/i.test(arquivo.name);

    if (!tipoValido) {
      setErroEnvio("Formato inválido. Escolha JPG, PNG, HEIC, WEBP ou RAW.");
      setImagemPreview(null);
      setImageBase64("");
      return;
    }

    if (imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }

    setErroEnvio("");
    setImagemPreview(URL.createObjectURL(arquivo));

    try {
      const base64Converted = await toBase64(arquivo);
      setImageBase64(base64Converted);
    } catch {
      setErroEnvio("Não foi possível processar a imagem selecionada.");
    }
  };

  return (
    <div className="home-page">
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

          <div className="logo-padrao" onClick={() => navigate("/homeTecnico")}>
            <img src={logoClara} alt="AnalisaAI" />
          </div>
        </div>
      </header>

      <MenuLateral menuAberto={menuAberto} setMenuAberto={setMenuAberto} />

      <main>
        <div id="corpo">
          <div id="container-selecao">
            <h2 id="bem-vindo">
              Olá, {user?.name || "Técnico"}, seja bem-vindo ao AnalisaAI!
              Cadastre as informações de uma nova planta.
            </h2>

            <p id="subtitulo">
              Contribua para a melhoria da análise de plantas, revisando os
              diagnósticos pendentes ou enviando novos registros.
            </p>

            <div id="fotoselecionar">
            {erroEnvio && (
              <div
                className="home-erro-banner-pilula"
                style={{ marginBottom: "16px" }}
              >
                <span className="home-erro-icon">!</span>
                <p>{erroEnvio}</p>
              </div>
            )}

            {imagemPreview && (
              <div>
                <img src={imagemPreview} alt="Imagem selecionada" />
              </div>
            )}
            
            <input
              type="file"
              id="gerenciadorArquivos"
              accept=".jpg, .jpeg, .png, .heic, .webp, .raw"
              style={{ display: "none" }}
              onChange={aoSelecionarFoto}
            />

            <label htmlFor="gerenciadorArquivos" id="arquivo">
              {imagemPreview ? "Trocar arquivo" : "Enviar a foto da planta"}
            </label>
            </div>
            
            <div id="submit-info">
            <form>
              <div className="campo">
                <label>Nome cientifico</label>
                <input type="text" placeholder="Digite o nome cientifico"/>
              </div>

              <div className="campo">
                <label>Nome popular</label>
                <input type="text" placeholder="Digite o nome popular"/>
              </div>

              <div className="campo">
                <label>Sintomas</label>
                <input type="text"/>
              </div>

              <button type="submit" id="btn-enviar">Salvar planta</button>
            </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
