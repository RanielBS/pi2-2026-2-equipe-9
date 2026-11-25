import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import useAuthStore from "../../stores/authStore";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";
import BotaoVoltarMenu from "../../components/BotaoVoltarMenu";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";
import { BsPencil, BsCheck } from "react-icons/bs";

import "./EditarPerfil.css";

const LIMITE_NOME = 100;
const LIMITE_FAZENDA = 100;
const LIMITE_LOCALIDADE = 100;

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState({ tipo: "", texto: "" });

  const userRole = (user?.role || user?.user_type || user?.tipo || "produtor").toLowerCase();
  const techData = user?.technician || user || {};

  const ehTecnico =
    user?.is_technician === true ||
    ["technician", "tecnico"].includes(userRole) ||
    Boolean(techData?.technician_type) ||
    techData?.is_professor === true ||
    Boolean(techData?.professional_register);

  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    localidade: "",
    fazenda: "",
    tipoTecnico: "",
    isProfessor: false,
    instituicao: "",
    curso: "",
    especialidade: "",
    qualificacao: "",
    registroProfissional: "",
  });

  const [editando, setEditando] = useState({
    nome: false,
    telefone: false,
    localidade: false,
    fazenda: false,
  });

  const apenasTexto = (valor, limite) => {
    return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "").slice(0, limite);
  };

  const formatarTelefone = (valor) => {
    const nums = valor.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  useEffect(() => {
    if (ehTecnico) return;
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => res.json())
      .then((lista) => {
        const ordenados = lista.sort((a, b) => a.nome.localeCompare(b.nome));
        setEstados(ordenados);
      })
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, [ehTecnico]);

  useEffect(() => {
    if (ehTecnico || !estadoSelecionado) {
      setCidades([]);
      return;
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
    )
      .then((res) => res.json())
      .then((lista) => {
        setCidades(lista);
      })
      .catch((err) => console.error("Erro ao carregar municípios:", err));
  }, [estadoSelecionado, ehTecnico]);

  const preencherDadosDoUsuario = (u) => {
    if (!u) return;
    const tech = u.technician || u;
    const isProf = Boolean(tech.is_professor);
    const tipoDetectado =
      tech.technician_type ||
      (isProf || tech.specialty || tech.qualification_description ? "profissional" : "");

    setDados({
      nome: u.name || "",
      telefone: u.phone || "",
      localidade: u.farm?.location || "",
      fazenda: u.farm?.name || "",
      tipoTecnico: tipoDetectado,
      isProfessor: isProf,
      instituicao: tech.institution || "",
      curso: tech.course || "",
      especialidade: tech.specialty || "",
      qualificacao: tech.qualification_description || "",
      registroProfissional: tech.professional_register || "",
    });
    setEstadoSelecionado(u.farm?.state || "");
    setCidadeSelecionada(u.farm?.municipality || "");
  };

  useEffect(() => {
    preencherDadosDoUsuario(user);
  }, [user]);

  const toggleEditar = (campo) => {
    setEditando((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCancelar = () => {
    preencherDadosDoUsuario(user);
    setEditando({
      nome: false,
      telefone: false,
      localidade: false,
      fazenda: false,
    });
    setMensagemFeedback({ tipo: "", texto: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemFeedback({ tipo: "", texto: "" });

    if (!user?.id) {
      setMensagemFeedback({
        tipo: "erro",
        texto: "Utilizador não autenticado.",
      });
      return;
    }

    if (!dados.nome.trim() || dados.nome.trim().length < 3) {
      setMensagemFeedback({
        tipo: "erro",
        texto: "Informe um nome válido com pelo menos 3 caracteres.",
      });
      return;
    }

    const payload = { user_id: user.id };

    if (dados.nome.trim() !== (user.name || "")) payload.name = dados.nome.trim();
    if (dados.telefone.trim() !== (user.phone || "")) payload.phone = dados.telefone.trim();

    if (!ehTecnico) {
      const farm = user.farm || {};
      if (dados.fazenda.trim() !== (farm.name || "")) payload.farm_name = dados.fazenda.trim();
      if (estadoSelecionado !== (farm.state || "")) payload.state = estadoSelecionado;
      if (cidadeSelecionada !== (farm.municipality || "")) payload.municipality = cidadeSelecionada;
      if (dados.localidade.trim() !== (farm.location || "")) {
        payload.location = dados.localidade.trim();
      }
    }

    if (Object.keys(payload).length === 1) {
      setMensagemFeedback({
        tipo: "alerta",
        texto: "Nenhuma alteração detetada para salvar.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.patch("users/profile/", payload);
      const updatedUser = response?.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        preencherDadosDoUsuario(updatedUser);
        setMensagemFeedback({
          tipo: "sucesso",
          texto: "Dados cadastrais atualizados com sucesso!",
        });
        setEditando({
          nome: false,
          telefone: false,
          localidade: false,
          fazenda: false,
        });
      } else {
        setMensagemFeedback({
          tipo: "erro",
          texto: "Não foi possível atualizar os dados do perfil.",
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Erro ao atualizar o perfil.";
      setMensagemFeedback({ tipo: "erro", texto: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoriaTexto = () => {
    if (dados.tipoTecnico === "estudante") return "Estudante";
    if (dados.tipoTecnico === "profissional") {
      return dados.isProfessor ? "Profissional / Professor(a)" : "Profissional";
    }
    return "Não informado";
  };

  return (
    <div className="home-page modo-confirmacao">
      <header id="cabecalho" className="cabecalho-confirmacao">
        <div className="cabecalho-esquerda">
          <button
            type="button"
            className="botao-menu-confirmacao"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            className="logo-confirmacao"
            onClick={() => navigate(ehTecnico ? "/homeTecnico" : "/home")}
            style={{ cursor: "pointer" }}
          >
            <img
              className="logo-texto"
              src={logoClara}
              alt="AnalisaAI"
              style={{ height: "30px", width: "auto" }}
            />
          </div>
        </div>
      </header>

      <main className="editar-perfil-container">
        <BotaoVoltarMenu/>
        <h2>Meu Perfil - Dados Cadastrais</h2>

        {loading ? (
          <div className="perfil-loading">
            <Loading />
            <p>A carregar informações do perfil...</p>
          </div>
        ) : (
          <section className="secao-dados">
            {mensagemFeedback.texto && (
              <div className={`banner-feedback feedback-${mensagemFeedback.tipo}`}>
                <p>{mensagemFeedback.texto}</p>
              </div>
            )}

            <form className="formulario-perfil" onSubmit={handleSubmit}>
              <div className="colunas-2">
                {/* COLUNA 1: DADOS PESSOAIS */}
                <div className="coluna-grupo">
                  <h3>Dados Pessoais</h3>

                  <div className="campo-com-botao">
                    <label htmlFor="nome">Nome</label>
                    <div className="input-botao-wrapper">
                      <input
                        type="text"
                        id="nome"
                        maxLength={LIMITE_NOME}
                        placeholder="Digite seu nome"
                        value={dados.nome}
                        disabled={!editando.nome}
                        onChange={(e) =>
                          handleChange("nome", apenasTexto(e.target.value, LIMITE_NOME))
                        }
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("nome")}
                      >
                        {editando.nome ? (
                          <>
                            <BsCheck /> Concluir
                          </>
                        ) : (
                          <>
                            <BsPencil /> Editar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="campo-com-botao">
                    <label htmlFor="telefone">Telefone</label>
                    <div className="input-botao-wrapper">
                      <input
                        type="text"
                        id="telefone"
                        maxLength={15}
                        placeholder="(xx) xxxxx-xxxx"
                        value={dados.telefone}
                        disabled={!editando.telefone}
                        onChange={(e) =>
                          handleChange("telefone", formatarTelefone(e.target.value))
                        }
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("telefone")}
                      >
                        {editando.telefone ? (
                          <>
                            <BsCheck /> Concluir
                          </>
                        ) : (
                          <>
                            <BsPencil /> Editar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="campo-com-botao">
                    <label htmlFor="senha">Senha</label>
                    <div className="input-botao-wrapper">
                      <input
                        type="password"
                        id="senha"
                        value="********"
                        disabled
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => navigate("/alterar-senha")}
                      >
                        <BsPencil /> Alterar
                      </button>
                    </div>
                  </div>
                </div>

                {/* COLUNA 2: PERFIL TÉCNICO OU DADOS DA PROPRIEDADE */}
                {ehTecnico ? (
                  <div className="coluna-grupo">
                    <h3>Perfil Técnico</h3>

                    <div className="campo-com-botao">
                      <label htmlFor="categoriaTecnico">Categoria</label>
                      <div className="input-botao-wrapper">
                        <input
                          type="text"
                          id="categoriaTecnico"
                          value={getCategoriaTexto()}
                          disabled
                        />
                      </div>
                    </div>

                    {(dados.tipoTecnico === "estudante" ||
                      (dados.tipoTecnico === "profissional" && dados.isProfessor)) && (
                      <div className="campo-com-botao">
                        <label htmlFor="instituicao">
                          {dados.tipoTecnico === "estudante"
                            ? "Instituição de Ensino"
                            : "Instituição onde leciona"}
                        </label>
                        <div className="input-botao-wrapper">
                          <input
                            type="text"
                            id="instituicao"
                            value={dados.instituicao || "Não informado"}
                            disabled
                          />
                        </div>
                      </div>
                    )}

                    {dados.tipoTecnico === "estudante" && (
                      <div className="campo-com-botao">
                        <label htmlFor="curso">Curso</label>
                        <div className="input-botao-wrapper">
                          <input
                            type="text"
                            id="curso"
                            value={dados.curso || "Não informado"}
                            disabled
                          />
                        </div>
                      </div>
                    )}

                    {dados.tipoTecnico === "profissional" && (
                      <>
                        <div className="campo-com-botao">
                          <label htmlFor="especialidade">Especialidade</label>
                          <div className="input-botao-wrapper">
                            <input
                              type="text"
                              id="especialidade"
                              value={dados.especialidade || "Não informado"}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="campo-com-botao">
                          <label htmlFor="qualificacao">
                            Formação ou Qualificação Profissional
                          </label>
                          <div className="input-botao-wrapper">
                            <input
                              type="text"
                              id="qualificacao"
                              value={dados.qualificacao || "Não informado"}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="campo-com-botao">
                          <label htmlFor="registroProfissional">Registro Profissional</label>
                          <div className="input-botao-wrapper">
                            <input
                              type="text"
                              id="registroProfissional"
                              value={dados.registroProfissional || "Não informado"}
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="coluna-grupo">
                    <h3>Dados da Propriedade</h3>

                    <div className="campo-com-botao">
                      <label htmlFor="fazenda">Nome da Fazenda</label>
                      <div className="input-botao-wrapper">
                        <input
                          type="text"
                          id="fazenda"
                          maxLength={LIMITE_FAZENDA}
                          placeholder="Nome da Fazenda"
                          value={dados.fazenda}
                          disabled={!editando.fazenda}
                          onChange={(e) =>
                            handleChange(
                              "fazenda",
                              apenasTexto(e.target.value, LIMITE_FAZENDA)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => toggleEditar("fazenda")}
                        >
                          {editando.fazenda ? (
                            <>
                              <BsCheck /> Concluir
                            </>
                          ) : (
                            <>
                              <BsPencil /> Editar
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="linha-dupla-select">
                      <div className="campo-sem-botao">
                        <label htmlFor="estado">Estado</label>
                        <select
                          id="estado"
                          value={estadoSelecionado}
                          onChange={(e) => {
                            setEstadoSelecionado(e.target.value);
                            setCidadeSelecionada("");
                          }}
                        >
                          <option value="">Selecione</option>
                          {estados.map((estado) => (
                            <option key={estado.id} value={estado.sigla}>
                              {estado.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="campo-sem-botao">
                        <label htmlFor="cidade">Município/Cidade</label>
                        <select
                          id="cidade"
                          value={cidadeSelecionada}
                          disabled={!estadoSelecionado}
                          onChange={(e) => setCidadeSelecionada(e.target.value)}
                        >
                          <option value="">Selecione</option>
                          {cidades.map((cidade) => (
                            <option key={cidade.id} value={cidade.nome}>
                              {cidade.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="campo-com-botao">
                      <label htmlFor="localidade">Localidade</label>
                      <div className="input-botao-wrapper">
                        <input
                          type="text"
                          id="localidade"
                          maxLength={LIMITE_LOCALIDADE}
                          placeholder="Nome da Localidade"
                          value={dados.localidade}
                          disabled={!editando.localidade}
                          onChange={(e) =>
                            handleChange(
                              "localidade",
                              apenasTexto(e.target.value, LIMITE_LOCALIDADE)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => toggleEditar("localidade")}
                        >
                          {editando.localidade ? (
                            <>
                              <BsCheck /> Concluir
                            </>
                          ) : (
                            <>
                              <BsPencil /> Editar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="botoes-finais">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={handleCancelar}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-salvar"
                  disabled={submitting}
                >
                  {submitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <MenuLateral menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
    </div>
  );
}