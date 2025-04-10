import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps as NavigationDrawerScreenProps } from '@react-navigation/drawer';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MenuStackParamList } from '../../modules/menu/navigation/types';
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type AppDrawerParamList = {
  Welcome: undefined;
   Menu: NavigatorScreenParams<MenuStackParamList>;
 };

export type DrawerScreenProps<T extends keyof AppDrawerParamList> =
  NavigationDrawerScreenProps<AppDrawerParamList, T>;


declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthStackParamList, AppDrawerParamList {}
  }
}
