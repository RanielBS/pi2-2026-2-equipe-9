
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import EditarPerfil from "../pages/EditarPerfil/EditarPerfil";
import AlterarSenha from "../pages/EditarPerfil/AlterarSenha/AlterarSenha";
import Historico from "../pages/Historico/Historico";
import Retorno from "../pages/Retorno/Retorno";
import Resultado from "../pages/Resultado/Resultado";

import CadastroProdutor from "../pages/Cadastro/CadastroProdutor";
import Propriedade from "../pages/Cadastro/Propriedade";
import OpcoesCad from "../pages/Cadastro/OpcoesCad";
import CadastroTecnico from "../pages/Cadastro/CadastroTecnico";

import Admin from "../pages/Admin/Admin";
import CadastroAdmin from "../pages/Admin/CadastroAdmin/CadastroAdmin";
import ListUsers from "../pages/Admin/ListUsers/ListUsers";

import TecnicoFilaTrabalho from "../pages/TecnicoFilaTrabalho/TecnicoFilaTrabalho";
import TecnicoRevisaoDiagnostico from "../pages/TecnicoRevisaoDiagnostico/TecnicoRevisaoDiagnostico";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<OpcoesCad />} />
      <Route path="/cadastroProdutor" element={<CadastroProdutor />} />
      <Route path="/opcoesCadastro" element={<OpcoesCad />} />
      <Route path="/cadastroTecnico" element={<CadastroTecnico />} />
      <Route path="/propriedade" element={<Propriedade />} />

      {/* Rotas do produtor */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-perfil"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <EditarPerfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alterar-senha"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <AlterarSenha />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historico"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <Historico />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retorno/:id"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <Retorno />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resultado/:id"
        element={
          <ProtectedRoute allowedRoles={["produtor"]}>
            <Resultado />
          </ProtectedRoute>
        }
      />

      {/* Rotas do técnico */}
      <Route
        path="/fila-tecnico"
        element={
          <ProtectedRoute allowedRoles={["tecnico"]}>
            <TecnicoFilaTrabalho />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fila-trabalho"
        element={
          <ProtectedRoute allowedRoles={["tecnico"]}>
            <TecnicoFilaTrabalho />
          </ProtectedRoute>
        }
      />
      <Route
        path="/revisao-diagnostico"
        element={
          <ProtectedRoute allowedRoles={["tecnico"]}>
            <TecnicoRevisaoDiagnostico />
          </ProtectedRoute>
        }
      />

      {/* Rotas do administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cadastroAdmin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CadastroAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listUsers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ListUsers />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
