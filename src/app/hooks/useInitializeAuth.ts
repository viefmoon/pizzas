import { useEffect, useState } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useAuthStore } from '../store/authStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
// Opcional: Importa tu apiClient si vas a validar el token con la API
// import apiClient from '../services/apiClient';
// import { ApiError } from '../lib/errors'; // Si usas ApiError

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  // Usar la acción 'setAuthState' que acabamos de añadir al store
  const setAuthState = useAuthStore(state => state.setAuthState);
  // También podríamos necesitar 'logout' para limpiar todo si la validación falla
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await EncryptedStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (token) {
          console.log('Token encontrado, intentando restaurar sesión...');

          // --- Opción 1: Simple (Asume que el token es válido si existe) ---
          // ¡CUIDADO! Menos seguro, el token podría haber expirado en el backend.
          setAuthState({ token, isAuthenticated: true });
          console.log('Sesión restaurada (sin validación de token).');

          // --- Opción 2: Validar Token con API (Recomendado) ---
          /* Descomenta este bloque para usar la validación con API
          try {
            // Configura temporalmente el header para la llamada de validación
            apiClient.setHeader('Authorization', `Bearer ${token}`);
            // Llama a un endpoint protegido, como obtener datos del usuario
            const response = await apiClient.get('/api/v1/users/me'); // Ajusta el endpoint

            if (response.ok) {
              console.log('Token validado con API, sesión restaurada.');
              // El token es válido, actualiza el estado en el store
              setAuthState({ token, isAuthenticated: true });
            } else {
              // El token no es válido (expirado, revocado, etc.)
              console.warn('Token inválido o expirado según API, limpiando...');
              await logout(); // Llama a logout para limpiar token y credenciales recordadas
            }
          } catch (validationError) {
             console.error('Error validando el token con la API:', validationError);
             // Si la validación falla (ej. error de red), cierra sesión por seguridad
             await logout();
          } finally {
             // Limpia el header temporal si lo usaste (importante si apiClient es un singleton)
             apiClient.deleteHeader('Authorization');
          }
          */

        } else {
          console.log('No hay token almacenado.');
          // Asegurarse de que el estado esté como no autenticado si no hay token
          // (Aunque el estado inicial ya es false, esto es una doble verificación)
          if (useAuthStore.getState().isAuthenticated) {
             setAuthState({ token: null, isAuthenticated: false });
          }
        }
      } catch (error) {
        console.error('Error durante la inicialización de la autenticación:', error);
        // En caso de cualquier error leyendo el storage, asegurar estado no autenticado
        setAuthState({ token: null, isAuthenticated: false });
      } finally {
        // Marca la inicialización como completada independientemente del resultado
        setIsInitializing(false);
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar el componente raíz

  return isInitializing;
}