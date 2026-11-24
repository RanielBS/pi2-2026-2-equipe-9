import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuthStore from "../../stores/authStore";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import "./Cadastrar.css";

const cursosDisponiveis = [
  "Técnico em Agropecuária",
  "Técnico em Agricultura",
  "Técnico em Agroindústria",
  "Técnico em Agroecologia",
  "Técnico em Florestas",
  "Técnico em Meio Ambiente",
  "Técnico em Zootecnia",
  "Agronomia",
  "Engenharia Agrícola",
  "Zootecnia",
  "Medicina Veterinária",
  "Ciências Biológicas",
  "Gestão Ambiental",
  "Outro",
];

const especialidadesDisponiveis = [
  "Agronomia",
  "Zootecnia",
  "Medicina Veterinária",
  "Engenharia Florestal",
  "Técnico em Agropecuária",
  "Botânica / Biologia",
  "Outra",
];

export default function CadastroTecnico() {
  const navigate = useNavigate();
  const { register, loading: storeLoading } = useAuthStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoTecnico, setTipoTecnico] = useState("");
  const [isProfessor, setIsProfessor] = useState(false);

  const [instituicao, setInstituicao] = useState("");
  const [curso, setCurso] = useState("");
  const [outroCurso, setOutroCurso] = useState("");

  const [qualificacao, setQualificacao] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [outraEspecialidade, setOutraEspecialidade] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [carregandoLocal, setCarregandoLocal] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const [tocados, setTocados] = useState({
    nome: false,
    telefone: false,
    tipoTecnico: false,
    instituicao: false,
    curso: false,
    outroCurso: false,
    especialidade: false,
    outraEspecialidade: false,
    qualificacao: false,
    senha: false,
    confirmarSenha: false,
    termos: false,
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

  const cursoFinal = curso === "Outro" ? outroCurso.trim() : curso.trim();
  const especialidadeFinal =
    especialidade === "Outra" ? outraEspecialidade.trim() : especialidade.trim();

  // Validações em tempo real
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

  const erroTipoTecnico = !tipoTecnico ? "Selecione se você é estudante ou profissional." : "";

  const erroInstituicao = (() => {
    if (tipoTecnico === "estudante" && !instituicao.trim()) {
      return "Informe a instituição de ensino.";
    }
    if (tipoTecnico === "profissional" && isProfessor && !instituicao.trim()) {
      return "Informe a instituição onde você leciona.";
    }
    return "";
  })();

  const erroCurso =
    tipoTecnico === "estudante" && !curso ? "Selecione seu curso." : "";

  const erroOutroCurso =
    tipoTecnico === "estudante" && curso === "Outro" && !outroCurso.trim()
      ? "Informe o nome do seu curso."
      : "";

  const erroEspecialidade =
    tipoTecnico === "profissional" && !especialidade
      ? "Selecione sua especialidade."
      : "";

  const erroOutraEspecialidade =
    tipoTecnico === "profissional" &&
    especialidade === "Outra" &&
    !outraEspecialidade.trim()
      ? "Informe sua especialidade."
      : "";

  const erroQualificacao =
    tipoTecnico === "profissional" && !qualificacao.trim()
      ? "Descreva sua formação ou qualificação profissional."
      : "";

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

  const finalizar = async (e) => {
    e.preventDefault();
    setErroGeral("");
    setTentouEnviar(true);
    setTocados({
      nome: true,
      telefone: true,
      tipoTecnico: true,
      instituicao: true,
      curso: true,
      outroCurso: true,
      especialidade: true,
      outraEspecialidade: true,
      qualificacao: true,
      senha: true,
      confirmarSenha: true,
      termos: true,
    });

    const temErroCampo =
      erroNome ||
      erroTelefone ||
      erroTipoTecnico ||
      erroInstituicao ||
      erroCurso ||
      erroOutroCurso ||
      erroEspecialidade ||
      erroOutraEspecialidade ||
      erroQualificacao ||
      erroSenha ||
      erroConfirmarSenha;

    if (temErroCampo) {
      exibirErroGeral("Corrija os campos destacados em vermelho antes de continuar.");
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

        role: "tecnico",
        technician_type: tipoTecnico,
        is_professor: tipoTecnico === "profissional" && isProfessor,

        institution: instituicao.trim(),
        course: tipoTecnico === "estudante" ? cursoFinal : "",
        qualification_description: qualificacao.trim(),

        professional_register: registroProfissional.trim(),
        specialty: tipoTecnico === "profissional" ? especialidadeFinal : "",
      });

      navigate("/");
    } catch (err) {
      console.error("Erro ao cadastrar técnico:", err);
      setCarregandoLocal(false);

      if (!err?.response) {
        exibirErroGeral("Sem conexão com o servidor. Verifique sua internet.");
        return;
      }

      const status = err.response.status;
      const dadosErro = err.response.data;
      const storeErrorMsg = useAuthStore.getState().error;

      if (status === 409) {
        exibirErroGeral("Este telefone já está cadastrado no sistema.");
      } else if (dadosErro && typeof dadosErro === "object") {
        const primeiraMensagem =
          dadosErro.message ||
          dadosErro.detail ||
          Object.values(dadosErro).flat()[0];

        exibirErroGeral(
          typeof primeiraMensagem === "string"
            ? primeiraMensagem
            : storeErrorMsg || "Não foi possível realizar o cadastro."
        );
      } else {
        exibirErroGeral(
          storeErrorMsg || "Não foi possível realizar o cadastro. Tente novamente."
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
      <h3>Cadastro de Técnico</h3>

      <button
        className="voltar"
        type="button"
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
          <label htmlFor="tec-nome">Nome *</label>
          <input
            id="tec-nome"
            type="text"
            className={(tocados.nome || tentouEnviar) && erroNome ? "input-invalido" : ""}
            placeholder="Digite seu nome completo"
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
          <label htmlFor="tec-telefone">Telefone com DDD *</label>
          <input
            id="tec-telefone"
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

        <h4>Perfil Técnico</h4>

        {/* TIPO TÉCNICO */}
        <div className="campo">
          <label htmlFor="tec-perfil">Qual é o seu perfil? *</label>
          <select
            id="tec-perfil"
            className={(tocados.tipoTecnico || tentouEnviar) && erroTipoTecnico ? "input-invalido" : ""}
            value={tipoTecnico}
            onBlur={() => marcarTocado("tipoTecnico")}
            onChange={(e) => {
              setTipoTecnico(e.target.value);
              setIsProfessor(false);
              setInstituicao("");
              setCurso("");
              setOutroCurso("");
              setQualificacao("");
              setRegistroProfissional("");
              setEspecialidade("");
              setOutraEspecialidade("");
              limparErroGeral();
            }}
          >
            <option value="">Selecione seu perfil</option>
            <option value="estudante">Estudante</option>
            <option value="profissional">Profissional</option>
          </select>
          {(tocados.tipoTecnico || tentouEnviar) && erroTipoTecnico && (
            <span className="texto-erro-campo">{erroTipoTecnico}</span>
          )}
        </div>

        {/* CAMPOS ESTUDANTE */}
        {tipoTecnico === "estudante" && (
          <>
            <div className="campo">
              <label htmlFor="tec-instituicao-est">Instituição de Ensino *</label>
              <input
                id="tec-instituicao-est"
                type="text"
                className={(tocados.instituicao || tentouEnviar) && erroInstituicao ? "input-invalido" : ""}
                placeholder="Ex.: Instituto Federal do Ceará"
                value={instituicao}
                onBlur={() => marcarTocado("instituicao")}
                onChange={(e) => {
                  setInstituicao(e.target.value);
                  limparErroGeral();
                }}
              />
              {(tocados.instituicao || tentouEnviar) && erroInstituicao && (
                <span className="texto-erro-campo">{erroInstituicao}</span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="tec-curso">Curso *</label>
              <select
                id="tec-curso"
                className={(tocados.curso || tentouEnviar) && erroCurso ? "input-invalido" : ""}
                value={curso}
                onBlur={() => marcarTocado("curso")}
                onChange={(e) => {
                  setCurso(e.target.value);
                  setOutroCurso("");
                  limparErroGeral();
                }}
              >
                <option value="">Selecione seu curso</option>
                {cursosDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item === "Outro" ? "Outro curso" : item}
                  </option>
                ))}
              </select>
              {(tocados.curso || tentouEnviar) && erroCurso && (
                <span className="texto-erro-campo">{erroCurso}</span>
              )}
            </div>

            {curso === "Outro" && (
              <div className="campo">
                <label htmlFor="tec-outro-curso">Informe seu curso *</label>
                <input
                  id="tec-outro-curso"
                  type="text"
                  className={(tocados.outroCurso || tentouEnviar) && erroOutroCurso ? "input-invalido" : ""}
                  placeholder="Digite o nome do seu curso"
                  value={outroCurso}
                  onBlur={() => marcarTocado("outroCurso")}
                  onChange={(e) => {
                    setOutroCurso(e.target.value);
                    limparErroGeral();
                  }}
                />
                {(tocados.outroCurso || tentouEnviar) && erroOutroCurso && (
                  <span className="texto-erro-campo">{erroOutroCurso}</span>
                )}
              </div>
            )}
          </>
        )}

        {/* CAMPOS PROFISSIONAL */}
        {tipoTecnico === "profissional" && (
          <>
            <div className="campo-termos" style={{ marginBottom: "16px" }}>
              <label className="label-termos">
                <input
                  type="checkbox"
                  checked={isProfessor}
                  onChange={(e) => {
                    setIsProfessor(e.target.checked);
                    if (!e.target.checked) {
                      setInstituicao("");
                    }
                    limparErroGeral();
                  }}
                />
                <span>Também atuo como <strong>professor(a)</strong> na área.</span>
              </label>
            </div>

            {isProfessor && (
              <div className="campo">
                <label htmlFor="tec-instituicao-prof">Instituição onde leciona *</label>
                <input
                  id="tec-instituicao-prof"
                  type="text"
                  className={(tocados.instituicao || tentouEnviar) && erroInstituicao ? "input-invalido" : ""}
                  placeholder="Informe sua instituição de ensino"
                  value={instituicao}
                  onBlur={() => marcarTocado("instituicao")}
                  onChange={(e) => {
                    setInstituicao(e.target.value);
                    limparErroGeral();
                  }}
                />
                {(tocados.instituicao || tentouEnviar) && erroInstituicao && (
                  <span className="texto-erro-campo">{erroInstituicao}</span>
                )}
              </div>
            )}

            <div className="campo">
              <label htmlFor="tec-especialidade">Especialidade *</label>
              <select
                id="tec-especialidade"
                className={(tocados.especialidade || tentouEnviar) && erroEspecialidade ? "input-invalido" : ""}
                value={especialidade}
                onBlur={() => marcarTocado("especialidade")}
                onChange={(e) => {
                  setEspecialidade(e.target.value);
                  setOutraEspecialidade("");
                  limparErroGeral();
                }}
              >
                <option value="">Selecione uma especialidade</option>
                {especialidadesDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {(tocados.especialidade || tentouEnviar) && erroEspecialidade && (
                <span className="texto-erro-campo">{erroEspecialidade}</span>
              )}
            </div>

            {especialidade === "Outra" && (
              <div className="campo">
                <label htmlFor="tec-outra-esp">Informe sua especialidade *</label>
                <input
                  id="tec-outra-esp"
                  type="text"
                  className={(tocados.outraEspecialidade || tentouEnviar) && erroOutraEspecialidade ? "input-invalido" : ""}
                  placeholder="Digite sua especialidade"
                  value={outraEspecialidade}
                  onBlur={() => marcarTocado("outraEspecialidade")}
                  onChange={(e) => {
                    setOutraEspecialidade(e.target.value);
                    limparErroGeral();
                  }}
                />
                {(tocados.outraEspecialidade || tentouEnviar) && erroOutraEspecialidade && (
                  <span className="texto-erro-campo">{erroOutraEspecialidade}</span>
                )}
              </div>
            )}

            <div className="campo">
              <label htmlFor="tec-qualificacao">Formação ou Qualificação Profissional *</label>
              <input
                id="tec-qualificacao"
                type="text"
                className={(tocados.qualificacao || tentouEnviar) && erroQualificacao ? "input-invalido" : ""}
                placeholder="Descreva sua formação e qualificação"
                value={qualificacao}
                onBlur={() => marcarTocado("qualificacao")}
                onChange={(e) => {
                setQualificacao(e.target.value);
                limparErroGeral();
    }}
  />
  {(tocados.qualificacao || tentouEnviar) && erroQualificacao && (
    <span className="texto-erro-campo">{erroQualificacao}</span>
  )}
</div>

            <div className="campo">
              <label htmlFor="tec-registro">Registro Profissional (quando aplicável)</label>
              <input
                id="tec-registro"
                type="text"
                placeholder="CREA, CFTA, CRMV etc."
                value={registroProfissional}
                onChange={(e) => {
                  setRegistroProfissional(e.target.value);
                  limparErroGeral();
                }}
              />
            </div>
          </>
        )}

        <h4>Segurança</h4>

        {/* SENHA */}
        <div className="campo">
          <label htmlFor="tec-senha">Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="tec-senha"
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

        {/* CONFIRMAR SENHA */}
        <div className="campo">
          <label htmlFor="tec-confirmar-senha">Confirmar Senha *</label>
          <div className="input-senha-wrapper">
            <input
              id="tec-confirmar-senha"
              type={verConfirmarSenha ? "text" : "password"}
              className={
                (tocados.confirmarSenha || tentouEnviar) && erroConfirmarSenha
                  ? "input-invalido"
                  : ""
              }
              placeholder="Repita sua senha"
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
              privacidade (atuando como colaborador técnico na validação de
              diagnósticos da plataforma).
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