// src/app/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps as NavigationDrawerScreenProps } from '@react-navigation/drawer'; // Renombrar para evitar colisión

// Tipos para el Stack de Autenticación (anterior RootStack)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Tipos para el Drawer Principal de la App
export type AppDrawerParamList = {
  Welcome: undefined;
  // Aquí añadirás más pantallas del drawer en el futuro, ej:
  // Profile: { userId: string };
  // Settings: undefined;
};

// Tipo genérico para las pantallas del Drawer
export type DrawerScreenProps<T extends keyof AppDrawerParamList> =
  NavigationDrawerScreenProps<AppDrawerParamList, T>;


// Actualiza el global para incluir ambos, aunque sólo uno estará activo a la vez
// Esto puede necesitar ajustes dependiendo de cómo gestiones la navegación anidada o global.
// Una alternativa es no extender globalmente o usar un tipo unión más complejo.
declare global {
  namespace ReactNavigation {
    // Podrías definir un RootParamList más complejo o mantenerlos separados
    // Por simplicidad, podemos declarar ambos aquí por ahora:
    interface RootParamList extends AuthStackParamList, AppDrawerParamList {}
  }
}
