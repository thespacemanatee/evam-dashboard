import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import TemperatureScreen from '../screens/TemperatureScreen';
import LightingScreen from '../screens/LightingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';
import TopIndicator from '../components/TopIndicator';

const AppNavigator = () => {
  const { Navigator, Screen } = createStackNavigator();

  const SettingsStack = () => (
    <Navigator>
      <Screen name='Settings' component={SettingsScreen} />
      <Screen name='Device' component={DeviceScreen} />
    </Navigator>
  );

  const DashboardStack = () => (
    <>
      <TopIndicator />
      <Navigator headerMode='none'>
        <Screen name='Dashboard' component={DashboardScreen} />
        <Screen
          name='Temperature'
          component={TemperatureScreen}
          options={{
            cardStyleInterpolator: () => {
              return {};
            },
          }}
        />
        <Screen
          name='Lighting'
          component={LightingScreen}
          options={{
            cardStyleInterpolator: () => {
              return {};
            },
          }}
        />
      </Navigator>
    </>
  );

  return (
    <NavigationContainer>
      <Navigator headerMode='none'>
        <Screen name='DashboardStack' component={DashboardStack} />
        <Screen name='SettingsStack' component={SettingsStack} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
