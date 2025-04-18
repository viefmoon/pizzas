import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Platform } from 'react-native';

import { ModifiersStackParamList } from '@/app/navigation/types';
import ModifierGroupsScreen from '../screens/ModifierGroupsScreen';
import ModifiersScreen from '../screens/ModifiersScreen';
import { useAppTheme } from '@/app/styles/theme';
import { getStackHeaderOptions } from '@/app/navigation/options';

const Stack = createNativeStackNavigator<ModifiersStackParamList>();

const ModifiersStackNavigator = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getStackHeaderOptions(theme),
      }}
    >
      <Stack.Screen
        name="ModifierGroupsScreen"
        component={ModifierGroupsScreen}
        options={({ navigation }): NativeStackNavigationOptions => ({
          title: 'Grupos de Modificadores',
        })}
      />
      <Stack.Screen
        name="ModifiersScreen"
        component={ModifiersScreen}
        options={{ title: 'Modificadores' }}
      />
    </Stack.Navigator>
  );
};

export default ModifiersStackNavigator;