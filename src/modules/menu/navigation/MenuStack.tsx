import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Platform } from "react-native";

import CategoriesScreen from "../screens/CategoriesScreen";

import { useAppTheme } from "../../../app/styles/theme";
import type { MenuStackParamList } from "./types";

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
        headerTitleStyle: {},
        headerLeft: (props) =>
          Platform.OS !== "web" ? (
            <DrawerToggleButton {...props} tintColor={theme.colors.onSurface} />
          ) : null,
      }}
    >
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoriesScreen}
        options={{
          title: "Categorías",
        }}
      />
    </Stack.Navigator>
  );
};
