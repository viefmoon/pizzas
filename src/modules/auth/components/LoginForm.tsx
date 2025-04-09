import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Button, HelperText, Checkbox } from "react-native-paper"; // Corregido: Quitado View as PaperView
import { useAppTheme } from "../../../app/styles/theme";

// Esquema de validación con Zod
const loginSchema = z.object({
  // Permitir email o username, refinar luego si es necesario validar formato específico
  emailOrUsername: z
    .string()
    .min(1, "El correo o nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Inferir el tipo de los inputs desde el esquema Zod
type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormInputs, rememberMe: boolean) => void; // Añadido rememberMe
  isLoading: boolean;
  initialEmailOrUsername?: string; // Añadido valor inicial
  initialPassword?: string;        // Añadido valor inicial para contraseña
  initialRememberMe?: boolean;     // Añadido valor inicial
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  initialEmailOrUsername = '', // Valor por defecto
  initialPassword = '',        // Valor por defecto
  initialRememberMe = false,   // Valor por defecto
}) => {
  const theme = useAppTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(initialRememberMe); // Usa el valor inicial

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Añadido reset para el useEffect opcional
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: initialEmailOrUsername, // Usar valor inicial
      password: initialPassword, // Usar contraseña inicial
    },
  });

  // Opcional: Si defaultValues no funciona bien con carga asíncrona
  // Opcional: Si defaultValues no funciona bien con carga asíncrona,
  // actualizamos ambos campos aquí.
  React.useEffect(() => {
     // Solo resetea si hay valores iniciales (evita resetear a vacío si no hay nada guardado)
     if (initialEmailOrUsername || initialPassword) {
        reset({
            emailOrUsername: initialEmailOrUsername || '', // Usa valor o vacío
            password: initialPassword || '' // Usa valor o vacío
        });
     }
  }, [initialEmailOrUsername, initialPassword, reset]); // Añadir initialPassword a dependencias

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Estilos que dependen del tema (usamos React.useMemo porque ahora dependen de theme)
  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      width: "100%",
    },
    input: {
      marginBottom: 8,
    },
    button: {
      marginTop: 16, // Ajustar si es necesario por el checkbox
    },
    helperText: {
      marginBottom: 8,
    },
    // Nuevos estilos para el Checkbox
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // Ajusta el margen según sea necesario, por ejemplo, si quieres espacio antes del botón
      marginTop: 8,
      marginBottom: 8,
      // Quitar padding horizontal si Checkbox.Item ya lo maneja bien
      // paddingHorizontal: -8, // Puede ser necesario ajustar para alinear con inputs
    },
    checkboxItem: {
      // Puedes ajustar padding aquí si es necesario, por ejemplo, para reducir espacio
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    checkboxLabel: {
      // Estilo para el texto "Recordarme"
      color: theme.colors.onSurface, // Usar color del tema
      // Quitar margen si Checkbox.Item lo maneja
      // marginLeft: -8, // Puede ser necesario ajustar
    },
  }), [theme]); // Dependencia del tema

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="emailOrUsername"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Correo o Usuario"
              mode="outlined" // O 'flat' según preferencia de diseño
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.emailOrUsername}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address" // Asume email como más común, pero permite username
              disabled={isLoading}
            />
            {/* Corrección: Usar && para renderizado condicional */}
            {errors.emailOrUsername && (
              <HelperText
                type="error"
                visible={!!errors.emailOrUsername}
                style={styles.helperText}
              >
                {errors.emailOrUsername?.message}
              </HelperText>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Contraseña"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={secureTextEntry}
              error={!!errors.password}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye" : "eye-off"}
                  onPress={toggleSecureEntry}
                  forceTextInputFocus={false} // Evita que el input gane foco al tocar el icono
                  color={errors.password ? theme.colors.error : undefined} // Cambia color del icono si hay error
                />
              }
              disabled={isLoading}
            />
            {/* Corrección: Usar && para renderizado condicional */}
            {errors.password && (
              <HelperText
                type="error"
                visible={!!errors.password}
                style={styles.helperText}
              >
                {errors.password?.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Checkbox "Recordarme" añadido aquí */}
      <View style={styles.checkboxContainer}> {/* Corregido: Usar View de react-native */}
        <Checkbox.Item
            label="Recordarme"
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe(!rememberMe)}
            position="leading" // Icono a la izquierda del texto
            labelStyle={styles.checkboxLabel}
            style={styles.checkboxItem}
            disabled={isLoading}
            // Ajusta el color del checkbox si es necesario
            // color={theme.colors.primary} // Color cuando está marcado
            // uncheckedColor={theme.colors.onSurfaceVariant} // Color cuando está desmarcado
        />
      </View> {/* Corregido: Etiqueta de cierre */}

      <Button
        mode="contained"
        // Actualizar la llamada para pasar rememberMe
        onPress={handleSubmit((data) => onSubmit(data, rememberMe))}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? "Ingresando..." : "Ingresar"}
      </Button>
    </View>
  );
};

export default LoginForm;
