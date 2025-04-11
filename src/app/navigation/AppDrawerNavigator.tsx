import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MenuStack } from "../../modules/menu/navigation/MenuStack";
import ModifiersStackNavigator from "../../modules/modifiers/navigation/ModifiersStackNavigator";
import PreparationScreensStackNavigator from "../../modules/preparationScreens/navigation/PreparationScreensStackNavigator";
import AreasTablesStackNavigator from "../../modules/areasTables/navigation/AreasTablesStackNavigator"; // Importar el nuevo stack
import { CustomDrawerContent } from "./components/CustomDrawerContent";
import { useAppTheme } from "../styles/theme";
import type { AppDrawerParamList } from "./types";

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          height: 50,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
          fontWeight: "bold",
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          ...theme.fonts.labelLarge,
          fontWeight: "500",
        },
        drawerItemStyle: {
          marginVertical: theme.spacing.xs,
        },
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="Menu"
        component={MenuStack}
        options={{
          title: "Menú",
        }}
      />
      <Drawer.Screen
        name="Modifiers"
        component={ModifiersStackNavigator}
        options={{
          title: "Modificadores",
        }}
      />
      <Drawer.Screen
        name="PreparationScreens"
        component={PreparationScreensStackNavigator}
        options={{
          title: "Pantallas Preparación",
        }}
      />
      <Drawer.Screen
        name="AreasTablesStack" // Nombre definido en los tipos globales
        component={AreasTablesStackNavigator}
        options={{
          title: "Áreas y Mesas", // Título que se mostrará en el Drawer
        }}
      />
    </Drawer.Navigator>
  );
}
