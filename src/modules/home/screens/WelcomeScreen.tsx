// src/modules/home/screens/WelcomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import { useAppTheme } from '../../../app/styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrawerScreenProps } from '@react-navigation/drawer'; // Importa el tipo correcto
import type { AppDrawerParamList } from '../../../app/navigation/types'; // Ajusta la ruta si es necesario

// Usa DrawerScreenProps con los tipos correctos
type Props = DrawerScreenProps<AppDrawerParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.m,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
       {/* Appbar con botón para abrir el drawer */}
       <Appbar.Header elevated>
         {/* Botón para abrir/cerrar el drawer */}
         <Appbar.Action
           icon="menu"
           onPress={() => navigation.toggleDrawer()} // Usa navigation.toggleDrawer()
         />
         <Appbar.Content title="Bienvenida" />
       </Appbar.Header>
       <View style={styles.content}>
         <Text variant="headlineMedium">¡Bienvenido a la App!</Text>
         <Text variant="bodyLarge" style={{ marginTop: theme.spacing.m, textAlign: 'center' }}>
           Este es el contenido principal después de iniciar sesión. Puedes explorar desde el menú lateral.
         </Text>
       </View>
    </SafeAreaView>
  );
}