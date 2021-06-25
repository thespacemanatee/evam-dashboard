import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';
import TopIndicator from '../components/TopIndicator';

const AppNavigator = () => {
  const { Navigator, Screen } = createStackNavigator();
  return (
    <NavigationContainer>
      <Navigator
        screenOptions={{
          headerTitle: () => <TopIndicator />,
          headerStyle: {
            backgroundColor: 'black',
            borderBottomWidth: 0,
            elevation: 0,
          },
        }}>
        <Screen name='Dashboard' component={DashboardScreen} />
        <Screen name='Settings' component={SettingsScreen} />
        <Screen name='Device' component={DeviceScreen} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
