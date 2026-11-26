import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import MenuLateral from "../MenuLateral/MenuLateral";
import useAnalysisStore from "../../stores/analysisStore";
import useAuthStore from "../../stores/authStore";
import { toBase64 } from "../../utils/converter";
import api from "../../api/api";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";
import "../Home/HeaderPadrao.css";
import "../Home/Home.css";
import "../Cadastro/Cadastrar.css";

const LIMITE_NOME_CIENTIFICO = 50;
const LIMITE_NOME_POPULAR = 50;
const LIMITE_SINTOMAS = 150;
const TAMANHO_MAX_MB = 10;

export default function HomeTecnico() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [sucessoEnvio, setSucessoEnvio] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [nomeCientifico, setNomeCientifico] = useState("");
  const [nomePopular, setNomePopular] = useState("");
  const [sintomas, setSintomas] = useState("");

  const [tocados, setTocados] = useState({
    cientifico: false,
    popular: false,
    sintomas: false,
  });

  const fileInputRef = useRef(null);
  const secaoCadastroRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { fetchPendingAnalyses } = useAnalysisStore();

  useEffect(() => {
    if (typeof fetchPendingAnalyses === "function") {
      fetchPendingAnalyses();
    }
  }, [fetchPendingAnalyses]);

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  const rolarParaCadastro = () => {
    secaoCadastroRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extensoesPermitidas = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/webp",
    "image/raw",
  ];

  const apenasTexto = (valor, limite) => {
    return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s.-]/g, "").slice(0, limite);
  };

  const statusCientifico = (() => {
    const val = nomeCientifico.trim();
    if (!val) {
      return { valido: false, mensagem: "Informe o nome científico (apenas letras)." };
    }
    if (/\d/.test(val)) {
      return { valido: false, mensagem: "O nome científico não pode conter números." };
    }
    if (val.length < 3) {
      return { valido: false, mensagem: "Digite pelo menos 3 caracteres." };
    }
    return { valido: true, mensagem: "Nome científico válido." };
  })();

  const statusPopular = (() => {
    const val = nomePopular.trim();
    if (!val) {
      return { valido: false, mensagem: "Informe o nome popular (apenas letras)." };
    }
    if (/\d/.test(val)) {
      return { valido: false, mensagem: "O nome popular não pode conter números." };
    }
    if (val.length < 2) {
      return { valido: false, mensagem: "Digite pelo menos 2 caracteres." };
    }
    return { valido: true, mensagem: "Nome popular válido." };
  })();

  const statusSintomas = (() => {
    const val = sintomas.trim();
    if (!val) {
      return { valido: false, mensagem: "Descreva os sintomas observados na planta." };
    }
    if (val.length < 5) {
      return { valido: false, mensagem: "Digite pelo menos 5 caracteres." };
    }
    if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(val)) {
      return {
        valido: false,
        mensagem: "Os sintomas não podem conter apenas números; inclua uma descrição.",
      };
    }
    return { valido: true, mensagem: "Descrição de sintomas válida." };
  })();

  const aoSelecionarFoto = async (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setSucessoEnvio("");

    const tipoValido =
      extensoesPermitidas.includes(arquivo.type) ||
      /\.(jpg|jpeg|png|heic|webp|raw)$/i.test(arquivo.name);

    if (!tipoValido) {
      setErroEnvio("Formato inválido. Escolha JPG, PNG, HEIC, WEBP ou RAW.");
      setImagemPreview(null);
      setImageBase64("");
      event.target.value = "";
      return;
    }

    if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) {
      setErroEnvio(`A imagem excede o limite máximo de ${TAMANHO_MAX_MB}MB.`);
      setImagemPreview(null);
      setImageBase64("");
      event.target.value = "";
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
      setImagemPreview(null);
      setImageBase64("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroEnvio("");
    setSucessoEnvio("");

    setTocados({
      cientifico: true,
      popular: true,
      sintomas: true,
    });

    if (!imageBase64) {
      setErroEnvio("Selecione a foto da planta antes de salvar.");
      return;
    }

    if (!statusCientifico.valido || !statusPopular.valido || !statusSintomas.valido) {
      setErroEnvio("Corrija os campos destacados antes de salvar a planta.");
      return;
    }

    setEnviando(true);

    try {
      const payload = {
        user_id: user?.id,
        image: imageBase64,
        scientific_name: nomeCientifico.trim(),
        popular_name: nomePopular.trim(),
        symptoms: sintomas.trim(),
      };

      await api.post("plants/", payload);

      setSucessoEnvio("Planta cadastrada com sucesso!");
      setNomeCientifico("");
      setNomePopular("");
      setSintomas("");
      setTocados({
        cientifico: false,
        popular: false,
        sintomas: false,
      });
      setImageBase64("");
      if (imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
        setImagemPreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Erro ao salvar planta:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Não foi possível salvar os dados da planta. Tente novamente.";
      setErroEnvio(msg);
    } finally {
      setEnviando(false);
    }
  };

  const estiloMensagemValidacao = (valido) => ({
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: valido ? "#2ecc71" : "#ff6b6b",
  });

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
          {/* ==================== SEÇÃO DE APRESENTAÇÃO (HERO DO TÉCNICO) ==================== */}
          <section className="tecnico-hero">
            <div className="tecnico-hero-ilustracao" aria-hidden="true">
              <svg
                viewBox="0 0 260 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Círculo de fundo */}
                <circle
                  cx="130"
                  cy="130"
                  r="112"
                  fill="rgba(0, 153, 99, 0.14)"
                  stroke="#009963"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                <circle cx="130" cy="130" r="90" fill="rgba(4, 114, 75, 0.28)" />

                {/* Folha botânica decorativa no canto */}
                <path
                  d="M188 64C168 66 154 81 154 100C173 100 188 86 188 64Z"
                  fill="#00c47d"
                />
                <path
                  d="M154 100L184 68"
                  stroke="#021a12"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Silhueta do Técnico (Cabeça e Jaleco) */}
                <circle cx="118" cy="96" r="26" fill="#e2f5ee" />
                {/* Óculos técnicos */}
                <rect
                  x="102"
                  y="90"
                  width="13"
                  height="9"
                  rx="3"
                  stroke="#021a12"
                  strokeWidth="2.2"
                />
                <rect
                  x="121"
                  y="90"
                  width="13"
                  height="9"
                  rx="3"
                  stroke="#021a12"
                  strokeWidth="2.2"
                />
                <line
                  x1="115"
                  y1="94"
                  x2="121"
                  y2="94"
                  stroke="#021a12"
                  strokeWidth="2.2"
                />

                {/* Corpo / Jaleco */}
                <path
                  d="M72 184C72 155 92 136 118 136C144 136 164 155 164 184V198H72V184Z"
                  fill="#ffffff"
                />
                {/* Gola em V do jaleco */}
                <path
                  d="M104 137L118 164L132 137"
                  stroke="#009963"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Prancheta / Tablet de Análise */}
                <rect
                  x="136"
                  y="134"
                  width="54"
                  height="68"
                  rx="8"
                  fill="#021a12"
                  stroke="#00c47d"
                  strokeWidth="2.5"
                />
                {/* Ícone de planta na tela da prancheta */}
                <path
                  d="M163 176V156"
                  stroke="#00c47d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M163 164C154 164 149 158 149 151C156 151 163 156 163 164Z"
                  fill="#00c47d"
                />
                <path
                  d="M163 160C172 160 177 154 177 147C170 147 163 152 163 160Z"
                  fill="#2ecc71"
                />
                {/* Check de validação */}
                <circle cx="184" cy="196" r="14" fill="#009963" />
                <path
                  d="M178 196L182 200L191 191"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="tecnico-hero-conteudo">
              <span className="tecnico-hero-badge">Painel do Especialista</span>

              <h1 className="tecnico-hero-titulo">
                Olá, {user?.name || "Técnico"}! Bem-vindo ao AnalisaAI
              </h1>

              <p className="tecnico-hero-descricao">
                O <strong>AnalisaAI</strong> conecta produtores rurais à
                inteligência artificial para identificar plantas tóxicas no
                campo. Como técnico, o seu conhecimento é fundamental para{" "}
                <strong>alimentar nossa base científica</strong> com novas
                espécies e <strong>emitir pareceres</strong> nas análises que
                precisam de validação especializada.
              </p>

              <div className="tecnico-hero-acoes">
                <button
                  type="button"
                  className="btn-hero-primario"
                  onClick={rolarParaCadastro}
                >
                  Cadastrar nova planta ↓
                </button>

                <button
                  type="button"
                  className="btn-hero-secundario"
                  onClick={() => navigate("/fila-trabalho")}
                >
                  Revisar diagnósticos pendentes
                </button>
              </div>
            </div>
          </section>

          <hr className="tecnico-divisor" />

          {/* ==================== SEÇÃO DE CADASTRO DE NOVA PLANTA ==================== */}
          <div id="container-selecao" ref={secaoCadastroRef}>
            <h2 id="bem-vindo">Cadastrar uma nova planta</h2>

            <p id="subtitulo">
              Preencha os dados botânicos e envie uma foto nítida para
              enriquecer o banco de treinamento da inteligência artificial.
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

              {sucessoEnvio && (
                <div
                  className="home-erro-banner-pilula"
                  style={{
                    marginBottom: "16px",
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    borderColor: "#10b981",
                  }}
                >
                  <span
                    className="home-erro-icon"
                    style={{ backgroundColor: "#10b981", color: "#fff" }}
                  >
                    ✓
                  </span>
                  <p>{sucessoEnvio}</p>
                </div>
              )}

              {imagemPreview && (
                <div>
                  <img src={imagemPreview} alt="Imagem selecionada" />
                </div>
              )}

              <input
                ref={fileInputRef}
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
              <form onSubmit={handleSubmit} noValidate>
                <div className="campo">
                  <label htmlFor="nome-cientifico">Nome científico</label>
                  <input
                    id="nome-cientifico"
                    type="text"
                    maxLength={LIMITE_NOME_CIENTIFICO}
                    placeholder="Digite o nome científico"
                    value={nomeCientifico}
                    disabled={enviando}
                    onBlur={() =>
                      setTocados((prev) => ({ ...prev, cientifico: true }))
                    }
                    onChange={(e) => {
                      setErroEnvio("");
                      setTocados((prev) => ({ ...prev, cientifico: true }));
                      setNomeCientifico(
                        apenasTexto(e.target.value, LIMITE_NOME_CIENTIFICO)
                      );
                    }}
                  />
                  {tocados.cientifico && (
                    <small style={estiloMensagemValidacao(statusCientifico.valido)}>
                      {statusCientifico.mensagem}
                    </small>
                  )}
                </div>

                <div className="campo">
                  <label htmlFor="nome-popular">Nome popular</label>
                  <input
                    id="nome-popular"
                    type="text"
                    maxLength={LIMITE_NOME_POPULAR}
                    placeholder="Digite o nome popular"
                    value={nomePopular}
                    disabled={enviando}
                    onBlur={() =>
                      setTocados((prev) => ({ ...prev, popular: true }))
                    }
                    onChange={(e) => {
                      setErroEnvio("");
                      setTocados((prev) => ({ ...prev, popular: true }));
                      setNomePopular(
                        apenasTexto(e.target.value, LIMITE_NOME_POPULAR)
                      );
                    }}
                  />
                  {tocados.popular && (
                    <small style={estiloMensagemValidacao(statusPopular.valido)}>
                      {statusPopular.mensagem}
                    </small>
                  )}
                </div>

                <div className="campo">
                  <label htmlFor="sintomas">Sintomas</label>
                  <input
                    id="sintomas"
                    type="text"
                    maxLength={LIMITE_SINTOMAS}
                    placeholder="Descreva os sintomas observados"
                    value={sintomas}
                    disabled={enviando}
                    onBlur={() =>
                      setTocados((prev) => ({ ...prev, sintomas: true }))
                    }
                    onChange={(e) => {
                      setErroEnvio("");
                      setTocados((prev) => ({ ...prev, sintomas: true }));
                      setSintomas(e.target.value.slice(0, LIMITE_SINTOMAS));
                    }}
                  />
                  {tocados.sintomas && (
                    <small style={estiloMensagemValidacao(statusSintomas.valido)}>
                      {statusSintomas.mensagem}
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn-enviar"
                  disabled={enviando}
                  style={{ marginBottom: "50px" }}
                >
                  {enviando ? "Salvando..." : "Salvar planta"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}