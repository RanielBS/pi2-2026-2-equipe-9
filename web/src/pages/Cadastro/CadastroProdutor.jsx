import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuthStore from "../../stores/authStore";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import "./Cadastrar.css";

export default function CadastroProdutor() {
  const navigate = useNavigate();
  const { register, loading: storeLoading } = useAuthStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  const [erroGeral, setErroGeral] = useState("");
  const [carregandoLocal, setCarregandoLocal] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  // Controla quais campos o usuário já interagiu/saiu para mostrar erros em tempo real
  const [tocados, setTocados] = useState({
    nome: false,
    telefone: false,
    senha: false,
    confirmarSenha: false,
    termos: false,
  });

  const [nomeFazenda, setNomeFazenda] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar estados");
        return res.json();
      })
      .then((dados) => {
        const ordenados = dados.sort((a, b) => a.nome.localeCompare(b.nome));
        setEstados(ordenados);
      })
      .catch(() => {
        setErroGeral("Não foi possível carregar a lista de estados. Verifique sua conexão.");
      });
  }, []);

  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([]);
      setCidadeSelecionada("");
      return;
    }

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar municípios");
        return res.json();
      })
      .then((dados) => setCidades(dados))
      .catch(() => {
        setErroGeral("Não foi possível carregar os municípios desse estado.");
      });
  }, [estadoSelecionado]);

  // Formata automaticamente para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatarTelefone = (valor) => {
    const nums = valor.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const digitosTelefone = telefone.replace(/\D/g, "");
  const telefoneValido = digitosTelefone.length >= 10 && digitosTelefone.length <= 11;

  // Regras de validação em tempo real
  const erroNome = (() => {
    if (!nome.trim()) return "O nome é obrigatório.";
    if (nome.trim().length < 3) return "Digite pelo menos 3 caracteres.";
    return "";
  })();

  const erroTelefone = (() => {
    if (!digitosTelefone) return "O telefone com DDD é obrigatório.";
    if (!telefoneValido) {
      return `Telefone incompleto (${digitosTelefone.length}/10 ou 11 dígitos com DDD).`;
    }
    return "";
  })();

  const erroSenha = (() => {
    if (!senha) return "A senha é obrigatória.";
    if (senha.length < 6) {
      const faltam = 6 - senha.length;
      return `Mínimo de 6 caracteres (faltam ${faltam}).`;
    }
    return "";
  })();

  const erroConfirmarSenha = (() => {
    if (!confirmarSenha) return "Confirme sua senha.";
    if (senha !== confirmarSenha) return "As senhas não coincidem.";
    return "";
  })();

  const preencheuAlgumDadoFazenda = Boolean(
    nomeFazenda.trim() || estadoSelecionado || cidadeSelecionada || localidade.trim()
  );

  const preencheuTodosDadosFazenda = Boolean(
    nomeFazenda.trim() && estadoSelecionado && cidadeSelecionada && localidade.trim()
  );

  const marcarTocado = (campo) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  };

  const exibirErroGeral = (mensagem) => {
    setErroGeral(mensagem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limparErroGeral = () => {
    if (erroGeral) setErroGeral("");
  };

  const finalizar = async (e) => {
    e.preventDefault();
    setErroGeral("");
    setTentouEnviar(true);
    setTocados({
      nome: true,
      telefone: true,
      senha: true,
      confirmarSenha: true,
      termos: true,
    });

    if (erroNome || erroTelefone || erroSenha || erroConfirmarSenha) {
      exibirErroGeral("Corrija os campos destacados em vermelho antes de continuar.");
      return;
    }

    if (preencheuAlgumDadoFazenda && !preencheuTodosDadosFazenda) {
      exibirErroGeral("Preencha todos os campos da propriedade.");
      return;
    }

    if (!aceitouTermos) {
      exibirErroGeral("Você precisa aceitar os termos de uso para continuar.");
      return;
    }

    setCarregandoLocal(true);

    try {
      await register({
        name: nome.trim(),
        phone: digitosTelefone,
        password: senha,
        confirm_password: confirmarSenha,
        accept_terms: aceitouTermos,
        role: "producer",
        tipo: "produtor",
        farm: preencheuTodosDadosFazenda
          ? {
              name: nomeFazenda.trim(),
              state: estadoSelecionado,
              municipality: cidadeSelecionada,
              location: localidade.trim(),
            }
          : null,
      });

      navigate("/");
    } catch (err) {
      console.error("Erro ao cadastrar produtor:", err);
      setCarregandoLocal(false);

      if (!err?.response) {
        exibirErroGeral("Sem conexão com o servidor. Verifique sua internet.");
        return;
      }

      const status = err.response.status;
      const data = err.response.data;
      const storeErrorMsg = useAuthStore.getState().error;

      if (status === 409) {
        exibirErroGeral("Este telefone já está cadastrado no sistema.");
      } else if (status === 400 || status === 422) {
        const msgBackend =
          data?.message ||
          data?.detail ||
          (Array.isArray(data?.errors) ? data.errors[0]?.msg : null) ||
          storeErrorMsg ||
          "Dados inválidos. Verifique as informações preenchidas.";
        exibirErroGeral(msgBackend);
      } else {
        exibirErroGeral(
          data?.message ||
            data?.detail ||
            storeErrorMsg ||
            "Erro ao realizar cadastro. Tente novamente mais tarde."
        );
      }
    }
  };

  const isProcessing = carregandoLocal || storeLoading;

  if (isProcessing) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#032b1d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 99999,
        }}
      >
        <img
          src={logo}
          alt="Logo AnalisaAI"
          style={{ height: "48px", marginBottom: "16px" }}
        />
        <p style={{ fontSize: "18px", fontFamily: "Montserrat, sans-serif" }}>
          Aguarde. Realizando cadastro...
        </p>
      </div>
    );
  }

  return (
    <div className="cadastro-container">
      <h3>Cadastro de Produtor</h3>
      <button
        type="button"
        className="voltar"
        onClick={() => navigate("/OpcoesCadastro")}
      >
        Voltar
      </button>

      {/* BANNER EM FORMATO PÍLULA FIGMA */}
      {erroGeral && (
        <div className="cadastro-erro-banner">
          <span className="cadastro-erro-icon">!</span>
          <p>{erroGeral}</p>
        </div>
      )}

      <form onSubmit={finalizar} noValidate>
        <h4>Informações Pessoais</h4>

        {/* NOME */}
        <div className="campo">
          <label htmlFor="cad-nome">Nome *</label>
          <input
            id="cad-nome"
            type="text"
            className={(tocados.nome || tentouEnviar) && erroNome ? "input-invalido" : ""}
            placeholder="Digite o seu nome completo"
            value={nome}
            onBlur={() => marcarTocado("nome")}
            onChange={(e) => {
              setNome(e.target.value);
              limparErroGeral();
            }}
          />
          {(tocados.nome || tentouEnviar) && erroNome && (
            <span className="texto-erro-campo">{erroNome}</span>
          )}
        </div>

        {/* TELEFONE */}
        <div className="campo">
          <label htmlFor="cad-telefone">Telefone com DDD *</label>
          <input
            id="cad-telefone"
            type="tel"
            className={(tocados.telefone || tentouEnviar) && erroTelefone ? "input-invalido" : ""}
            placeholder="Ex.: (88) 99999-9999"
            value={telefone}
            onBlur={() => marcarTocado("telefone")}
            onChange={(e) => {
              setTelefone(formatarTelefone(e.target.value));
              limparErroGeral();
            }}
          />
          {(tocados.telefone || tentouEnviar) && erroTelefone && (
            <span className="texto-erro-campo">{erroTelefone}</span>
          )}
        </div>

        {/* SENHA */}
        <div className="campo">
          <label htmlFor="cad-senha">Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="cad-senha"
              type={verSenha ? "text" : "password"}
              className={(tocados.senha || tentouEnviar) && erroSenha ? "input-invalido" : ""}
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onBlur={() => marcarTocado("senha")}
              onChange={(e) => {
                setSenha(e.target.value);
                if (!tocados.senha) marcarTocado("senha");
                limparErroGeral();
              }}
            />
            <button
              type="button"
              className="btn-olho-cadastro"
              onClick={() => setVerSenha(!verSenha)}
              tabIndex={-1}
            >
              {verSenha ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {/* Feedback dinâmico em tempo real da senha */}
          {senha.length > 0 && senha.length < 6 && (
            <span className="texto-erro-campo">
              Mínimo de 6 caracteres (faltam {6 - senha.length}).
            </span>
          )}
          {senha.length >= 6 && (
            <span className="texto-sucesso-campo">
              ✓ Tamanho mínimo atingido ({senha.length} caracteres).
            </span>
          )}
          {(tocados.senha || tentouEnviar) && senha.length === 0 && (
            <span className="texto-erro-campo">A senha é obrigatória.</span>
          )}
        </div>

        {/* CONFIRMAR SENHA */}
        <div className="campo">
          <label htmlFor="cad-confirmar-senha">Confirmar Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="cad-confirmar-senha"
              type={verConfirmarSenha ? "text" : "password"}
              className={
                (tocados.confirmarSenha || tentouEnviar) && erroConfirmarSenha
                  ? "input-invalido"
                  : ""
              }
              placeholder="Repita a senha"
              value={confirmarSenha}
              onBlur={() => marcarTocado("confirmarSenha")}
              onChange={(e) => {
                setConfirmarSenha(e.target.value);
                if (!tocados.confirmarSenha) marcarTocado("confirmarSenha");
                limparErroGeral();
              }}
            />
            <button
              type="button"
              className="btn-olho-cadastro"
              onClick={() => setVerConfirmarSenha(!verConfirmarSenha)}
              tabIndex={-1}
            >
              {verConfirmarSenha ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {confirmarSenha.length > 0 && senha !== confirmarSenha && (
            <span className="texto-erro-campo">As senhas não coincidem.</span>
          )}
          {confirmarSenha.length > 0 && senha === confirmarSenha && senha.length >= 6 && (
            <span className="texto-sucesso-campo">✓ As senhas coincidem.</span>
          )}
          {(tocados.confirmarSenha || tentouEnviar) && confirmarSenha.length === 0 && (
            <span className="texto-erro-campo">Confirme sua senha.</span>
          )}
        </div>

        <h4>Informações da Propriedade (Opcional)</h4>

        <div className="campo">
          <label htmlFor="cad-fazenda">Nome da Fazenda</label>
          <input
            id="cad-fazenda"
            type="text"
            className={
              (preencheuAlgumDadoFazenda || tentouEnviar) &&
              preencheuAlgumDadoFazenda &&
              !nomeFazenda.trim()
                ? "input-invalido"
                : ""
            }
            placeholder="Digite o nome da fazenda"
            value={nomeFazenda}
            onChange={(e) => {
              setNomeFazenda(e.target.value);
              limparErroGeral();
            }}
          />
          {preencheuAlgumDadoFazenda && !nomeFazenda.trim() && (
            <span className="texto-erro-campo">
              Informe o nome da fazenda para completar os dados da propriedade.
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="cad-estado">Estado</label>
          <select
            id="cad-estado"
            className={
              preencheuAlgumDadoFazenda && !estadoSelecionado ? "input-invalido" : ""
            }
            value={estadoSelecionado}
            onChange={(e) => {
              setEstadoSelecionado(e.target.value);
              setCidadeSelecionada("");
              limparErroGeral();
            }}
          >
            <option value="">Selecione um estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
          {preencheuAlgumDadoFazenda && !estadoSelecionado && (
            <span className="texto-erro-campo">Selecione o estado da propriedade.</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="cad-cidade">Município/Cidade</label>
          <select
            id="cad-cidade"
            className={
              preencheuAlgumDadoFazenda && !cidadeSelecionada ? "input-invalido" : ""
            }
            value={cidadeSelecionada}
            disabled={!estadoSelecionado}
            onChange={(e) => {
              setCidadeSelecionada(e.target.value);
              limparErroGeral();
            }}
          >
            <option value="">Selecione um município</option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
          {preencheuAlgumDadoFazenda && !cidadeSelecionada && (
            <span className="texto-erro-campo">Selecione o município da propriedade.</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="cad-localidade">Localidade</label>
          <input
            id="cad-localidade"
            type="text"
            className={
              preencheuAlgumDadoFazenda && !localidade.trim() ? "input-invalido" : ""
            }
            placeholder="Ex.: Distrito, Sítio, Zona Rural"
            value={localidade}
            onChange={(e) => {
              setLocalidade(e.target.value);
              limparErroGeral();
            }}
          />
          {preencheuAlgumDadoFazenda && !localidade.trim() && (
            <span className="texto-erro-campo">
              Informe a localidade da propriedade.
            </span>
          )}
        </div>

        {/* TERMOS DE USO */}
        <div className="campo-termos">
          <label className="label-termos">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => {
                setAceitouTermos(e.target.checked);
                marcarTocado("termos");
                limparErroGeral();
              }}
            />
            <span>
              Li e aceito os <strong>termos de uso</strong> e a política de
              privacidade (autorizando o compartilhamento das imagens com
              técnicos agrícolas para validação).
            </span>
          </label>
          {(tocados.termos || tentouEnviar) && !aceitouTermos && (
            <span className="texto-erro-campo" style={{ marginTop: "6px" }}>
              Você precisa aceitar os termos de uso para criar sua conta.
            </span>
          )}
        </div>

        <div className="campo-botao">
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? "Cadastrando..." : "Cadastrar-se"}
          </button>
        </div>
      </form>
    </div>
  );
}