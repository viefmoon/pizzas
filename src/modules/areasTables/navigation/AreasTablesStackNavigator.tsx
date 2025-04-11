import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Platform } from 'react-native';
import { AreasTablesStackParamList } from './types';
import AreasScreen from '../screens/AreasScreen';
import TablesScreen from '../screens/TablesScreen';
import { useAppTheme } from '../../../app/styles/theme';

const Stack = createNativeStackNavigator<AreasTablesStackParamList>();

const AreasTablesStackNavigator = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="AreasList"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          ...theme.fonts.titleLarge,
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AreasList"
        component={AreasScreen}
        options={{
          title: 'Áreas',
          headerLeft: (props) =>
            Platform.OS !== 'web' ? (
              <DrawerToggleButton
                {...props}
                tintColor={theme.colors.onSurface}
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="TablesList"
        component={TablesScreen}
        options={({ route }) => ({
          title: `Mesas de ${route.params.areaName || 'Área'}`,
        })}
      />
    </Stack.Navigator>
  );
};

export default AreasTablesStackNavigator;