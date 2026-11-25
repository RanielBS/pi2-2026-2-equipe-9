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

  // Controla se o usuário já interagiu com cada campo ou clicou em enviar
  const [tocados, setTocados] = useState({
    cientifico: false,
    popular: false,
    sintomas: false,
  });

  const fileInputRef = useRef(null);
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

  // --- Validações individuais em tempo real (padrão Cadastro) ---
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

    // Marca todos como tocados para exibir mensagens vermelhas nos campos inválidos
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

                <button type="submit" id="btn-enviar" disabled={enviando}>
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