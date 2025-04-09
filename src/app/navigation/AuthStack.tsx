import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppTheme } from "../styles/theme";

import LoginScreen from "../../modules/auth/screens/LoginScreen";
import RegisterScreen from "../../modules/auth/screens/RegisterScreen";
import type { AuthStackParamList } from "./types"; // Cambiado de RootStackParamList

const Stack = createNativeStackNavigator<AuthStackParamList>(); // Cambiado de RootStackParamList

export function AuthStack() {
  // Cambiado de RootStack
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Iniciar Sesión",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Registro",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
