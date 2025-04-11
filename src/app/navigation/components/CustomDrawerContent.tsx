import React from "react";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { CommonActions } from "@react-navigation/native";
import {
  Drawer as PaperDrawer,
  Text,
  Divider,
  Switch,
  TouchableRipple,
  Icon,
  Surface,
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

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        userInfoSection: {
          padding: theme.spacing.l,
        },
        title: {
          ...theme.fonts.titleMedium,
          color: theme.colors.onSurface,
          marginBottom: 4,
        },
        caption: {
          ...theme.fonts.bodySmall,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 2,
        },
        drawerSection: {
          marginTop: theme.spacing.s,
        },
        bottomDrawerSection: {
          marginBottom: theme.spacing.m,
          marginTop: "auto",
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
          marginHorizontal: theme.spacing.s,
          borderRadius: theme.roundness * 2,
        },
        drawerItemLabel: {
          ...theme.fonts.labelLarge,
        },
        drawerItemContainer: {
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: theme.roundness * 2,
          marginHorizontal: theme.spacing.s,
          marginVertical: 2,
        },
        drawerItemActive: {
          backgroundColor: theme.colors.primaryContainer,
        },
        drawerItemIconContainer: {
          marginRight: 32,
          width: 24,
          alignItems: "center",
        },
        divider: {
          marginVertical: theme.spacing.s,
          marginHorizontal: theme.spacing.m,
        },
      }),
    [theme]
  );

  const getItemActive = (routeName: string) => {
    const currentRoute = props.state.routes[props.state.index];
    return currentRoute?.name === routeName;
  };

  const getItemColor = (routeName: string) => {
    return getItemActive(routeName)
      ? theme.colors.primary
      : theme.colors.onSurfaceVariant;
  };

  const renderDrawerItem = (
    routeName: string,
    label: string,
    iconName: string,
    index: number,
    navigateToScreen: () => void
  ) => {
    const isActive = getItemActive(routeName);

    return (
      <TouchableRipple
        key={routeName}
        onPress={navigateToScreen}
        style={[
          styles.drawerItemContainer,
          isActive && styles.drawerItemActive,
        ]}
        rippleColor={`${theme.colors.primary}20`}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.drawerItemIconContainer}>
            <Icon source={iconName} size={24} color={getItemColor(routeName)} />
          </View>
          <Text
            style={[styles.drawerItemLabel, { color: getItemColor(routeName) }]}
          >
            {label}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <Surface
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
      }}
      elevation={0}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View style={styles.container}>
          <Surface style={styles.userInfoSection} elevation={0}>
            {user ? (
              <>
                <Text style={styles.title} numberOfLines={1}>
                  {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    user.username ||
                    "Usuario"}
                </Text>
                <Text style={styles.caption} numberOfLines={1}>
                  Rol: {user.role?.name ?? "Desconocido"}
                </Text>
                <Text style={styles.caption} numberOfLines={1}>
                  {user.email ?? ""}
                </Text>
                <Text style={styles.caption} numberOfLines={1}>
                  @{user.username ?? "username"}
                </Text>
              </>
            ) : (
              <Text style={styles.title}>Invitado</Text>
            )}
          </Surface>
          <Divider style={styles.divider} />

          <PaperDrawer.Section style={styles.drawerSection}>
            {renderDrawerItem("Menu", "Menú", "menu", 0, () => {
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Menu",
                      state: {
                        routes: [{ name: "CategoriesScreen" }],
                      },
                    },
                    { name: "Modifiers" },
                    { name: "PreparationScreens" },
                    { name: "AreasTablesStack" },
                  ],
                })
              );
            })}

            {renderDrawerItem("Modifiers", "Modificadores", "tune", 1, () => {
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: "Menu" },
                    {
                      name: "Modifiers",
                      state: {
                        routes: [{ name: "ModifierGroupsScreen" }],
                      },
                    },
                    { name: "PreparationScreens" },
                    { name: "AreasTablesStack" },
                  ],
                })
              );
            })}

            {renderDrawerItem(
              "PreparationScreens",
              "Pantallas Preparación",
              "monitor-dashboard",
              2,
              () => {
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 2,
                    routes: [
                      { name: "Menu" },
                      { name: "Modifiers" },
                      {
                        name: "PreparationScreens",
                        state: {
                          routes: [{ name: "PreparationScreensList" }],
                        },
                      },
                      { name: "AreasTablesStack" },
                    ],
                  })
                );
              }
            )}

            {renderDrawerItem(
              "AreasTablesStack",
              "Áreas y Mesas",
              "map-marker-radius-outline",
              3,
              () => {
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 3,
                    routes: [
                      { name: "Menu" },
                      { name: "Modifiers" },
                      { name: "PreparationScreens" },
                      {
                        name: "AreasTablesStack",
                        state: {
                          routes: [{ name: "AreasList" }],
                        },
                      },
                    ],
                  })
                );
              }
            )}
          </PaperDrawer.Section>
        </View>
      </DrawerContentScrollView>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
        <TouchableRipple
          onPress={() => {
            const newPreference = theme.dark
              ? THEME_MODE.LIGHT
              : THEME_MODE.DARK;
            setThemePreference(newPreference);
          }}
          style={styles.preference}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.drawerItemIconContainer}>
                <Icon
                  source={theme.dark ? "weather-night" : "white-balance-sunny"}
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
              <Text
                style={[
                  styles.drawerItemLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Modo Oscuro
              </Text>
            </View>
            <View pointerEvents="none">
              <Switch value={theme.dark} color={theme.colors.primary} />
            </View>
          </View>
        </TouchableRipple>

        <TouchableRipple
          onPress={() => {
            logout();
          }}
          style={styles.drawerItemContainer}
          rippleColor={`${theme.colors.error}20`}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.drawerItemIconContainer}>
              <Icon source="logout" size={24} color={theme.colors.error} />
            </View>
            <Text
              style={[styles.drawerItemLabel, { color: theme.colors.error }]}
            >
              Cerrar Sesión
            </Text>
          </View>
        </TouchableRipple>
      </PaperDrawer.Section>
    </Surface>
  );
}
