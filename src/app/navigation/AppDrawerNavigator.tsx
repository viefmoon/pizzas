import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MenuStack } from '../../modules/menu/navigation/MenuStack';
import { CustomDrawerContent } from './components/CustomDrawerContent';
import { useAppTheme } from '../styles/theme';
import type { AppDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 260,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          ...theme.fonts.labelLarge,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="Menu"
        component={MenuStack}
        options={{
          title: 'Menú',
        }}
      />
    </Drawer.Navigator>
  );
}