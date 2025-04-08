// Store para manejar el estado del Snackbar global
import { create } from "zustand";

export type SnackbarType = "default" | "success" | "error" | "warning" | "info";

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };

  // Acciones para manipular el estado
  showSnackbar: (params: {
    message: string;
    type?: SnackbarType;
    duration?: number;
    action?: { label: string; onPress: () => void };
  }) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: "",
  type: "default",

  showSnackbar: ({ message, type = "default", duration, action }) => {
    set({
      visible: true,
      message,
      type,
      duration,
      action,
    });
  },

  hideSnackbar: () => {
    set({ visible: false });
  },
}));
