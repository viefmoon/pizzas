import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { NavigatorScreenParams } from '@react-navigation/native';
import { AppDrawerParamList } from '../../../app/navigation/types'; // Importar tipos globales del Drawer

// Parámetros que cada pantalla del stack puede recibir
export type AreasTablesStackParamList = {
  AreasList: undefined; // La pantalla de lista de áreas no recibe parámetros
  TablesList: { areaId: string; areaName: string }; // La pantalla de mesas recibe el ID y nombre del área padre
};

// Props para las pantallas dentro de este Stack
export type AreasListScreenProps = NativeStackScreenProps<
  AreasTablesStackParamList,
  'AreasList'
>;
export type TablesListScreenProps = NativeStackScreenProps<
  AreasTablesStackParamList,
  'TablesList'
>;

// Props para la entrada del Drawer que navega a este Stack
// Esto anida los parámetros del Stack dentro de los parámetros del Drawer
export type AreasTablesDrawerScreenProps = DrawerScreenProps<
  AppDrawerParamList,
  'AreasTablesStack' // Nombre que le daremos en el Drawer
>;

// NOTA: Recuerda añadir 'AreasTablesStack: NavigatorScreenParams<AreasTablesStackParamList>;'
// a la definición de AppDrawerParamList en 'src/app/navigation/types.ts'