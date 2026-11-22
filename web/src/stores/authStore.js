
import { create } from "zustand";
import api from "../api/api";

const usuarioSalvo = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const tokenSalvo = localStorage.getItem("token");

const useAuthStore = create((set) => ({
  user: usuarioSalvo(),
  token: tokenSalvo,
  loading: false,

  login: async (telefone, password) => {
    set({ loading: true });

    try {
      const response = await api.post("users/login/", {
        phone: telefone,
        password,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        loading: false,
      });

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ loading: true });

    try {
      const response = await api.post("users/", payload);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
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
