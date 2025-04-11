import React from "react";
import { StyleSheet, TouchableOpacity, StatusBar, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MenuStackNavigator } from "../../modules/menu/navigation/MenuStackNavigator";
import ModifiersStackNavigator from "../../modules/modifiers/navigation/ModifiersStackNavigator";
import PreparationScreensStackNavigator from "../../modules/preparationScreens/navigation/PreparationScreensStackNavigator";
import AreasTablesStackNavigator from "../../modules/areasTables/navigation/AreasTablesStackNavigator";
import { CustomDrawerContent } from "./components/CustomDrawerContent";
import { useAppTheme } from "../styles/theme";
import { Icon, Surface } from "react-native-paper";
import type { AppDrawerParamList } from "./types";

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  // Definir los estilos usando useMemo para optimizar renderizado
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        drawerButtonContainer: {
          width: 48,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
          marginLeft: 8,
          borderRadius: 24,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
          height: 56, // Altura estándar MD3
          elevation: 2,
        },
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
          color: theme.colors.onPrimary,
          fontWeight: "bold",
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 320, // Ancho estándar MD3
          borderTopRightRadius: theme.roundness * 2,
          borderBottomRightRadius: theme.roundness * 2,
        },
      }),
    [theme]
  );

  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: styles.headerStyle,
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: styles.headerTitleStyle,
          drawerStyle: styles.drawerStyle,
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.onSurfaceVariant,
          drawerLabelStyle: {
            ...theme.fonts.labelLarge,
          },
          drawerItemStyle: {
            marginVertical: theme.spacing.xs,
            borderRadius: theme.roundness * 2,
          },
          headerShown: true,
          drawerType: "front",
          drawerPosition: "left",
          headerShadowVisible: false,
          swipeEdgeWidth: 100,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.drawerButtonContainer}
              onPress={() => navigation.openDrawer()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon source="menu" size={28} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          ),
          headerTitle: ({ children }) => {
            // Personalizar el título de cada pantalla basado en el nombre
            let title = "";
            switch (children) {
              case "Menu":
                title = "Menú";
                break;
              case "Modifiers":
                title = "Modificadores";
                break;
              case "PreparationScreens":
                title = "Pantallas Preparación";
                break;
              case "AreasTablesStack":
                title = "Áreas y Mesas";
                break;
              default:
                title = children?.toString() || "";
            }
            return (
              <Surface
                elevation={0}
                style={{
                  backgroundColor: "transparent",
                  // El padding se maneja mejor en el Text para alineación
                }}
              >
                <Text style={styles.headerTitleStyle}>{title}</Text>
              </Surface>
            );
          },
        })}
      >
        <Drawer.Screen
          name="Menu"
          component={MenuStackNavigator}
          options={{
            title: "Menú",
            drawerIcon: ({ color, size }) => (
              <Icon source="menu" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Modifiers"
          component={ModifiersStackNavigator}
          options={{
            title: "Modificadores",
            drawerIcon: ({ color, size }) => (
              <Icon source="tune" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="PreparationScreens"
          component={PreparationScreensStackNavigator}
          options={{
            title: "Pantallas Preparación",
            drawerIcon: ({ color, size }) => (
              <Icon source="monitor-dashboard" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="AreasTablesStack"
          component={AreasTablesStackNavigator}
          options={{
            title: "Áreas y Mesas",
            drawerIcon: ({ color, size }) => (
              <Icon
                source="map-marker-radius-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
