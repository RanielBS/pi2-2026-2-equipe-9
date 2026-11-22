import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import useAuthStore from "../../stores/authStore";
import MenuLateral from "../MenuLateral/MenuLateral";
import Loading from "../../components/Loading";

import logoClara from "../../assets/images/Logo-AnalisaAI.png";
import { BsPencil, BsCheck } from "react-icons/bs";

import "./EditarPerfil.css";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState({ tipo: "", texto: "" });

  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    localidade: "",
    fazenda: "",
  });

  const [editando, setEditando] = useState({
    nome: false,
    telefone: false,
    localidade: false,
    fazenda: false,
  });

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((res) => res.json())
      .then((dados) => {
        const ordenados = dados.sort((a, b) => a.nome.localeCompare(b.nome));
        setEstados(ordenados);
      })
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`)
      .then((res) => res.json())
      .then((dados) => {
        setCidades(dados);
      })
      .catch((err) => console.error("Erro ao carregar municípios:", err));
  }, [estadoSelecionado]);

  useEffect(() => {
    if (!user) return;

    setDados({
      nome: user.name || "",
      telefone: user.phone || "",
      localidade: user.farm?.location || "",
      fazenda: user.farm?.name || "",
    });

    setEstadoSelecionado(user.farm?.state || "");
    setCidadeSelecionada(user.farm?.municipality || "");
  }, [user]);

  const toggleEditar = (campo) => {
    setEditando((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleCancelar = () => {
    if (!user) return;

    setDados({
      nome: user.name || "",
      telefone: user.phone || "",
      localidade: user.farm?.location || "",
      fazenda: user.farm?.name || "",
    });

    setEstadoSelecionado(user.farm?.state || "");
    setCidadeSelecionada(user.farm?.municipality || "");
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

    const farm = user.farm || {};
    const payload = { user_id: user.id };

    if (dados.nome !== user.name) payload.name = dados.nome;
    if (dados.telefone !== user.phone) payload.phone = dados.telefone;
    if (dados.fazenda !== farm.name) payload.farm_name = dados.fazenda;
    if (estadoSelecionado !== farm.state) payload.state = estadoSelecionado;
    if (cidadeSelecionada !== farm.municipality) payload.municipality = cidadeSelecionada;
    if (dados.localidade !== farm.location) payload.location = dados.localidade;

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
        setMensagemFeedback({
          tipo: "sucesso",
          texto: "Dados cadastrais atualizados com sucesso!",
        });
        setDados({
          nome: updatedUser.name || "",
          telefone: updatedUser.phone || "",
          localidade: updatedUser.farm?.location || "",
          fazenda: updatedUser.farm?.name || "",
        });
        setEstadoSelecionado(updatedUser.farm?.state || "");
        setCidadeSelecionada(updatedUser.farm?.municipality || "");

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
            onClick={() => navigate("/home")}
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
                        placeholder="Digite seu nome"
                        value={dados.nome}
                        disabled={!editando.nome}
                        onChange={(e) => handleChange("nome", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("nome")}
                      >
                        {editando.nome ? <><BsCheck /> Concluir</> : <><BsPencil /> Editar</>}
                      </button>
                    </div>
                  </div>

                  <div className="campo-com-botao">
                    <label htmlFor="telefone">Telefone</label>
                    <div className="input-botao-wrapper">
                      <input
                        type="text"
                        id="telefone"
                        placeholder="(xx) xxxxx-xxxx"
                        value={dados.telefone}
                        disabled={!editando.telefone}
                        onChange={(e) => handleChange("telefone", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("telefone")}
                      >
                        {editando.telefone ? <><BsCheck /> Concluir</> : <><BsPencil /> Editar</>}
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

                {/* COLUNA 2: DADOS DA PROPRIEDADE */}
                <div className="coluna-grupo">
                  <h3>Dados da Propriedade</h3>

                  <div className="campo-com-botao">
                    <label htmlFor="fazenda">Nome da Fazenda</label>
                    <div className="input-botao-wrapper">
                      <input
                        type="text"
                        id="fazenda"
                        placeholder="Nome da Fazenda"
                        value={dados.fazenda}
                        disabled={!editando.fazenda}
                        onChange={(e) => handleChange("fazenda", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("fazenda")}
                      >
                        {editando.fazenda ? <><BsCheck /> Concluir</> : <><BsPencil /> Editar</>}
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
                        placeholder="Nome da Localidade"
                        value={dados.localidade}
                        disabled={!editando.localidade}
                        onChange={(e) => handleChange("localidade", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => toggleEditar("localidade")}
                      >
                        {editando.localidade ? <><BsCheck /> Concluir</> : <><BsPencil /> Editar</>}
                      </button>
                    </div>
                  </div>
                </div>
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