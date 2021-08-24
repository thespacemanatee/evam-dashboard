import React, { useState } from 'react';
import { StyleSheet, View, Alert, FlatList, Button } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Device } from 'react-native-ble-plx';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addDevice, resetDevices } from '../features/settings/settingsSlice';
import { requestLocationPermissions } from '../utils/utils';
import DeviceCard from '../components/DeviceCard';
import { bleManagerRef } from '../utils/BleHelper';
import { RootStackParamList } from '../navigation';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  button: {
    flex: 0.5,
    marginHorizontal: 8,
  },
  card: {
    flex: 0.5,
    marginBottom: 16,
    marginHorizontal: 8,
  },
});

type Props = StackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props): JSX.Element => {
  const devices = useAppSelector((state) => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);

  const dispatch = useAppDispatch();

  const navigateToDevice = (device: Device) =>
    navigation.navigate('Device', { device });

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
        numColumns={2}
        data={devices}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={navigateToDevice}
            style={styles.card}
          />
        )}
      />
    </View>
  );
};

export default SettingsScreen;
