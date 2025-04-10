import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Platform } from "react-native";

import CategoriesScreen from "../screens/CategoriesScreen";
import SubcategoriesScreen from "../../subcategories/screens/SubcategoriesScreen";
import ProductsScreen from "../../products/screens/ProductsScreen";
import { useAppTheme } from "../../../app/styles/theme";
import type { MenuStackParamList } from "./types.ts";

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuStack: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
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
        options={({ route }) => ({
          title: route.params?.categoryName
            ? `Subcategorías de ${route.params.categoryName}`
            : "Subcategorías",
        })}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={({ route }) => ({
          title: route.params?.subCategoryName
            ? `Productos de ${route.params.subCategoryName}`
            : "Productos",
        })}
      />
    </Stack.Navigator>
  );
};
