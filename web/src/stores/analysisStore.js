
import { create } from "zustand";
import api from "../api/api";

const useAnalysisStore = create((set) => ({
  loading: false,
  error: null,

  analysis: null,
  searchRequestId: null,
  analysisHistory: [],

  // Novos dados da revisão técnica
  pendingAnalyses: [],

  createAnalysis: async (image, userId) => {
    set({ loading: true, error: null });

    try {
      const payload = {
        image,
        userId,
      };

      const response = await api.post("analysis/", payload);
      const data = response.data;

      set({
        analysis: data.analysis_results,
        searchRequestId: data.search_request_id,
        loading: false,
      });

      return data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Erro ao analisar imagem",
        loading: false,
      });

      throw err;
    }
  },

  fetchAnalysisHistory: async (userId) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("analysis/", {
        params: {
          userId,
        },
      });

      const data = response.data;

      set({
        analysisHistory: data,
        loading: false,
      });

      return data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Erro ao buscar histórico de análises",
        loading: false,
      });

      throw err;
    }
  },

  fetchAnalysisById: async (searchRequestId, userId) => {
    set({ loading: true, error: null });

    try {
      const response = await api.get(`analysis/${searchRequestId}/`, {
        params: {
          userId,
        },
      });

      const data = response.data;

      set({
        analysis: data.analysis_results.map((result) => ({
          ...result,
          image: data.image,
        })),
        searchRequestId: data.search_request_id,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Erro ao buscar análise",
        loading: false,
      });

      throw err;
    }
  },

  // GET /api/analysis/pending/
  fetchPendingAnalyses: async () => {
    set({ loading: true, error: null });

    try {
      const response = await api.get("analysis/pending/");

      set({
        pendingAnalyses: response.data,
        loading: false,
      });

      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Erro ao buscar análises pendentes",
        loading: false,
      });

      throw err;
    }
  },

  // PATCH /api/analysis/{id}/review/
  submitTechnicalReview: async (id, payload) => {
    set({ loading: true, error: null });

    try {
      const response = await api.patch(`analysis/${id}/review/`, payload);

      set((state) => ({
        pendingAnalyses: state.pendingAnalyses.filter(
          (analysis) => String(analysis.id) !== String(id)
        ),
        loading: false,
      }));

      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Erro ao enviar revisão técnica",
        loading: false,
      });

      throw err;
    }
  },
}));

export default useAnalysisStore;
