import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DrawerScreenProps as NavigationDrawerScreenProps } from "@react-navigation/drawer";
import type { NavigatorScreenParams } from "@react-navigation/native";
import type { MenuStackParamList } from "../../modules/menu/navigation/types";
import type { PreparationScreensStackParamList } from "../../modules/preparationScreens/navigation/PreparationScreensStackNavigator";
import type { AreasTablesStackParamList } from "../../modules/areasTables/navigation/types"; // Importar los tipos del nuevo stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ModifiersStackParamList = {
  ModifierGroupsScreen: undefined;
  ModifiersScreen: { groupId: string; groupName: string };
};

export type ModifiersStackScreenProps<T extends keyof ModifiersStackParamList> =
  NativeStackScreenProps<ModifiersStackParamList, T>;

export type AppDrawerParamList = {
  Welcome: undefined;
  Menu: NavigatorScreenParams<MenuStackParamList>;
  Modifiers: NavigatorScreenParams<ModifiersStackParamList>;
  PreparationScreens: NavigatorScreenParams<PreparationScreensStackParamList>;
  AreasTablesStack: NavigatorScreenParams<AreasTablesStackParamList>; // Añadir el nuevo stack al Drawer
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
        AreasTablesStackParamList {} // Añadir los parámetros del nuevo stack a RootParamList
  }
}
