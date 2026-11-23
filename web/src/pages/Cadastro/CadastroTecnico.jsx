
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
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
  const { register, loading } = useAuthStore();

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
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState("");

  const cursoFinal =
    curso === "Outro" ? outroCurso.trim() : curso.trim();

  const especialidadeFinal =
    especialidade === "Outra"
      ? outraEspecialidade.trim()
      : especialidade.trim();

  const finalizar = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!telefone.trim()) {
      setErro("Informe seu telefone.");
      return;
    }

    if (!tipoTecnico) {
      setErro("Selecione se você é estudante ou profissional.");
      return;
    }

    if (tipoTecnico === "estudante") {
      if (!instituicao.trim()) {
        setErro("Informe a instituição de ensino.");
        return;
      }

      if (!curso) {
        setErro("Selecione seu curso.");
        return;
      }

      if (curso === "Outro" && !outroCurso.trim()) {
        setErro("Informe o nome do seu curso.");
        return;
      }
    }

    if (tipoTecnico === "profissional") {
      if (!especialidade) {
        setErro("Informe sua especialidade.");
        return;
      }

      if (especialidade === "Outra" && !outraEspecialidade.trim()) {
        setErro("Informe sua especialidade.");
        return;
      }

      if (!qualificacao.trim()) {
        setErro("Informe sua formação ou qualificação profissional.");
        return;
      }

      if (isProfessor && !instituicao.trim()) {
        setErro("Informe a instituição onde você leciona.");
        return;
      }
    }

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os termos para continuar.");
      return;
    }

    setErro("");

    try {
      await register({
        name: nome.trim(),
        phone: telefone,
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
        specialty:
          tipoTecnico === "profissional" ? especialidadeFinal : "",
      });

      alert(
        "Cadastro realizado! Seu perfil técnico ficará aguardando aprovação."
      );

      navigate("/");
    } catch (err) {
      const dadosErro = err.response?.data;

      if (dadosErro && typeof dadosErro === "object") {
        const primeiraMensagem = Object.values(dadosErro).flat()[0];

        setErro(
          typeof primeiraMensagem === "string"
            ? primeiraMensagem
            : "Não foi possível realizar o cadastro."
        );
      } else {
        setErro("Não foi possível realizar o cadastro. Tente novamente.");
      }
    }
  };

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

      {erro && <p className="mensagem-erro">{erro}</p>}

      <form onSubmit={finalizar}>
        <h4>Informações Pessoais</h4>

        <div className="campo">
          <label>Nome</label>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label>Telefone</label>
          <input
            type="tel"
            placeholder="Digite seu número"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>

        <h4>Perfil Técnico</h4>

        <div className="campo">
          <label>Qual é o seu perfil?</label>
          <select
            value={tipoTecnico}
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
            }}
            required
          >
            <option value="">Selecione seu perfil</option>
            <option value="estudante">Estudante</option>
            <option value="profissional">Profissional</option>
          </select>
        </div>

        {tipoTecnico === "estudante" && (
          <>
            <div className="campo">
              <label>Instituição de Ensino</label>
              <input
                type="text"
                placeholder="Ex.: Instituto Federal do Ceará"
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Curso</label>
              <select
                value={curso}
                onChange={(e) => {
                  setCurso(e.target.value);
                  setOutroCurso("");
                }}
                required
              >
                <option value="">Selecione seu curso</option>

                {cursosDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item === "Outro" ? "Outro curso" : item}
                  </option>
                ))}
              </select>
            </div>

            {curso === "Outro" && (
              <div className="campo">
                <label>Informe seu curso</label>
                <input
                  type="text"
                  placeholder="Digite o nome do seu curso"
                  value={outroCurso}
                  onChange={(e) => setOutroCurso(e.target.value)}
                  required
                />
              </div>
            )}
          </>
        )}

        {tipoTecnico === "profissional" && (
          <>
            <div className="campo">
              <label>Você também é professor?</label>

              <label>
                <input
                  type="checkbox"
                  checked={isProfessor}
                  onChange={(e) => {
                    setIsProfessor(e.target.checked);

                    if (!e.target.checked) {
                      setInstituicao("");
                    }
                  }}
                />
                Sim, sou professor.
              </label>
            </div>

            {isProfessor && (
              <div className="campo">
                <label>Instituição onde leciona</label>
                <input
                  type="text"
                  placeholder="Informe sua instituição de ensino"
                  value={instituicao}
                  onChange={(e) => setInstituicao(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="campo">
              <label>Especialidade</label>
              <select
                value={especialidade}
                onChange={(e) => {
                  setEspecialidade(e.target.value);
                  setOutraEspecialidade("");
                }}
                required
              >
                <option value="">Selecione uma especialidade</option>

                {especialidadesDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {especialidade === "Outra" && (
              <div className="campo">
                <label>Informe sua especialidade</label>
                <input
                  type="text"
                  placeholder="Digite sua especialidade"
                  value={outraEspecialidade}
                  onChange={(e) => setOutraEspecialidade(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="campo">
              <label>Formação ou Qualificação Profissional</label>
              <textarea
                placeholder="Descreva sua formação e qualificação"
                value={qualificacao}
                onChange={(e) => setQualificacao(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Registro Profissional (quando aplicável)</label>
              <input
                type="text"
                placeholder="CREA, CFTA, CRMV etc."
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
              />
            </div>
          </>
        )}

        <h4>Segurança</h4>

        <div className="campo">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label>Confirmar Senha</label>
          <input
            type="password"
            placeholder="Repita sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>

        <div className="campo-termos">
          <label className="label-termos">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
            />

            <span>
              Li e aceito os <strong>termos de uso</strong> e a política de
              privacidade.
            </span>
          </label>
        </div>

        <div className="campo-botao">
          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar-se"}
          </button>
        </div>
      </form>
    </div>
  );
}
