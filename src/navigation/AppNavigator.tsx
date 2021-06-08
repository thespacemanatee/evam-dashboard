import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Drawer,
  DrawerItem,
  IndexPath,
  StyleService,
} from '@ui-kitten/components';

import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DeviceScreen from '../screens/DeviceScreen';

const styles = StyleService.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
  },
  bottomNavigation: {
    paddingVertical: 8,
  },
});

const BluetoothStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator();
  return (
    <Navigator headerMode='none'>
      <Screen name='Settings' component={SettingsScreen} />
      <Screen name='Device' component={DeviceScreen} />
    </Navigator>
  );
};

const DrawerContent = ({
  navigation,
  state,
}: {
  navigation: any;
  state: any;
}) => (
  <SafeAreaView style={styles.screen}>
    <Drawer
      // footer={Footer}
      selectedIndex={new IndexPath(state.index)}
      onSelect={index => navigation.navigate(state.routeNames[index.row])}>
      <DrawerItem title='Dashboard' />
      <DrawerItem title='Settings' />
    </Drawer>
  </SafeAreaView>
);

const AppNavigator = () => {
  const { Navigator, Screen } = createDrawerNavigator();
  return (
    <NavigationContainer>
      <Navigator drawerContent={props => <DrawerContent {...props} />}>
        <Screen name='Dashboard' component={DashboardScreen} />
        <Screen name='BluetoothStack' component={BluetoothStackNavigator} />
      </Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
