import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native"; // Para navegar después del login
import { useAppTheme } from "../../styles/theme"; // Importamos useAppTheme en lugar de useTheme

import LoginForm from "../../components/auth/LoginForm";
import apiClient from "../../services/apiClient"; // Cambiado a importación por defecto
import {
  AuthEmailLoginDto,
  LoginResponseDto,
  LoginFormInputs,
} from "../../types/auth";
import { useSnackbarStore } from "../../store/snackbarStore"; // Importamos el store del Snackbar global

const LoginScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation(); // Hook de navegación
  const { showSnackbar } = useSnackbarStore(); // Usamos el Snackbar global

  // --- Lógica de Mutación (React Query) ---
  const loginMutation = useMutation<
    LoginResponseDto, // Tipo de la respuesta exitosa
    Error, // Tipo del error
    LoginFormInputs // Tipo de las variables de entrada (datos del formulario)
  >({
    mutationFn: async (loginData: LoginFormInputs) => {
      // Determinar si es email o username
      const isEmail = loginData.emailOrUsername.includes("@");
      const payload: AuthEmailLoginDto = {
        password: loginData.password,
        ...(isEmail
          ? { email: loginData.emailOrUsername }
          : { username: loginData.emailOrUsername }),
      };

      // Realizar la petición POST al endpoint de login
      const response = await apiClient.post<LoginResponseDto>(
        "/auth/email/login",
        payload
      );

      // Apisauce envuelve la respuesta. Verificamos si fue exitosa.
      if (!response.ok || !response.data) {
        // Intentar obtener un mensaje de error más específico si está disponible
        const apiError =
          (response.data as any)?.errors?.auth ||
          (response.data as any)?.errors?.password ||
          "credentialsIncorrect";
        // Mapear errores del backend a mensajes amigables
        const errorMessages: { [key: string]: string } = {
          credentialsIncorrect: "Usuario o contraseña incorrectos.",
          incorrectPassword: "La contraseña es incorrecta.",
          // Añadir otros mapeos si es necesario
        };
        throw new Error(errorMessages[apiError] || "Error al iniciar sesión.");
      }
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);

      // Mostrar mensaje de éxito con el Snackbar global
      showSnackbar({
        message: "¡Inicio de sesión exitoso!",
        type: "success",
      });

      // Invalidar queries relacionadas con el usuario si es necesario
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      // Navegar a la pantalla principal de la aplicación
      // Reemplaza 'MainAppStack' con el nombre de tu stack/pantalla principal
      // navigation.reset({ index: 0, routes: [{ name: 'MainAppStack' }] });
      console.log("Navegación pendiente a la pantalla principal");
    },
    onError: (error) => {
      console.error("Login error:", error);

      // Mostrar mensaje de error con el Snackbar global
      showSnackbar({
        message: error.message || "Ocurrió un error inesperado.",
        type: "error",
        duration: 6000, // Duración más larga para errores
      });
    },
  });
  // --- Fin Lógica de Mutación ---

  const handleLogin = (data: LoginFormInputs) => {
    loginMutation.mutate(data); // Ejecutar la mutación con los datos del formulario
  };

  // Estilos que dependen del tema
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    title: {
      textAlign: "center",
      marginBottom: 24,
      color: theme.colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text variant="headlineMedium" style={styles.title}>
          Iniciar Sesión
        </Text>
        <LoginForm onSubmit={handleLogin} isLoading={loginMutation.isPending} />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
