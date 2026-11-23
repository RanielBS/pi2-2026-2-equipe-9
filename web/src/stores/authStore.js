
import { create } from "zustand";
import api from "../api/api";

const formatPhoneE164 = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
};

const normalizarPapel = (role) => {
  if (["tecnico", "technician"].includes(role)) {
    return "tecnico";
  }

  return "produtor";
};

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,

  login: async (telefone, password) => {
    set({ loading: true });

    try {
      const response = await api.post("users/login/", {
        phone: formatPhoneE164(telefone),
        password,
      });

      const data = response.data;
      const userData = data.user || data;

      const usuario = {
        ...userData,
        role: normalizarPapel(userData.role),
      };

      set({
        user: usuario,
        token: data.token,
        loading: false,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(usuario));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ loading: true });

    try {
      const formattedPayload = {
        ...payload,
        phone: formatPhoneE164(payload.phone),
        role: normalizarPapel(payload.role),
      };

      const response = await api.post("users/", formattedPayload);
      const data = response.data;

      set({ loading: false });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setUser: (user) => {
    set({ user });

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
    });
  },
}));

export default useAuthStore;
