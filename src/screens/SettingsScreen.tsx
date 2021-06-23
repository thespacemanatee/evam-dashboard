import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, FlatList, Button } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addDevice,
  removeDevice,
  resetDevices,
} from '../features/settings/settingsSlice';
import { requestLocationPermissions } from '../utils/utils';
import DeviceCard from '../components/DeviceCard';

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

const SettingsScreen = ({ navigation }) => {
  const devices = useAppSelector(state => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);

  const dispatch = useAppDispatch();

  const manager = new BleManager();

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

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <View style={styles.screen}>
      <Button onPress={scanDevices} title='SCAN' />
      <FlatList
        keyExtractor={item => item.id}
        data={devices}
        renderItem={({ item }) => <DeviceCard device={item} />}
      />
    </View>
  );
};

export default SettingsScreen;
