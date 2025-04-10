import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DrawerScreenProps as NavigationDrawerScreenProps } from "@react-navigation/drawer";
import type { NavigatorScreenParams } from "@react-navigation/native";
import type { MenuStackParamList } from "../../modules/menu/navigation/types";
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Definir el Stack para Modificadores
export type ModifiersStackParamList = {
  ModifierGroupsScreen: undefined; // Pantalla de lista de grupos
  ModifiersScreen: { groupId: string; groupName: string }; // Pantalla de modificadores hijos
};

// Helper type para las props de pantalla del Stack de Modificadores
export type ModifiersStackScreenProps<T extends keyof ModifiersStackParamList> =
  NativeStackScreenProps<ModifiersStackParamList, T>;

export type AppDrawerParamList = {
  Welcome: undefined;
  Menu: NavigatorScreenParams<MenuStackParamList>;
  Modifiers: NavigatorScreenParams<ModifiersStackParamList>; // Añadir Modifiers Stack al Drawer
};

export type DrawerScreenProps<T extends keyof AppDrawerParamList> =
  NavigationDrawerScreenProps<AppDrawerParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AuthStackParamList,
        AppDrawerParamList,
        ModifiersStackParamList {} // Incluir ModifiersStackParamList
  }
}
