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
              size={48}
              icon="account-circle"
              style={{ marginRight: theme.spacing.m }}
            />
            <View>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                Usuario Conectado
              </Text>
            </View>
          </View>


          <PaperDrawer.Section style={styles.drawerSection}>
            <PaperDrawer.Item
              label="Menú"
              icon="menu"
              active={props.state.routes[props.state.index]?.name === "Menu"}
              onPress={() => {
                props.navigation.navigate('Menu', { screen: 'CategoriesScreen' });
              }}
              style={
                props.state.routes[props.state.index]?.name === "Menu"
                  ? { backgroundColor: "transparent" }
                  : {}
              }
              theme={theme}
            />
          </PaperDrawer.Section>

    


        </View>
      </DrawerContentScrollView>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
        <PaperDrawer.Item
          label="Cerrar Sesión"
          icon="logout"
          onPress={() => {
            logout();
          }}
          theme={theme}
        />
      </PaperDrawer.Section>

      <PaperDrawer.Section style={styles.bottomDrawerSection}>
         <TouchableRipple onPress={() => {
           const newPreference = theme.dark ? THEME_MODE.LIGHT : THEME_MODE.DARK;
           setThemePreference(newPreference);
         }}>
           <View style={styles.preference}>
             <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Modo Oscuro</Text>
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
