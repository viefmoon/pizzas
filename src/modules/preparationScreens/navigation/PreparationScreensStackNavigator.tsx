import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PreparationScreensStackParamList } from './types';
import PreparationScreensScreen from '../screens/PreparationScreensScreen';
import { useAppTheme } from '../../../app/styles/theme';
import { getStackHeaderOptions } from '../../../app/navigation/options';
// import { DrawerToggleButton } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator<PreparationScreensStackParamList>();

const PreparationScreensStackNavigator = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="PreparationScreensList"
      screenOptions={{
        ...getStackHeaderOptions(theme),
        // headerLeft: (props) => <DrawerToggleButton {...props} tintColor={theme.colors.onSurface} />,
      }}
    >
      <Stack.Screen
        name="PreparationScreensList"
        component={PreparationScreensScreen}
        options={{
          title: 'Pantallas de Preparación',
        }}
      />
      {/* <Stack.Screen name="PreparationScreenDetail" component={DetailScreenComponent} /> */}
    </Stack.Navigator>
  );
};

export default PreparationScreensStackNavigator;