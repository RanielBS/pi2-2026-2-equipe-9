import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../../api/api";
import useAuthStore from "../../../stores/authStore";
import logo from "../../../assets/images/Logo-AnalisaAI.png";
import "./CadastroAdmin.css";

export default function CadastroAdmin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  const [erroGeral, setErroGeral] = useState("");
  const [carregandoLocal, setCarregandoLocal] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const [tocados, setTocados] = useState({
    nome: false,
    telefone: false,
    email: false,
    senha: false,
    confirmarSenha: false,
  });

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

  const erroEmail = (() => {
    if (!email.trim()) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return "Formato de e-mail inválido.";
    return "";
  })();

  const erroSenha = (() => {
    if (!senha) return "A senha é obrigatória.";
    if (senha.length < 6) {
      return `Mínimo de 6 caracteres (faltam ${6 - senha.length}).`;
    }
    return "";
  })();

  const erroConfirmarSenha = (() => {
    if (!confirmarSenha) return "Confirme sua senha.";
    if (senha !== confirmarSenha) return "As senhas não coincidem.";
    return "";
  })();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroGeral("");
    setTentouEnviar(true);
    setTocados({
      nome: true,
      telefone: true,
      email: true,
      senha: true,
      confirmarSenha: true,
    });

    if (erroNome || erroTelefone || erroEmail || erroSenha || erroConfirmarSenha) {
      exibirErroGeral("Corrija os campos destacados em vermelho antes de continuar.");
      return;
    }

    if (!user?.id) {
      exibirErroGeral("Sessão expirada. Faça login novamente.");
      return;
    }

    setCarregandoLocal(true);

    try {
      const phoneE164 = digitosTelefone.startsWith("55")
        ? `+${digitosTelefone}`
        : `+55${digitosTelefone}`;

      const payload = {
        requested_by: user.id,
        name: nome.trim(),
        phone: phoneE164,
        password: senha,
        confirm_password: confirmarSenha,
        ...(email.trim() ? { email: email.trim() } : {}),
      };

      const resp = await api.post("users/admins/", payload);

      if (resp?.data?.user || resp?.status === 201 || resp?.status === 200) {
        navigate("/listUsers");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      setCarregandoLocal(false);

      if (!err?.response) {
        exibirErroGeral("Sem conexão com o servidor. Verifique sua internet.");
        return;
      }

      const status = err.response.status;
      const data = err.response.data;

      if (status === 409) {
        exibirErroGeral("Este telefone já está cadastrado no sistema.");
      } else if (data && typeof data === "object") {
        const primeiraMensagem =
          data.message ||
          data.detail ||
          Object.values(data).flat()[0];

        exibirErroGeral(
          typeof primeiraMensagem === "string"
            ? primeiraMensagem
            : "Erro ao criar administrador. Verifique os dados."
        );
      } else {
        exibirErroGeral("Erro ao criar administrador. Tente novamente.");
      }
    }
  };

  if (carregandoLocal) {
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
          Aguarde. Cadastrando administrador...
        </p>
      </div>
    );
  }

  return (
    <div className="cadastro-container">
      <h3>Cadastro de Administrador</h3>

      <button
        type="button"
        className="voltar"
        onClick={() => navigate("/admin")}
      >
        Voltar
      </button>

      {erroGeral && (
        <div className="cadastro-erro-banner">
          <span className="cadastro-erro-icon">!</span>
          <p>{erroGeral}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <h4>Informações do Administrador</h4>

        <div className="campo">
          <label htmlFor="adm-nome">Nome *</label>
          <input
            id="adm-nome"
            type="text"
            className={(tocados.nome || tentouEnviar) && erroNome ? "input-invalido" : ""}
            placeholder="Digite o nome completo"
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

        <div className="campo">
          <label htmlFor="adm-telefone">Telefone com DDD *</label>
          <input
            id="adm-telefone"
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

        <div className="campo">
          <label htmlFor="adm-email">E-mail (opcional)</label>
          <input
            id="adm-email"
            type="email"
            className={(tocados.email || tentouEnviar) && erroEmail ? "input-invalido" : ""}
            placeholder="Digite o e-mail (opcional)"
            value={email}
            onBlur={() => marcarTocado("email")}
            onChange={(e) => {
              setEmail(e.target.value);
              limparErroGeral();
            }}
          />
          {(tocados.email || tentouEnviar) && erroEmail && (
            <span className="texto-erro-campo">{erroEmail}</span>
          )}
        </div>

        <h4>Segurança</h4>

        <div className="campo">
          <label htmlFor="adm-senha">Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="adm-senha"
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

        <div className="campo">
          <label htmlFor="adm-confirmar-senha">Confirmar Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="adm-confirmar-senha"
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

        <div className="campo-botao">
          <button type="submit" disabled={carregandoLocal}>
            {carregandoLocal ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}