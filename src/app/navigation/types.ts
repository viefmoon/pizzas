import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DrawerScreenProps as NavigationDrawerScreenProps } from "@react-navigation/drawer";
import type { NavigatorScreenParams } from "@react-navigation/native";
import type { MenuStackParamList } from "../../modules/menu/navigation/types";
import type { PreparationScreensStackParamList } from "../../modules/preparationScreens/navigation/types"; // Corregido: Importar desde types.ts
import type { AreasTablesStackParamList } from "../../modules/areasTables/navigation/types"; // Importar los tipos del nuevo stack
export type AuthStackParamList = {
  Login: undefined;
  // Register: undefined; // Comentado si no se usa
};

// Tipos para el Stack de Órdenes
export type OrdersStackParamList = {
  Orders: undefined; // Pantalla principal del módulo de órdenes
  CreateOrder: undefined; // Pantalla para crear una nueva orden
  // Add other screens for the orders module here, e.g.:
  // OrderDetail: { orderId: string };
};

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> =
  NativeStackScreenProps<OrdersStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ModifiersStackParamList = {
  ModifierGroupsScreen: undefined;
  ModifiersScreen: { groupId: string; groupName: string };
};

export type ModifiersStackScreenProps<T extends keyof ModifiersStackParamList> =
  NativeStackScreenProps<ModifiersStackParamList, T>;

export type AppDrawerParamList = {
  Welcome: undefined; // Mantener si existe una pantalla de bienvenida
  MenuStack: NavigatorScreenParams<MenuStackParamList>; // Renombrado
  ModifiersStack: NavigatorScreenParams<ModifiersStackParamList>; // Renombrado
  PreparationScreensStack: NavigatorScreenParams<PreparationScreensStackParamList>; // Renombrado para consistencia
  AreasTablesStack: NavigatorScreenParams<AreasTablesStackParamList>; // Añadir el nuevo stack al Drawer
  OrdersStack: NavigatorScreenParams<OrdersStackParamList>; // Añadir el stack de órdenes al Drawer
};

export type DrawerScreenProps<T extends keyof AppDrawerParamList> =
  NavigationDrawerScreenProps<AppDrawerParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AuthStackParamList,
        AppDrawerParamList,
        ModifiersStackParamList,
        PreparationScreensStackParamList,
        AreasTablesStackParamList,
        OrdersStackParamList {} // Añadir los parámetros del stack de órdenes a RootParamList
 }
}
