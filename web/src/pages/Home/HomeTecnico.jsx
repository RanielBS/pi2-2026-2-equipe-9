import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "./HeaderPadrao.css";

import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";

import logo from "../../assets/images/Logo-AnalisaAI.png";
import iconSelecionar from "../../assets/images/icon-selecionar.png";

import { toBase64 } from "../../utils/converter";
import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [erroEnvio, setErroEnvio] = useState(null);

  const {
    createAnalysis,
    searchRequestId,
    error: storeError,
  } = useAnalysisStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

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

    if (arquivo) {
      const tipoValido =
        extensoesPermitidas.includes(arquivo.type) ||
        /\.(jpg|jpeg|png|heic|webp|raw)$/i.test(arquivo.name);

      if (!tipoValido) {
        setErroEnvio("O arquivo escolhido não é compatível.");
        setImagemPreview(null);
        setImageBase64("");
        return;
      }

      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
      setErroEnvio(null);
      const urlTemporaria = URL.createObjectURL(arquivo);

      setImagemPreview(urlTemporaria);
      try {
        const base64Converted = await toBase64(arquivo);
        setImageBase64(base64Converted);
      } catch (err) {
        setErroEnvio("O arquivo escolhido não é compatível.");
      }
    }
  };

  const escolherOutraFoto = () => {
    if (imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }
    setImagemPreview(null);
    setImageBase64("");
    setErroEnvio(null);
  };

  const confirmarEnvio = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setErroEnvio("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!imageBase64) {
      setErroEnvio("Por favor, selecione uma imagem válida.");
      return;
    }

    try {
      setCarregando(true);
      setErroEnvio(null);

      const result = await createAnalysis(imageBase64, user.id);
      const activeSearchId = result?.search_request_id || searchRequestId;

      setCarregando(false);

      if (activeSearchId) {
        navigate(`/retorno/${activeSearchId}`, {
          state: {
            imagemUrl: imagemPreview,
          },
        });
      } else {
        setErroEnvio("Não foi possível obter o código de confirmação da análise.");
      }
    } catch (err) {
      console.error("ERRO REAL AO ANALISAR:", err);
      setCarregando(false);
      setErroEnvio(
        storeError || "Ocorreu um erro ao analisar a planta. Tente novamente."
      );
    }
  };

  if (carregando) {
    return <Loading mensagem="Analisando a sua imagem com IA..." />;
  }

  return (
    <div
      className={
        imagemPreview
          ? "home-page modo-confirmacao"
          : "home-page"
      }
    >
      {/* ==================== CABEÇALHO PADRÃO ==================== */}
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

      {/* ==================== MENU LATERAL ==================== */}
      <MenuLateral
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      {/* ==================== CONTEÚDO ==================== */}
      <main>
        <div id="corpo">
          {erroEnvio ? (
            <div className="container-erro-incompativel">
              <div className="home-erro-banner-pilula">
                <span className="home-erro-icon">!</span>
                <p>{erroEnvio}</p>
              </div>

              <p className="subtexto-erro-incompativel">
                Seu arquivo não possui um formato compatível ou pode estar corrompido.<br />
                Tente novamente.
              </p>

              <div className="box-icone-arquivo-erro">
                <div className="icone-documento-invalido">📄</div>
              </div>

              <p className="formatos-aceitos-texto">
                Formatos aceitos: .jpg, .png, .heic, .webp e .raw
              </p>

              <div className="botoes-erro-incompativel">
                <button
                  type="button"
                  className="btn-voltar-home"
                  onClick={() => setErroEnvio(null)}
                >
                  Voltar
                </button>

                <label
                  htmlFor="gerenciadorArquivosErro"
                  className="btn-escolher-novamente"
                  style={{ cursor: "pointer" }}
                >
                  Escolher novamente
                </label>
                <input
                  type="file"
                  id="gerenciadorArquivosErro"
                  accept=".jpg, .jpeg, .png, .heic, .webp, .raw"
                  style={{ display: "none" }}
                  onChange={aoSelecionarFoto}
                />
              </div>
            </div>
          ) : !imagemPreview ? (
            <div id="container-selecao">
              <h2>
                Olá, técnico! Envie uma foto da planta para análise
              </h2>
              <p id="recomendacao">Colabore no desenvolvimento de soluções para a agricultura sustentável</p>

              <div id="selecionar">
                <img
                  id="photo-selection"
                  src={iconSelecionar}
                  alt="Selecionar"
                />

                <input
                  type="file"
                  id="gerenciadorArquivos"
                  accept=".jpg, .jpeg, .png, .heic, .webp, .raw"
                  style={{ display: "none" }}
                  onChange={aoSelecionarFoto}
                />

                <label
                  htmlFor="gerenciadorArquivos"
                  id="arquivo"
                  style={{ cursor: "pointer" }}
                >
                  Selecionar arquivo
                </label>
              </div>

              <div id="recomendacao">
                <div className="bloco">
                  <li>Envie uma foto com iluminação clara</li>
                  <li>Evite fotos tremidas ou fora de foco</li>
                  <li>Garante que a foto não esteja borrada</li>
                </div>

                <div className="bloco">
                  <li>Aproxime a câmera da folha ou da área afetada</li>
                  <li>Mostre apenas uma planta por foto</li>
                  <li>Evite outras plantas ou objetos misturados no fundo</li>
                </div>
              </div>
            </div>
          ) : (
            <div id="container-confirmacao">
              <h2>Confirme o envio da foto</h2>

              <div className="preview-box">
                <img
                  id="preview-foto"
                  src={imagemPreview}
                  alt="Foto selecionada"
                />
              </div>

              <div className="botoes-confirmacao">
                <button
                  type="button"
                  id="btn-confirmar"
                  onClick={confirmarEnvio}
                  disabled={carregando}
                >
                  Enviar
                </button>

                <button
                  type="button"
                  id="btn-alterar"
                  onClick={escolherOutraFoto}
                  disabled={carregando}
                >
                  Escolher outra
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}