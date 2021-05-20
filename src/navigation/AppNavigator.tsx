import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName='Home'>
        <Drawer.Screen name='Home' component={Dashboard} />
        <Drawer.Screen name='Settings' component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
