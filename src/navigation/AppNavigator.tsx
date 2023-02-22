import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import StatusScreen from '../screens/StatusScreen';
import LightingScreen from '../screens/LightingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';
import {
  type DashboardStackParamList,
  type RootStackParamList,
  type SettingsStackParamList,
} from '.';

const config = {
  cardStyleInterpolator: () => ({}),
};

const AppNavigator = (): JSX.Element => {
  const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const SettingsStack = () => {
    const { Navigator, Screen } =
      createStackNavigator<SettingsStackParamList>();

    return (
      <Navigator>
        <Screen name="Settings" component={SettingsScreen} />
        <Screen name="Device" component={DeviceScreen} />
      </Navigator>
    );
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const DashboardStack = () => {
    const { Navigator, Screen } =
      createStackNavigator<DashboardStackParamList>();
    return (
      <Navigator screenOptions={{ headerShown: false }}>
        <Screen name="Dashboard" component={DashboardScreen} />
        <Screen name="Status" component={StatusScreen} options={config} />
        <Screen name="Lighting" component={LightingScreen} options={config} />
      </Navigator>
    );
  };

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
