// Store para manejar el estado del Snackbar global
import { create } from "zustand";

export type SnackbarType = "info" | "success" | "error" | "warning";

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration?: number;
  showSnackbar: (params: {
    message: string;
    type?: SnackbarType;
    duration?: number;
  }) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: "",
  type: "info",
  duration: 3000,
  showSnackbar: ({ message, type = "info", duration = 3000 }) =>
    set({ visible: true, message, type, duration }),
  hideSnackbar: () => set({ visible: false }),
}));
