import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import StatusScreen from '../screens/StatusScreen';
import LightingScreen from '../screens/LightingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';

const AppNavigator = (): JSX.Element => {
  const { Navigator, Screen } = createStackNavigator();

  const config = {
    cardStyleInterpolator: () => {
      return {};
    },
  };

  const SettingsStack = () => (
    <Navigator>
      <Screen name="Settings" component={SettingsScreen} />
      <Screen name="Device" component={DeviceScreen} />
    </Navigator>
  );

  const DashboardStack = () => (
    <Navigator headerMode="none">
      <Screen name="Dashboard" component={DashboardScreen} />
      <Screen name="Status" component={StatusScreen} options={config} />
      <Screen name="Lighting" component={LightingScreen} options={config} />
    </Navigator>
  );

  return (
    <NavigationContainer>
      <Navigator headerMode="none">
        <Screen name="DashboardStack" component={DashboardStack} />
        <Screen name="SettingsStack" component={SettingsStack} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
