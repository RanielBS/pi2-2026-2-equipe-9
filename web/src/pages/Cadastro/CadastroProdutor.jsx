import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [erro, setErro] = useState("");
  const [carregandoLocal, setCarregandoLocal] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

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
        setErro("Não foi possível carregar a lista de estados. Verifique sua conexão.");
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
        setErro("Não foi possível carregar os municípios desse estado.");
      });
  }, [estadoSelecionado]);

  const validarTelefone = (tel) => {
    const apenasNumeros = tel.replace(/\D/g, "");
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
  };

  const exibirErro = (mensagem) => {
    setErro(mensagem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limparErro = () => {
    if (erro) setErro("");
  };

  const finalizar = async (e) => {
    e.preventDefault();
    setErro("");

    // 1. Campos pessoais obrigatórios
    if (
      !nome.trim() ||
      !telefone.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {
      exibirErro("Preencha todos os campos obrigatórios.");
      return;
    }

    // 2. Validação do nome
    if (nome.trim().length < 3) {
      exibirErro("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    // 3. Validação do formato de telefone
    if (!validarTelefone(telefone)) {
      exibirErro("O formato do telefone é inválido. Informe DDD + número.");
      return;
    }

    // 4. Validação da senha
    if (senha.length < 6) {
      exibirErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      exibirErro("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }
    if (!aceitouTermos) {
  exibirErro("É necessário aceitar os Termos de Uso e a Política de Privacidade.");
  return;
}

    // 5. Validação dos dados da propriedade (se começou a preencher, precisa completar)
    const preencheuAlgumDadoFazenda =
      nomeFazenda.trim() ||
      estadoSelecionado ||
      cidadeSelecionada ||
      localidade.trim();

    const preencheuTodosDadosFazenda =
      nomeFazenda.trim() &&
      estadoSelecionado &&
      cidadeSelecionada &&
      localidade.trim();

    if (preencheuAlgumDadoFazenda && !preencheuTodosDadosFazenda) {
      exibirErro("Preencha todos os campos da propriedade ou deixe-os em branco.");
      return;
    }

    setCarregandoLocal(true);

    try {
      await register({
        name: nome.trim(),
        phone: telefone.trim(),
        password: senha,
        confirm_password: confirmarSenha,
        accept_terms: aceitouTermos,
        role: "produtor",
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
        exibirErro("Sem conexão com o servidor. Verifique sua internet.");
        return;
      }

      const status = err.response.status;
      const data = err.response.data;
      

      if (status === 409) {
  exibirErro("Este telefone já está cadastrado no sistema.");
} else if (status === 400 || status === 422) {
      const msgBackend =
    data?.message ||
    data?.detail ||
    (Array.isArray(data?.errors) ? data.errors[0]?.msg : null) ||
    "Dados inválidos. Verifique as informações preenchidas.";

  exibirErro(msgBackend);
} else {
  exibirErro(
    data?.message ||
      data?.detail ||
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
        onClick={() => navigate("/cadastro")}
      >
        Voltar
      </button>

      {/* BANNER EM FORMATO PÍLULA FIGMA */}
      {erro && (
        <div className="cadastro-erro-banner">
          <span className="cadastro-erro-icon">!</span>
          <p>{erro}</p>
        </div>
      )}

      <form onSubmit={finalizar}>
        <h4>Informações Pessoais</h4>

        <div className="campo">
          <label>Nome *</label>
          <input
            type="text"
            placeholder="Digite o seu nome"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              limparErro();
            }}
          />
        </div>

        <div className="campo">
          <label>Telefone *</label>
          <input
            type="tel"
            placeholder="Ex.: (XX) XXXXX-XXXX"
            value={telefone}
            onChange={(e) => {
              setTelefone(e.target.value);
              limparErro();
            }}
          />
        </div>

        <div className="campo">
          <label>Senha *</label>
          <input
            type="password"
            placeholder="Digite a sua senha (mín. 6 caracteres)"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              limparErro();
            }}
          />
        </div>

        <div className="campo">
          <label>Confirmar Senha *</label>
          <input
            type="password"
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => {
              setConfirmarSenha(e.target.value);
              limparErro();
            }}
          />
        </div>

        <h4>Informações da Propriedade</h4>

        <div className="campo">
          <label>Nome da Fazenda</label>
          <input
            type="text"
            placeholder="Digite o nome da fazenda"
            value={nomeFazenda}
            onChange={(e) => {
              setNomeFazenda(e.target.value);
              limparErro();
            }}
          />
        </div>

        <div className="campo">
          <label>Estado</label>
          <select
            value={estadoSelecionado}
            onChange={(e) => {
              setEstadoSelecionado(e.target.value);
              setCidadeSelecionada("");
              limparErro();
            }}
          >
            <option value="">Selecione um estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Município/Cidade</label>
          <select
            value={cidadeSelecionada}
            disabled={!estadoSelecionado}
            onChange={(e) => {
              setCidadeSelecionada(e.target.value);
              limparErro();
            }}
          >
            <option value="">Selecione um município</option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Localidade</label>
          <input
            type="text"
            placeholder="Digite a localidade"
            value={localidade}
            onChange={(e) => {
              setLocalidade(e.target.value);
              limparErro();
            }}
          />
        </div>
<div className="campo">
  <label>
    <input
      type="checkbox"
      checked={aceitouTermos}
      onChange={(e) => {
        setAceitouTermos(e.target.checked);
        limparErro();
      }}
    />
    Aceito os Termos de Uso e a Política de Privacidade.
  </label>
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
