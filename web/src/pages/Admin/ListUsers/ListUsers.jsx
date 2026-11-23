
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Admin.css";
import "./ListUsers.css";
import BotaoMenu from "../../../components/MenuSusp";
import api from "../../../api/api";
import useAuthStore from "../../../stores/authStore";

const userStatusLabels = {
  0: "Inativo",
  1: "Ativo",
  2: "Bloqueado",
};

const approvalStatusLabels = {
  nao_exigida: "Não exigida",
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const technicianTypeLabels = {
  estudante: "Estudante",
  profissional: "Profissional",
};

export default function ListUsers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState(null);

  async function fetchUsers() {
    if (!user?.id) return;

    try {
      const response = await api.get("users/", {
        params: { requested_by: user.id },
      });

      setUsers(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Não foi possível carregar os usuários."
      );
    }
  }

  async function fetchAdmins() {
    if (!user?.id) return;

    try {
      const response = await api.get("users/admins/list/", {
        params: { requested_by: user.id },
      });

      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao carregar administradores:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Não foi possível carregar os administradores."
      );
    }
  }

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchAdmins()]);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, [user?.id]);

  const producers = users.filter(
    (item) => item.role === "produtor"
  );

  const technicians = users.filter(
    (item) => item.role === "tecnico"
  );

  const pendingTechnicians = technicians.filter(
    (item) => item.approval_status === "pendente"
  );

  async function toggleStatus(targetUser) {
    if (!user?.id) return;

    const newStatus = targetUser.status === 1 ? 2 : 1;

    try {
      await api.patch("users/status/", {
        requested_by: user.id,
        user_id: targetUser.id,
        status: newStatus,
      });

      await fetchAll();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erro ao atualizar a situação da conta."
      );
    }
  }

  async function reviewTechnician(technician, approvalStatus) {
    const action =
      approvalStatus === "aprovado" ? "aprovar" : "rejeitar";

    const confirmed = window.confirm(
      `Deseja realmente ${action} o cadastro técnico de ${technician.name}?`
    );

    if (!confirmed) return;

    setProcessingId(technician.id);

    try {
      await api.patch(
        `users/${technician.id}/approval/`,
        {
          approval_status: approvalStatus,
        }
      );

      alert(
        `Cadastro técnico de ${technician.name} atualizado com sucesso.`
      );

      await fetchUsers();
    } catch (err) {
      console.error("Erro ao revisar técnico:", err);

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Não foi possível atualizar o cadastro técnico."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function renderAccountStatus(status) {
    return userStatusLabels[status] || "Desconhecido";
  }

  function renderApprovalStatus(status) {
    return approvalStatusLabels[status] || "Desconhecido";
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Painel de Controle - Administrador</h2>

        <div className="Functions-Admin">
          <button
            className="voltar"
            onClick={() => navigate("/admin")}
          >
            Voltar
          </button>

          <button
            className="btn-logout"
            id="btn-logout"
            onClick={() => navigate("/")}
          >
            Sair
          </button>
        </div>
      </header>

      <main>
        {error && (
          <p className="error-message">{error}</p>
        )}

        {/* PRODUTORES */}
        <div className="admin-card admin-card-users">
          <div className="title">
            <h3 className="analise">Produtores</h3>
            <p className="card-number">{producers.length}</p>
          </div>

          <div className="listagem">
            <div className="element">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Propriedade</th>
                    <th>Município</th>
                    <th>Situação da conta</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">Carregando produtores...</td>
                    </tr>
                  ) : producers.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        Nenhum produtor encontrado.
                      </td>
                    </tr>
                  ) : (
                    producers.map((producer) => (
                      <tr key={producer.id}>
                        <td>#{producer.id}</td>
                        <td>{producer.name}</td>
                        <td>{producer.phone || "-"}</td>
                        <td>{producer.farm?.name || "-"}</td>
                        <td>{producer.farm?.municipality || "-"}</td>
                        <td>
                          {renderAccountStatus(producer.status)}
                        </td>
                        <td>
                          <BotaoMenu
                            currentStatus={producer.status}
                            onToggleStatus={() => toggleStatus(producer)}
                            label="Ações"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TÉCNICOS */}
        <div className="admin-card admin-card-users">
          <div className="title">
            <h3 className="analise">Técnicos</h3>
            <p className="card-number">{technicians.length}</p>
          </div>

          <div className="listagem">
            <div className="element">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Tipo</th>
                    <th>Instituição</th>
                    <th>Curso</th>
                    <th>Registro profissional</th>
                    <th>Especialidade</th>
                    <th>Aprovação</th>
                    <th>Situação da conta</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11">Carregando técnicos...</td>
                    </tr>
                  ) : technicians.length === 0 ? (
                    <tr>
                      <td colSpan="11">
                        Nenhum técnico encontrado.
                      </td>
                    </tr>
                  ) : (
                    technicians.map((technician) => {
                      const profile = technician.technician_profile;

                      return (
                        <tr key={technician.id}>
                          <td>#{technician.id}</td>
                          <td>{technician.name}</td>
                          <td>{technician.phone || "-"}</td>
                          <td>
                            {technicianTypeLabels[
                              profile?.technician_type
                            ] || "-"}
                          </td>
                          <td>{profile?.institution || "-"}</td>
                          <td>{profile?.course || "-"}</td>
                          <td>
                            {technician.professional_register || "-"}
                          </td>
                          <td>{technician.specialty || "-"}</td>
                          <td>
                            {renderApprovalStatus(
                              technician.approval_status
                            )}
                          </td>
                          <td>
                            {renderAccountStatus(technician.status)}
                          </td>
                          <td>
                            {technician.approval_status === "pendente" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={processingId === technician.id}
                                  onClick={() =>
                                    reviewTechnician(
                                      technician,
                                      "aprovado"
                                    )
                                  }
                                >
                                  {processingId === technician.id
                                    ? "Processando..."
                                    : "Aprovar"}
                                </button>

                                <button
                                  type="button"
                                  disabled={processingId === technician.id}
                                  onClick={() =>
                                    reviewTechnician(
                                      technician,
                                      "rejeitado"
                                    )
                                  }
                                >
                                  Rejeitar
                                </button>
                              </>
                            ) : (
                              <BotaoMenu
                                currentStatus={technician.status}
                                onToggleStatus={() =>
                                  toggleStatus(technician)
                                }
                                label="Conta"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ADMINISTRADORES */}
        <div className="admin-card admin-card-users">
          <div className="title">
            <h3 className="analise">Administradores</h3>
            <p className="card-number">{admins.length}</p>
          </div>

          <div className="listagem">
            <div className="element">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Situação da conta</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">
                        Carregando administradores...
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        Nenhum administrador encontrado.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>#{admin.id}</td>
                        <td>{admin.name}</td>
                        <td>{admin.phone || "-"}</td>
                        <td>
                          {renderAccountStatus(admin.status)}
                        </td>
                        <td>
                          <BotaoMenu
                            currentStatus={admin.status}
                            onToggleStatus={() => toggleStatus(admin)}
                            label="Ações"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
