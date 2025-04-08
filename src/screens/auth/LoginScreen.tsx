import React from "react"; 
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  IconButton,
  Surface,
  Switch,
  TextInput,
  Button,
  HelperText,
  TouchableRipple,
  Divider,
  useTheme,
} from "react-native-paper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../styles/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSnackbarStore } from "../../store/snackbarStore";
import { useThemeStore } from "../../store/themeStore";
import { LoginFormInputs, LoginResponseDto } from "../../types/auth";
import { authService } from "../../services/authService";

const LoginScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { showSnackbar } = useSnackbarStore();
  const { themePreference, setThemePreference } = useThemeStore();

  // Estado del formulario
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  // Validación de email
  const emailError = React.useMemo(() => {
    if (!email) return "";
    return !email.includes("@") ? "Correo electrónico inválido" : "";
  }, [email]);

  // Cambio de tema
  const toggleTheme = () => {
    setThemePreference(theme.dark ? "light" : "dark");
  };

  // Mutación de login
  const loginMutation = useMutation<LoginResponseDto, Error, LoginFormInputs>({
    mutationFn: (loginData) => authService.login(loginData),
    onSuccess: (data) => {
      showSnackbar({
        message: "¡Bienvenido de vuelta!",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      // Navegar a la pantalla principal
      console.log("Navegación pendiente a la pantalla principal");
    },
    onError: (error) => {
      showSnackbar({
        message:
          error.message ||
          "Error al iniciar sesión. Por favor, intenta de nuevo.",
        type: "error",
        duration: 6000,
      });
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      showSnackbar({
        message: "Por favor, completa todos los campos",
        type: "error",
      });
      return;
    }

    if (emailError) {
      showSnackbar({
        message: emailError,
        type: "error",
      });
      return;
    }

    loginMutation.mutate({ emailOrUsername: email, password });
  };

  const styles = StyleSheet.create({
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
    },
    // Estilos header, themeContainer y themeIcon eliminados
    bottomThemeToggleContainer: { // Nuevo estilo para el botón de tema inferior
      alignItems: "center", // Centrar el botón
      marginTop: 20, // Reducido
      marginBottom: 16, // Margen inferior
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 30, // Reducido
      marginBottom: 5, // Reducido
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
      marginBottom: 20, // Reducido
      textAlign: "center",
      paddingHorizontal: 20,
    },
    formContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      elevation: 2,
      marginBottom: 16, // Reducido
    },
    input: {
      marginBottom: 12, // Reducido
    },
    rememberMeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16, // Reducido
    },
    rememberMeText: {
      color: theme.colors.onSurfaceVariant,
    },
    forgotPassword: {
      color: theme.colors.primary,
    },
    loginButton: {
      marginBottom: 12, // Reducido
      paddingVertical: 6,
    },
    // Estilos de divisor y botones sociales eliminados
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20, // Reducido
    },
    registerText: {
      color: theme.colors.onSurfaceVariant,
      marginRight: 8,
    },
    registerLink: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header eliminado */}
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              {/* Surface eliminado para mostrar el logo directamente */}
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>¡Bienvenido!</Text>
              <Text style={styles.subtitle}>
                Inicia sesión para acceder a tu cuenta y gestionar tus pedidos
              </Text>
            </View>

            <Surface style={styles.formContainer}>
              <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
                error={!!emailError}
                left={<TextInput.Icon icon="email" />}
              />
              {emailError ? (
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>
              ) : null}

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <View style={styles.rememberMeContainer}>
                <TouchableRipple onPress={() => setRememberMe(!rememberMe)}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Switch value={rememberMe} onValueChange={setRememberMe} />
                    <Text style={styles.rememberMeText}>Recordarme</Text>
                  </View>
                </TouchableRipple>
                <TouchableRipple
                  onPress={() => console.log("Olvidé mi contraseña")}
                >
                  <Text style={styles.forgotPassword}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableRipple>
              </View>

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                Iniciar Sesión
              </Button>

              {/* Sección de divisor y botones sociales eliminada */}
            </Surface>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
              <TouchableRipple
                onPress={() => console.log("Navegar a registro")}
              >
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableRipple>
            </View>
          </View>

          {/* Botón de cambio de tema movido al final y simplificado */}
          <View style={styles.bottomThemeToggleContainer}>
            <IconButton
              icon={theme.dark ? "weather-night" : "weather-sunny"}
              size={28} // Tamaño un poco mayor para mejor toque
              onPress={toggleTheme}
              iconColor={theme.colors.onSurfaceVariant} // Color discreto
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
