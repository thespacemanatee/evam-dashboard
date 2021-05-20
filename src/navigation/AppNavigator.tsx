import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const BluetoothStackNavigator = () => {
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='Device' component={DeviceScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name='Dashboard' component={DashboardScreen} />
        <Drawer.Screen
          name='BluetoothStack'
          component={BluetoothStackNavigator}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
