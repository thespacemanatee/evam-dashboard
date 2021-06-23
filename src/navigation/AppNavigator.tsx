import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';

const AppNavigator = () => {
  const { Navigator, Screen } = createStackNavigator();
  return (
    <NavigationContainer>
      <Navigator headerMode='none'>
        <Screen name='Dashboard' component={DashboardScreen} />
        <Screen name='Settings' component={SettingsScreen} />
        <Screen name='Device' component={DeviceScreen} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
