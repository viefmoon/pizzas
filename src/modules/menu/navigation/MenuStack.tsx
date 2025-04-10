import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Platform } from "react-native";

import CategoriesScreen from "../screens/CategoriesScreen";
import SubcategoriesScreen from "../../subcategories/screens/SubcategoriesScreen"; // Importar la nueva pantalla

import { useAppTheme } from "../../../app/styles/theme";
import type { MenuStackParamList } from "./types.ts"; // Añadir extensión .ts

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuStack: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      // Opciones globales sin headerLeft
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          ...theme.fonts.titleLarge, // Reducir tamaño del título
          fontWeight: "bold",
        },
        // Quitar headerLeft de aquí
      }}
    >
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        // Añadir headerLeft específico para CategoriesScreen
        options={{
          title: "Categorías",
          headerLeft: (props) =>
            Platform.OS !== "web" ? (
              <DrawerToggleButton
                {...props}
                tintColor={theme.colors.onSurface}
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="SubCategoriesScreen"
        component={SubcategoriesScreen}
        // Configurar título dinámicamente usando los parámetros de ruta
        options={({ route }) => ({
          title: route.params?.categoryName
            ? `Subcategorías de ${route.params.categoryName}`
            : "Subcategorías",
        })}
      />
    </Stack.Navigator>
  );
};
