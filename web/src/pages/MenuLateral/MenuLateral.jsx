import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import "./MenuLateral.css";
import logo from "../../assets/images/Logo-AnalisaAI.png";
import iconMenu from "../../assets/images/icon-menu.png";
import iconHome from "../../assets/images/icon-home.png";
import iconEdit from "../../assets/images/icon-edit-person.png";
import iconHistorico from "../../assets/images/icon-historico.png";
import iconLogout from "../../assets/images/icon-logout.png";

export default function MenuLateral({ menuAberto, setMenuAberto }) {
  const fechar = () => setMenuAberto(false);
  const { user } = useAuthStore();

  const userRole = (user?.role || user?.user_type || user?.tipo || "produtor").toLowerCase();

  const ehTecnico =
    user?.is_technician === true ||
    ["technician", "tecnico"].includes(userRole) ||
    Boolean(user?.professional_register);

  const isTechnicianOrAdmin =
    ehTecnico || user?.is_admin === true || userRole === "admin";

  // Define a rota inicial de acordo com o perfil do usuário
  const getHomeRoute = () => {
    if (user?.is_admin === true || userRole === "admin") {
      return "/admin";
    }
    if (ehTecnico) {
      return "/homeTecnico";
    }
    return "/home";
  };

  const homeRoute = getHomeRoute();

  // Formata o texto do crachá de perfil para exibição visual
  const getRoleBadgeLabel = () => {
    if (ehTecnico) {
      return "Técnico Agrícola";
    }
    if (user?.is_admin === true || userRole === "admin") {
      return "Administrador";
    }
    return "Produtor Rural";
  };

  // Função para tratar o clique caso o usuário não tenha permissão (Acesso Negado)
  const handleRestrictedClick = (e, allowed) => {
    if (!allowed) {
      e.preventDefault();
      alert("Acesso Negado: Esta funcionalidade é restrita para Técnicos e Administradores.");
    } else {
      fechar();
    }
  };

  return (
    <>
      {menuAberto && (
        <div className="menu-overlay" onClick={fechar} />
      )}

      <nav
        id="menu-lateral"
        className={menuAberto ? "menu-aberto" : "menu-fechado"}
      >
        <div className="menu-header">
          <img className="menu-logo" src={logo} alt="Logo" />
          <img
            className="menu-fechar"
            src={iconMenu}
            alt="Fechar"
            onClick={fechar}
          />
        </div>

        {/* IDENTIFICAÇÃO DA CONTA LOGADA (BADGE DE PERFIL) */}
        {user && (
          <div className="menu-user-badge">
            <span className="user-badge-name">{user.name || "Usuário"}</span>
            <span className="user-badge-role">{getRoleBadgeLabel()}</span>
          </div>
        )}

        <p className="menu-titulo">Menu</p>

        <ul className="menu-opcoes">
          <li className="opcao-item">
            <Link to={homeRoute} className="link-wrapper" onClick={fechar}>
              <img className="menu-icon" src={iconHome} alt="" />
              <span>Início</span>
            </Link>
          </li>

          {/* FILA DE TRABALHO: Exibida para todos, mas apagada/bloqueada para não-técnicos */}
          <li className={`opcao-item ${!isTechnicianOrAdmin ? "opcao-bloqueada" : ""}`}>
            <Link
              to={isTechnicianOrAdmin ? "/fila-trabalho" : "#"}
              className="link-wrapper"
              onClick={(e) => handleRestrictedClick(e, isTechnicianOrAdmin)}
            >
              <img className="menu-icon" src={iconHistorico} alt="" />
              <span>Fila de Trabalho {!isTechnicianOrAdmin && "🔒"}</span>
            </Link>
          </li>

          <li className="opcao-item">
            <Link to="/editar-perfil" className="link-wrapper" onClick={fechar}>
              <img className="menu-icon" src={iconEdit} alt="" />
              <span>Editar Perfil</span>
            </Link>
          </li>

          <li className="opcao-item">
            <Link to="/historico" className="link-wrapper" onClick={fechar}>
              <img className="menu-icon" src={iconHistorico} alt="" />
              <span>Histórico</span>
            </Link>
          </li>
        </ul>

        <div className="menu-rodape">
          <hr className="menu-divisor" />
          <ul className="menu-opcoes">
            <li className="opcao-item sair">
              <Link to="/" className="link-wrapper link-sair" onClick={fechar}>
                <img className="menu-icon" src={iconLogout} alt="" />
                <span>Sair</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}