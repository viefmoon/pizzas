import React, { useState, useEffect } from "react"; // Añadir useState y useEffect
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator, // Añadir ActivityIndicator
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
import EncryptedStorage from 'react-native-encrypted-storage'; // Importar EncryptedStorage
import { STORAGE_KEYS } from "../../../app/constants/storageKeys"; // Importar las claves
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../../../app/styles/theme";
import { useSnackbarStore } from "../../../app/store/snackbarStore";
import { getApiErrorMessage } from "../../../app/lib/errorMapping";
import { ApiError } from "../../../app/lib/errors";
import { useThemeStore } from "../../../app/store/themeStore";
import { useAuthStore } from "../../../app/store/authStore";
import { LoginFormInputs, LoginResponseDto } from "../types/auth.types"; // Corregido: Quitado LoginRequestDto
import { authService } from "../services/authService";
import LoginForm from "../components/LoginForm";

const LoginScreen = () => {
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { showSnackbar } = useSnackbarStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const setToken = useAuthStore((state) => state.setToken);

  // Estados para credenciales iniciales y carga
  const [initialEmailOrUsername, setInitialEmailOrUsername] = useState<string | undefined>(undefined);
  const [initialPassword, setInitialPassword] = useState<string | undefined>(undefined); // Estado para la contraseña inicial
  const [initialRememberMe, setInitialRememberMe] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true); // Estado de carga

  // Definir un tipo que incluya rememberMe para las variables de la mutación
  type LoginMutationVariables = LoginFormInputs & { rememberMe: boolean };

  // Mutación de login - Actualizar tipo de variables
  const loginMutation = useMutation<LoginResponseDto, Error, LoginMutationVariables>({
    // La función de mutación solo necesita los datos de login, no rememberMe
    mutationFn: (variables) => authService.login({
        emailOrUsername: variables.emailOrUsername,
        password: variables.password
    }),
    onSuccess: async (data, variables) => { // Recibir 'variables' aquí
      try {
        await setToken(data.token); // Guardar token primero
        const { emailOrUsername, password, rememberMe } = variables; // Obtener datos de las variables

        if (rememberMe) {
          const credentialsToSave = JSON.stringify({ emailOrUsername, password });
          await EncryptedStorage.setItem(STORAGE_KEYS.REMEMBERED_CREDENTIALS, credentialsToSave);
          await EncryptedStorage.setItem(STORAGE_KEYS.REMEMBER_ME_ENABLED, 'true');
          console.log("Credenciales guardadas.");
        } else {
          // Si no se marca "Recordarme", eliminar credenciales previas si existen
          await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBERED_CREDENTIALS);
          await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBER_ME_ENABLED);
          console.log("Preferencia 'Recordarme' desactivada, credenciales eliminadas.");
        }

        showSnackbar({
          message: `¡Bienvenido!`,
          type: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      } catch (error) {
        console.error("Error al procesar post-login o guardar credenciales:", error);
        // Asegurarse de limpiar credenciales si algo falla después de setToken
        try {
            await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBERED_CREDENTIALS);
            await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBER_ME_ENABLED);
        } catch (cleanupError) {
            console.error("Error al limpiar credenciales durante el manejo de error:", cleanupError);
        }
        showSnackbar({
          message: "Error procesando el inicio de sesión.",
          type: "error",
        });
      }
    },
    onError: (error: unknown) => {
      const userMessage = getApiErrorMessage(error);
      showSnackbar({
        message: userMessage,
        type: "error",
        duration: 5000,
      });
      console.error("Login failed:", error);
      if (error instanceof ApiError) {
         console.error("API Error Details:", { code: error.code, status: error.status, details: error.details });
      }
      // Podríamos considerar limpiar credenciales aquí también si el login falla,
      // aunque si falla el login, onSuccess no se ejecuta.
      // Depende de si queremos limpiar explícitamente en caso de fallo de login.
      // Por ahora, lo dejamos así, se limpian si onSuccess falla o en logout.
    },
  });

  // Actualizar para aceptar rememberMe, aunque aún no lo usemos en la mutación hasta Fase 2
  const handleLoginSubmit = (data: LoginFormInputs, rememberMe: boolean) => {
    // Pasar tanto los datos del formulario como rememberMe a la mutación
    loginMutation.mutate({ ...data, rememberMe });
  };

  // useEffect para cargar credenciales al montar
  useEffect(() => {
    const loadCredentials = async () => {
      setIsLoadingCredentials(true); // Iniciar carga
      try {
        const rememberEnabled = await EncryptedStorage.getItem(STORAGE_KEYS.REMEMBER_ME_ENABLED);
        if (rememberEnabled === 'true') {
          const storedCredentialsJson = await EncryptedStorage.getItem(STORAGE_KEYS.REMEMBERED_CREDENTIALS);
          if (storedCredentialsJson) {
            const storedCredentials = JSON.parse(storedCredentialsJson);
            setInitialEmailOrUsername(storedCredentials.emailOrUsername);
            setInitialPassword(storedCredentials.password); // Asegurarse de cargar la contraseña
            setInitialRememberMe(true); // Marcar el checkbox si se encontraron credenciales
          } else {
            // Si remember está habilitado pero no hay credenciales (caso raro), limpiar
            setInitialRememberMe(false);
            setInitialEmailOrUsername('');
            setInitialPassword(''); // Limpiar contraseña si no hay credenciales
            await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBER_ME_ENABLED); // Limpiar preferencia inconsistente
          }
        } else {
           // Si no está habilitado, asegurarse de que todo esté limpio
           setInitialRememberMe(false);
           setInitialEmailOrUsername('');
           setInitialPassword(''); // Limpiar contraseña si no está habilitado
           // No es necesario remover aquí, ya se hace en login/logout si no está marcado
        }
      } catch (error) {
        console.error("Error al cargar credenciales recordadas:", error);
        // Resetear en caso de error para evitar estado inconsistente
        setInitialRememberMe(false);
        setInitialEmailOrUsername('');
        setInitialPassword(''); // Limpiar contraseña en caso de error
        // Considerar limpiar storage si hay error de parseo, etc.
        try {
            await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBERED_CREDENTIALS);
            await EncryptedStorage.removeItem(STORAGE_KEYS.REMEMBER_ME_ENABLED);
        } catch (cleanupError) {
             console.error("Error al limpiar credenciales durante manejo de error de carga:", cleanupError);
        }
      } finally {
         setIsLoadingCredentials(false); // Terminar carga
      }
    };

    loadCredentials();
  }, []); // Ejecutar solo al montar

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

  // Mostrar indicador de carga mientras se obtienen las credenciales
  if (isLoadingCredentials) {
     return (
       <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color={theme.colors.primary} />
       </SafeAreaView>
     );
  }

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
                  onSubmit={handleLoginSubmit} // Ya tiene la nueva firma
                  isLoading={loginMutation.isPending}
                  // Pasar los valores iniciales cargados al formulario
                  initialEmailOrUsername={initialEmailOrUsername}
                  initialPassword={initialPassword} // Pasar contraseña inicial
                  initialRememberMe={initialRememberMe}
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
