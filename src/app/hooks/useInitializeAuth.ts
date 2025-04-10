import { useEffect, useState } from "react";
import { useAuthStore, initializeAuthStore } from "../store/authStore";

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Llamar a la nueva función de inicialización que maneja ambos tokens
        await initializeAuthStore();
      } catch (error) {
        // initializeAuthStore ya maneja sus propios errores internos y el estado
        console.error("Error llamando a initializeAuthStore:", error);
      } finally {
        // Marcar la inicialización como completa independientemente del resultado
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  return isInitializing;
}
