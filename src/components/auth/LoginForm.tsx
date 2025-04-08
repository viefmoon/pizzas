import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';

// Esquema de validación con Zod
const loginSchema = z.object({
  // Permitir email o username, refinar luego si es necesario validar formato específico
  emailOrUsername: z.string().min(1, 'El correo o nombre de usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Inferir el tipo de los inputs desde el esquema Zod
type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormInputs) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const theme = useTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Estilos que dependen del tema
  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    input: {
      marginBottom: 8,
      // backgroundColor: theme.colors.surface, // TextInput de Paper maneja su fondo basado en el modo y tema
    },
    button: {
      marginTop: 16,
    },
    helperText: {
      // El color del HelperText tipo 'error' se maneja por el tema
      marginBottom: 8,
    },
  });

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
              <HelperText type="error" visible={!!errors.emailOrUsername} style={styles.helperText}>
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
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={toggleSecureEntry}
                  forceTextInputFocus={false} // Evita que el input gane foco al tocar el icono
                  color={errors.password ? theme.colors.error : undefined} // Cambia color del icono si hay error
                />
              }
              disabled={isLoading}
            />
            {/* Corrección: Usar && para renderizado condicional */}
            {errors.password && (
              <HelperText type="error" visible={!!errors.password} style={styles.helperText}>
                {errors.password?.message}
              </HelperText>
            )}
          </View>
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </View>
  );
};

export default LoginForm;