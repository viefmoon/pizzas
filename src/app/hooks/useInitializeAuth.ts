import { useEffect, useState } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useAuthStore } from '../store/authStore';
import { STORAGE_KEYS } from '../constants/storageKeys';

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuthState = useAuthStore(state => state.setAuthState);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await EncryptedStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (token) {
          console.log('Token encontrado, intentando restaurar sesión...');

          setAuthState({ token, isAuthenticated: true });
          console.log('Sesión restaurada (sin validación de token).');


        } else {
          console.log('No hay token almacenado.');
          if (useAuthStore.getState().isAuthenticated) {
             setAuthState({ token: null, isAuthenticated: false });
          }
        }
      } catch (error) {
        console.error('Error durante la inicialización de la autenticación:', error);
        setAuthState({ token: null, isAuthenticated: false });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isInitializing;
}