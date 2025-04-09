// src/app/navigation/components/CustomDrawerContent.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList, // Útil si quieres mostrar items autogenerados por las screens del Drawer
  DrawerItem as NavigationDrawerItem, // Renombrar para claridad
} from "@react-navigation/drawer";
import {
  Drawer as PaperDrawer,
  Text,
  Avatar,
  Divider,
  Switch,
  TouchableRipple,
} from "react-native-paper"; // Importar componentes de Paper y otros necesarios
import { useThemeStore } from "../../store/themeStore"; // Importar store
import { THEME_MODE } from "../../types/theme.types"; // Importar modos desde types
import { useAuthStore } from "../../store/authStore";
import { useAppTheme } from "../../styles/theme"; // Usa tu hook de tema

// Importa los tipos correctos si necesitas props de navegación aquí
import type { DrawerContentComponentProps } from "@react-navigation/drawer";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useAppTheme(); // Obtener el tema actual
  const logout = useAuthStore((state) => state.logout);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  // Podrías obtener info del usuario del store si la guardas allí
  // const user = useAuthStore((state) => state.user);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      // backgroundColor: theme.colors.primaryContainer, // Eliminado para un look más limpio
      flexDirection: "row", // Alinear avatar y texto horizontalmente
      alignItems: "center", // Centrar verticalmente
    },
    title: {
      marginTop: theme.spacing.s,
      fontWeight: "bold",
      color: theme.colors.onPrimaryContainer,
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
      color: theme.colors.onPrimaryContainer,
    },
    drawerSection: {
      marginTop: theme.spacing.m,
    },
    bottomDrawerSection: {
      marginBottom: theme.spacing.m,
      // borderTopColor: theme.colors.outlineVariant, // Eliminado
      // borderTopWidth: 1, // Eliminado
      marginTop: theme.spacing.s, // Pequeño espacio arriba para separar de lo anterior
    },
    preference: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center", // Alinear items verticalmente
    },
    // No necesitamos drawerItemLabel aquí si usamos el theme
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface /* Fondo general del drawer */,
      }}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.container}>
          {/* Sección de Info de Usuario (Opcional) */}
          <View style={styles.userInfoSection}>
            {/* Ajuste: Usar un tamaño menor y quitar fondo explícito si no se desea */}
            <Avatar.Icon
              size={48}
              icon="account-circle"
              style={{ marginRight: theme.spacing.m }}
            />
            <View>
              {/* Si tuvieras datos del usuario: */}
              {/* <Text style={styles.title}>Nombre Usuario</Text>
              <Text style={styles.caption}>@username</Text> */}
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                Usuario Conectado
              </Text>
            </View>
          </View>

          {/* <Divider /> Eliminado */}

          {/* Sección de Navegación Principal */}
          <PaperDrawer.Section style={styles.drawerSection}>
            {/* Ítem de Bienvenida */}
            <PaperDrawer.Item
              label="Bienvenida"
              icon="home-outline" // O el icono que prefieras
              active={props.state.routes[props.state.index]?.name === "Welcome"} // Determina si está activo
              onPress={() => {
                props.navigation.navigate("Welcome");
              }}
              // Añadir estilo para quitar fondo activo
              style={
                props.state.routes[props.state.index]?.name === "Welcome"
                  ? { backgroundColor: "transparent" }
                  : {}
              }
              theme={theme} // Pasa el tema para que use los colores y fuentes correctos
            />
            {/* Puedes añadir más items aquí si es necesario */}
          </PaperDrawer.Section>

          {/* Sección de preferencias duplicada eliminada */}
    
          {/* Sección de preferencias duplicada eliminada correctamente */}

          {/* Puedes usar DrawerItemList si quieres items autogenerados (menos control) */}
          {/* <DrawerItemList {...props} /> */}

          {/* La sección de preferencias se movió abajo */}
        </View>
      </DrawerContentScrollView>

      {/* Sección Inferior Fija (Logout) - Ahora antes de Preferencias */}
      <PaperDrawer.Section style={styles.bottomDrawerSection}>
        <PaperDrawer.Item
          label="Cerrar Sesión"
          icon="logout" // O 'exit-to-app'
          onPress={() => {
            logout(); // Llama a la función de logout del store
          }}
          theme={theme} // Pasa el tema
        />
      </PaperDrawer.Section>

      {/* Sección de Preferencias (Movida al final) */}
      <PaperDrawer.Section style={styles.bottomDrawerSection}>
         {/* Se quita el title="Preferencias" */}
         <TouchableRipple onPress={() => {
           // Cambiar al tema opuesto al actual
           const newPreference = theme.dark ? THEME_MODE.LIGHT : THEME_MODE.DARK;
           setThemePreference(newPreference);
         }}>
           <View style={styles.preference}>
             <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Modo Oscuro</Text>
             {/* El Switch refleja el estado actual del tema activo */}
             <Switch value={theme.dark} onValueChange={() => {
               const newPreference = theme.dark ? THEME_MODE.LIGHT : THEME_MODE.DARK;
               setThemePreference(newPreference);
             }} color={theme.colors.primary} />
           </View>
         </TouchableRipple>
       </PaperDrawer.Section>
    </View>
  );
}
