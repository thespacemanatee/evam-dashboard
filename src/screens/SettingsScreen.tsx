import React, { useState } from 'react';
import { StyleSheet, View, Alert, FlatList, Button } from 'react-native';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addDevice, resetDevices } from '../features/settings/settingsSlice';
import { requestLocationPermissions } from '../utils/utils';
import DeviceCard from '../components/DeviceCard';
import { bleManagerRef } from '../utils/BleHelper';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
  },

  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  button: {
    width: '50%',
    paddingHorizontal: 16,
  },
});

const SettingsScreen = () => {
  const devices = useAppSelector((state) => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);

  const dispatch = useAppDispatch();

  const scanDevices = async () => {
    setBluetoothLoading(true);
    const stopScan = () => {
      bleManagerRef.current?.stopDeviceScan();
      setBluetoothLoading(false);
    };
    const granted = await requestLocationPermissions();
    if (granted) {
      bleManagerRef.current?.startDeviceScan(
        null,
        null,
        (error, scannedDevice) => {
          const scanTimeout = setTimeout(() => {
            stopScan();
          }, 5000);
          if (error) {
            console.error(error);
            clearTimeout(scanTimeout);
            stopScan();
            Alert.alert('Error', 'Could not scan for bluetooth devices');
          }
          if (scannedDevice) {
            dispatch(addDevice(scannedDevice));
          }
        },
      );
    } else {
      setBluetoothLoading(false);
      Alert.alert('Error', 'Bluetooth permissions not granted', [
        { text: 'OK' },
        { text: 'Try again', onPress: scanDevices },
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            onPress={scanDevices}
            title='SCAN'
            disabled={bluetoothLoading}
          />
        </View>
        <View style={styles.button}>
          <Button
            onPress={() => dispatch(resetDevices())}
            title='RESET'
            disabled={bluetoothLoading}
          />
        </View>
      </View>
      <FlatList
        keyExtractor={(item) => item.id}
        data={devices}
        renderItem={({ item }) => <DeviceCard device={item} />}
      />
    </View>
  );
};

export default SettingsScreen;
