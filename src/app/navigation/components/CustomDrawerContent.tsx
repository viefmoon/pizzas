import React from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem as NavigationDrawerItem,
} from "@react-navigation/drawer";
import {
  Drawer as PaperDrawer,
  Text,
  Avatar,
  Divider,
  Switch,
  TouchableRipple,
  Icon, // Importado Icon
} from "react-native-paper";
import { useThemeStore } from "../../store/themeStore";
import { THEME_MODE } from "../../types/theme.types";
import { useAuthStore } from "../../store/authStore";
import { useAppTheme } from "../../styles/theme";

import type { DrawerContentComponentProps } from "@react-navigation/drawer";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useAppTheme();
  const logout = useAuthStore((state) => state.logout);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      flexDirection: "row",
      alignItems: "center",
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
      marginTop: theme.spacing.s,
    },
    preference: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
    },
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.container}>
          <View style={styles.userInfoSection}>
            <Avatar.Icon
              size={64} // Aumentado de 52 a 64
              icon="account-circle"
              style={{ marginRight: theme.spacing.m }}
            />
            <View>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "bold",
                  fontSize: 18, // Añadido fontSize
                }}
              >
                Usuario Conectado
              </Text>
            </View>
          </View>

          <PaperDrawer.Section style={styles.drawerSection}>
            {/* Reemplazado PaperDrawer.Item con implementación manual */}
            <TouchableRipple
              onPress={() => {
                props.navigation.navigate("Menu", {
                  screen: "CategoriesScreen",
                });
              }}
              style={{
                // backgroundColor: props.state.routes[props.state.index]?.name === "Menu" ? theme.colors.secondaryContainer : 'transparent', // Eliminado estilo activo de fondo
                paddingHorizontal: 16, // Padding horizontal estándar
                paddingVertical: 12 + theme.spacing.s, // Padding vertical aumentado
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: theme.roundness * 2, // Añadido borde redondeado
                marginHorizontal: theme.spacing.s, // Añadido margen horizontal
              }}
              rippleColor={theme.colors.primary + '20'} // Color de ripple
            >
              <>
                {/* Envuelto Icon en View para aplicar margen */}
                <View style={{ marginRight: 32 }}>
                  <Icon
                    source="menu"
                    size={24} // Tamaño de icono estándar
                    color={props.state.routes[props.state.index]?.name === "Menu" ? theme.colors.primary : theme.colors.onSurfaceVariant} // Color de icono
                  />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: props.state.routes[props.state.index]?.name === "Menu" ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                  Menú
                </Text>
              </>
            </TouchableRipple>
          </PaperDrawer.Section>
        </View>
      </DrawerContentScrollView>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
        {/* Reemplazado PaperDrawer.Item con implementación manual */}
        <TouchableRipple
          onPress={() => {
            logout();
          }}
          style={{
            // backgroundColor: 'transparent', // No necesita estado activo
            paddingHorizontal: 16, // Padding horizontal estándar
            paddingVertical: 12 + theme.spacing.s, // Padding vertical aumentado
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: theme.roundness * 2, // Añadido borde redondeado
            marginHorizontal: theme.spacing.s, // Añadido margen horizontal
          }}
          rippleColor={theme.colors.primary + '20'} // Color de ripple
        >
          <>
            {/* Envuelto Icon en View para aplicar margen */}
            <View style={{ marginRight: 32 }}>
              <Icon
                source="logout"
                size={24} // Tamaño de icono estándar
                color={theme.colors.onSurfaceVariant} // Color de icono
              />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: theme.colors.onSurfaceVariant }}>
              Cerrar Sesión
            </Text>
          </>
        </TouchableRipple>
      </PaperDrawer.Section>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
        <TouchableRipple
          onPress={() => {
            const newPreference = theme.dark
              ? THEME_MODE.LIGHT
              : THEME_MODE.DARK;
            setThemePreference(newPreference);
          }}
        >
          <View style={styles.preference}>
            <Text
              variant="labelLarge"
              style={{
                color: theme.colors.onSurfaceVariant,
                fontWeight: "500",
                fontSize: 16, // Añadido fontSize
              }}
            >
              Modo Oscuro
            </Text>
            <View style={{ transform: [{ scale: 1.1 }] }}> // Envuelto en View para escalar
              <Switch
                value={theme.dark}
                onValueChange={() => {
                  const newPreference = theme.dark
                    ? THEME_MODE.LIGHT
                    : THEME_MODE.DARK;
                  setThemePreference(newPreference);
                }}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </TouchableRipple>
      </PaperDrawer.Section>
    </View>
  );
}
