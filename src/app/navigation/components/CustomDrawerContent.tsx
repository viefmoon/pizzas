import React from "react";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
  Drawer as PaperDrawer,
  Text,
  Divider,
  Switch,
  TouchableRipple,
  Icon,
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
  const user = useAuthStore((state) => state.user);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    userInfoSection: {
      paddingLeft: theme.spacing.l,
      paddingRight: theme.spacing.m,
      paddingVertical: theme.spacing.m,
    },
    title: {
      fontWeight: "bold",
      color: theme.colors.onSurface,
      fontSize: 16,
      marginBottom: 2,
    },
    caption: {
      fontSize: 14,
      lineHeight: 16,
      color: theme.colors.onSurfaceVariant,
    },
    drawerSection: {
      marginTop: theme.spacing.m,
    },
    bottomDrawerSection: {
      marginBottom: theme.spacing.m,
      marginTop: 'auto',
      borderTopColor: theme.colors.outlineVariant,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingTop: theme.spacing.s,
    },
    preference: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    drawerItemLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    drawerItemContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12 + theme.spacing.s,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: theme.roundness * 2,
        marginHorizontal: theme.spacing.s,
    },
    drawerItemIconContainer: {
        marginRight: 32
    }
  });

  const getItemColor = (routeName: string) => {
      const currentRoute = props.state.routes[props.state.index];
      return currentRoute?.name === routeName
          ? theme.colors.primary
          : theme.colors.onSurfaceVariant;
  };

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
            <View style={{ flex: 1 }}>
              {user ? (
                <>
                  <Text
                    variant="titleMedium"
                    style={styles.title}
                    numberOfLines={1}
                  >
                    {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'Usuario'}
                  </Text>
                  <Text style={styles.caption} numberOfLines={1}>
                    Rol: {user.role?.name ?? 'Desconocido'}
                  </Text>
                  <Text style={styles.caption} numberOfLines={1}>
                    {user.email ?? ''}
                  </Text>
                  <Text style={styles.caption} numberOfLines={1}>
                    @{user.username ?? 'username'}
                  </Text>
                </>
              ) : (
                <Text variant="titleMedium" style={styles.title}>
                  Invitado
                </Text>
              )}
            </View>
          </View>
          <Divider style={{ marginVertical: theme.spacing.s }} />

          <PaperDrawer.Section style={styles.drawerSection}>
            <TouchableRipple
              onPress={() => { props.navigation.navigate("Menu", { screen: "CategoriesScreen" }); }}
              style={styles.drawerItemContainer}
              rippleColor={theme.colors.primary + "20"}
            >
              <>
                <View style={styles.drawerItemIconContainer}>
                  <Icon source="menu" size={24} color={getItemColor("Menu")} />
                </View>
                <Text style={[styles.drawerItemLabel, { color: getItemColor("Menu") }]}>
                  Menú
                </Text>
              </>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => { props.navigation.navigate("Modifiers", { screen: "ModifierGroupsScreen" }); }}
              style={styles.drawerItemContainer}
              rippleColor={theme.colors.primary + "20"}
            >
              <>
                <View style={styles.drawerItemIconContainer}>
                  <Icon source="tune" size={24} color={getItemColor("Modifiers")} />
                </View>
                <Text style={[styles.drawerItemLabel, { color: getItemColor("Modifiers") }]}>
                  Modificadores
                </Text>
              </>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => { props.navigation.navigate("PreparationScreens", { screen: "PreparationScreensList" }); }}
              style={styles.drawerItemContainer}
              rippleColor={theme.colors.primary + "20"}
            >
              <>
                <View style={styles.drawerItemIconContainer}>
                  <Icon source="monitor-dashboard" size={24} color={getItemColor("PreparationScreens")} />
                </View>
                <Text style={[styles.drawerItemLabel, { color: getItemColor("PreparationScreens") }]}>
                  Pantallas Preparación
                </Text>
              </>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => { props.navigation.navigate("AreasTablesStack", { screen: "AreasList" }); }}
              style={styles.drawerItemContainer}
              rippleColor={theme.colors.primary + "20"}
            >
              <>
                <View style={styles.drawerItemIconContainer}>
                  <Icon source="map-marker-radius-outline" size={24} color={getItemColor("AreasTablesStack")} />
                </View>
                <Text style={[styles.drawerItemLabel, { color: getItemColor("AreasTablesStack") }]}>
                  Áreas y Mesas
                </Text>
              </>
            </TouchableRipple>
          </PaperDrawer.Section>
        </View>
      </DrawerContentScrollView>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
         <TouchableRipple onPress={() => {
             const newPreference = theme.dark ? THEME_MODE.LIGHT : THEME_MODE.DARK;
             setThemePreference(newPreference);
           }}>
           <View style={styles.preference}>
             <Text variant="labelLarge" style={[styles.drawerItemLabel, { color: theme.colors.onSurfaceVariant }]}>
               Modo Oscuro
             </Text>
             <View pointerEvents="none" style={{ transform: [{ scale: 1.1 }] }}>
               <Switch value={theme.dark} color={theme.colors.primary} />
             </View>
           </View>
         </TouchableRipple>

        <TouchableRipple
          onPress={() => { logout(); }}
          style={styles.drawerItemContainer}
          rippleColor={theme.colors.primary + "20"}
        >
          <>
            <View style={styles.drawerItemIconContainer}>
              <Icon source="logout" size={24} color={theme.colors.onSurfaceVariant} />
            </View>
            <Text style={[styles.drawerItemLabel, { color: theme.colors.onSurfaceVariant }]}>
              Cerrar Sesión
            </Text>
          </>
        </TouchableRipple>
      </PaperDrawer.Section>
    </View>
  );
}
