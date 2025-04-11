import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MenuStack } from "../../modules/menu/navigation/MenuStack";
import ModifiersStackNavigator from "../../modules/modifiers/navigation/ModifiersStackNavigator";
import PreparationScreensStackNavigator from "../../modules/preparationScreens/navigation/PreparationScreensStackNavigator";
import AreasTablesStackNavigator from "../../modules/areasTables/navigation/AreasTablesStackNavigator";
import { CustomDrawerContent } from "./components/CustomDrawerContent";
import { useAppTheme } from "../styles/theme";
import { Icon } from "react-native-paper";
import type { AppDrawerParamList } from "./types";

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
          height: 50,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
          fontWeight: "bold",
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          ...theme.fonts.labelLarge,
          fontWeight: "500",
        },
        drawerItemStyle: {
          marginVertical: theme.spacing.xs,
        },
        headerShown: true,
        drawerType: "front",
        drawerPosition: "left",
        drawerHideStatusBarOnOpen: false,
        overlayColor: "transparent",
        drawerStatusBarAnimation: "slide",
        drawerContentContainerStyle: {
          flex: 1,
        },
        drawerContentStyle: {
          flex: 1,
        },
        headerLeft: () => (
          <TouchableOpacity
            style={styles.drawerButtonContainer}
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon source="menu" size={32} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="Menu"
        component={MenuStack}
        options={{
          title: "Menú",
        }}
      />
      <Drawer.Screen
        name="Modifiers"
        component={ModifiersStackNavigator}
        options={{
          title: "Modificadores",
        }}
      />
      <Drawer.Screen
        name="PreparationScreens"
        component={PreparationScreensStackNavigator}
        options={{
          title: "Pantallas Preparación",
        }}
      />
      <Drawer.Screen
        name="AreasTablesStack"
        component={AreasTablesStackNavigator}
        options={{
          title: "Áreas y Mesas",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
