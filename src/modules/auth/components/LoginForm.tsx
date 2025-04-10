import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Button, HelperText, Checkbox, TouchableRipple } from "react-native-paper"; // Añadir TouchableRipple
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
      // Añadir padding si es necesario para el toque
      // paddingVertical: 4,
      // Ajusta el margen según sea necesario, por ejemplo, si quieres espacio antes del botón
      marginTop: 8,
      marginBottom: 8,
      // Quitar padding horizontal si Checkbox.Item ya lo maneja bien
      // paddingHorizontal: -8, // Puede ser necesario ajustar para alinear con inputs
    },
    // Estilo para el componente Checkbox en sí (si es necesario)
    checkbox: {
      // marginRight: 8, // Espacio entre checkbox y texto
    },
    checkboxLabel: {
      // Estilo para el texto "Recordarme"
      color: theme.colors.onSurface, // Usar color del tema
      marginLeft: 8, // Espacio entre checkbox y texto
      // Asegurar que el texto sea presionable si está dentro de TouchableRipple
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
                <Text>{errors.emailOrUsername?.message}</Text>
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
                <Text>{errors.password?.message}</Text>
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Checkbox "Recordarme" añadido aquí */}
      {/* Reemplazar Checkbox.Item con Checkbox y Text dentro de TouchableRipple */}
      <TouchableRipple
        onPress={() => !isLoading && setRememberMe(!rememberMe)} // Hacer toda la fila presionable
        style={styles.checkboxContainer}
        disabled={isLoading}
      >
        <>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe(!rememberMe)} // onPress en Checkbox también por accesibilidad
            disabled={isLoading}
            // style={styles.checkbox} // Checkbox no acepta style directamente
            // color={theme.colors.primary} // Color cuando está marcado
            // uncheckedColor={theme.colors.onSurfaceVariant} // Color cuando está desmarcado
          />
          <Text style={styles.checkboxLabel} disabled={isLoading}>
            Recordarme
          </Text>
        </>
      </TouchableRipple>

      <Button
        mode="contained"
        // Actualizar la llamada para pasar rememberMe
        onPress={handleSubmit((data) => onSubmit(data, rememberMe))}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        <Text>{isLoading ? "Ingresando..." : "Ingresar"}</Text>
      </Button>
    </View>
  );
};

export default LoginForm;
