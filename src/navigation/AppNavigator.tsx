import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import StatusScreen from '../screens/StatusScreen';
import LightingScreen from '../screens/LightingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';

const SettingsStack = () => {
  const { Navigator, Screen } = createStackNavigator();
  return (
    <Navigator>
      <Screen name="Settings" component={SettingsScreen} />
      <Screen name="Device" component={DeviceScreen} />
    </Navigator>
  );
};

const DashboardStack = () => {
  const { Navigator, Screen } = createStackNavigator();

  const config = {
    cardStyleInterpolator: () => ({}),
  };

  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="Dashboard" component={DashboardScreen} />
      <Screen name="Status" component={StatusScreen} options={config} />
      <Screen name="Lighting" component={LightingScreen} options={config} />
    </Navigator>
  );
};

const AppNavigator = (): JSX.Element => {
  const { Navigator, Screen } = createStackNavigator();

  return (
    <NavigationContainer>
      <Navigator screenOptions={{ headerShown: false }}>
        <Screen name="DashboardStack" component={DashboardStack} />
        <Screen name="SettingsStack" component={SettingsStack} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
