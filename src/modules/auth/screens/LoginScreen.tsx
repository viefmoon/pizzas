import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  IconButton,
  Surface,
  TouchableRipple,
  Button,
} from "react-native-paper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../../app/styles/theme";
import { useSnackbarStore } from "../../../app/store/snackbarStore";
import { useThemeStore } from "../../../app/store/themeStore";
import { useAuthStore } from "../../../app/store/authStore";
import { LoginFormInputs, LoginResponseDto } from "../types/auth.types";
import { authService } from "../services/authService";
import LoginForm from "../components/LoginForm";

const LoginScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { showSnackbar } = useSnackbarStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const setToken = useAuthStore((state) => state.setToken);

  // Mutación de login
  const loginMutation = useMutation<LoginResponseDto, Error, LoginFormInputs>({
    mutationFn: (loginData) => authService.login(loginData),
    onSuccess: async (data) => {
      try {
        await setToken(data.token);
        showSnackbar({
          message: `¡Bienvenido!`,
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["user", "me"] });
        // TODO: Implementar navegación a la pantalla principal
        console.log("Navegación pendiente a la pantalla principal");
      } catch (error) {
        console.error("Error al guardar token:", error);
        showSnackbar({
          message: "Error procesando el inicio de sesión.",
          type: "error",
        });
      }
    },
    onError: (error) => {
      showSnackbar({
        message:
          error.message ||
          "Error al iniciar sesión. Por favor, intenta de nuevo.",
        type: "error",
        duration: 5000,
      });
    },
  });

  const handleLoginSubmit = (data: LoginFormInputs) => {
    loginMutation.mutate(data);
  };

  const toggleTheme = () => {
    setThemePreference(theme.dark ? "light" : "dark");
  };

  // Estilos memoizados que dependen del tema
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollView: {
          flexGrow: 1,
        },
        container: {
          flex: 1,
          padding: 24,
          justifyContent: "space-between",
        },
        logoContainer: {
          alignItems: "center",
          marginTop: 30,
          marginBottom: 5,
        },
        logo: {
          width: 120,
          height: 120,
          marginBottom: 16,
        },
        title: {
          fontSize: 32,
          fontWeight: "bold",
          color: theme.colors.primary,
          marginBottom: 8,
          textAlign: "center",
        },
        subtitle: {
          fontSize: 16,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 20,
          textAlign: "center",
          paddingHorizontal: 20,
        },
        formContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 24,
          elevation: 2,
          marginBottom: 16,
        },
        forgotPassword: {
          color: theme.colors.primary,
          textAlign: "right",
          marginTop: 8,
          marginBottom: 16,
        },
        registerContainer: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
        },
        registerText: {
          color: theme.colors.onSurfaceVariant,
          marginRight: 8,
        },
        registerLink: {
          color: theme.colors.primary,
          fontWeight: "bold",
        },
        bottomThemeToggleContainer: {
          alignItems: "center",
          marginTop: 20,
          marginBottom: 16,
        },
      }),
    [theme]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Sección Superior (Logo, Títulos) */}
            <View>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../../assets/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>¡Bienvenido!</Text>
                <Text style={styles.subtitle}>
                  Inicia sesión para gestionar tus pedidos
                </Text>
              </View>

              <Surface style={styles.formContainer}>
                <LoginForm
                  onSubmit={handleLoginSubmit}
                  isLoading={loginMutation.isPending}
                />
              </Surface>

              <TouchableRipple
                onPress={() => console.log("Olvidé mi contraseña")}
              >
                <Text style={styles.forgotPassword}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableRipple>
            </View>

            {/* Sección Inferior (Registro, Cambio de Tema) */}
            <View>
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
                <TouchableRipple
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.registerLink}>Regístrate</Text>
                </TouchableRipple>
              </View>
              <View style={styles.bottomThemeToggleContainer}>
                <IconButton
                  icon={theme.dark ? "weather-night" : "weather-sunny"}
                  size={28}
                  onPress={toggleTheme}
                  iconColor={theme.colors.onSurfaceVariant}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
