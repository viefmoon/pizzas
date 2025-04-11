import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Eliminamos importaciones innecesarias: useNavigation, DrawerActions, IconButton, NativeStackNavigationProp, AppDrawerParamList
import { useAppTheme } from "../../../app/styles/theme";
import type { MenuStackParamList } from "./types.ts";

import CategoriesScreen from "../screens/CategoriesScreen";
import SubcategoriesScreen from "../../subcategories/screens/SubcategoriesScreen";
import ProductsScreen from "../../products/screens/ProductsScreen";

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuStackNavigator: React.FC = () => {
  const theme = useAppTheme();
  // Eliminamos el hook useNavigation que ya no es necesario

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        headerTintColor: theme.colors.onSurface, 
        headerTitleStyle: {
          ...theme.fonts.titleMedium,
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        options={{
          title: "Categorías",
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
