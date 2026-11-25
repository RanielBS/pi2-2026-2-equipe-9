import { create } from "zustand";
import api from "../api/api";

const formatPhoneE164 = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
};

const normalizarPapel = (userData) => {
  const rawRole = (
    userData?.role ||
    userData?.user_type ||
    userData?.tipo ||
    ""
  ).toLowerCase();

  if (userData?.is_admin === true || ["admin", "administrator", "administrador"].includes(rawRole)) {
    return "admin";
  }

  if (
    userData?.is_technician === true ||
    ["tecnico", "technician"].includes(rawRole) ||
    Boolean(userData?.professional_register)
  ) {
    return "tecnico";
  }

  return "produtor";
};

const tokenInicial = localStorage.getItem("token") || null;

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: tokenInicial,
  isAuthenticated: Boolean(tokenInicial),
  loading: false,
  error: null,

  login: async (telefone, password) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("users/login/", {
        phone: formatPhoneE164(telefone),
        password,
      });

      const data = response.data;
      const userData = data.user || data;
      const tokenRecebido = data.token || data.access;

      const papelNormalizado = normalizarPapel(userData);

      const usuario = {
        ...userData,
        role: papelNormalizado,
        is_admin: userData.is_admin === true || papelNormalizado === "admin",
        is_technician: userData.is_technician === true || papelNormalizado === "tecnico",
      };

      if (tokenRecebido) {
        localStorage.setItem("token", tokenRecebido);
      }
      localStorage.setItem("user", JSON.stringify(usuario));

      set({
        user: usuario,
        token: tokenRecebido,
        isAuthenticated: Boolean(tokenRecebido),
        loading: false,
        error: null,
      });

      return usuario;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Erro ao realizar login.";
      set({ loading: false, error: msg });
      throw error;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });

    try {
      const formattedPayload = {
        ...payload,
        phone: formatPhoneE164(payload.phone),
        role: normalizarPapel(payload),
      };

      const response = await api.post("users/", formattedPayload);
      const data = response.data;

      set({ loading: false, error: null });

      return data;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Erro ao realizar cadastro.";
      set({ loading: false, error: msg });
      throw error;
    }
  },

  setUser: (user) => {
    if (user) {
      const papelNormalizado = normalizarPapel(user);
      const usuarioAtualizado = {
        ...user,
        role: papelNormalizado,
        is_admin: user.is_admin === true || papelNormalizado === "admin",
        is_technician: user.is_technician === true || papelNormalizado === "tecnico",
      };
      localStorage.setItem("user", JSON.stringify(usuarioAtualizado));
      set({ user: usuarioAtualizado });
    } else {
      localStorage.removeItem("user");
      set({ user: null });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));

export default useAuthStore;