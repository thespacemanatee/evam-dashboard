import React, { useState } from 'react';
import { ImageProps, StyleSheet, View, ViewStyle, Alert } from 'react-native';
import {
  Button,
  Icon,
  Layout,
  Text,
  Spinner,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import { BleManager, Device } from 'react-native-ble-plx';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addDevice,
  removeDevice,
  resetDevices,
} from '../features/settings/settingsSlice';
import { requestLocationPermissions } from '../utils/utils';
import LoadingIndicator from '../components/LoadingIndicator';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    // alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  scanButton: {
    marginVertical: 16,
  },
});

const DrawerIcon = props => <Icon {...props} name='menu-outline' />;

const Dashboard = ({ navigation }) => {
  const count = useAppSelector(state => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);

  const dispatch = useAppDispatch();

  const manager = new BleManager();

  const DrawerAction = () => (
    <TopNavigationAction
      icon={DrawerIcon}
      onPress={() => {
        navigation.openDrawer();
      }}
    />
  );

  const scanDevices = async () => {
    setBluetoothLoading(true);
    const granted = await requestLocationPermissions();
    if (granted) {
      // scan devices
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        // if a device is detected add the device to the list by dispatching the action into the reducer
        if (scannedDevice) {
          //   console.log(scannedDevice.manufacturerData);
          dispatch(addDevice(scannedDevice));
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        manager.stopDeviceScan();
        setBluetoothLoading(false);
      }, 5000);
    } else {
      setBluetoothLoading(false);
      Alert.alert('Error', 'Could not get access to bluetooth', [
        { text: 'OK' },
        { text: 'Try again', onPress: scanDevices },
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <TopNavigation
        title='Settings'
        alignment='center'
        accessoryLeft={DrawerAction}
      />
      <Layout style={styles.container}>
        <Button
          style={styles.scanButton}
          accessoryLeft={() => <LoadingIndicator loading={bluetoothLoading} />}
          onPress={scanDevices}>
          SCAN
        </Button>
      </Layout>
    </View>
  );
};

export default Dashboard;
