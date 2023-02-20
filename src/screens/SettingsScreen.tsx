import { useState } from 'react';
import { StyleSheet, View, Alert, FlatList, Button } from 'react-native';
import { type Device } from 'react-native-ble-plx';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addDevice, resetDevices } from '../features/settings/settingsSlice';
import {
  requestBluetoothPermissions,
  requestLocationPermissions,
} from '../utils/utils';
import DeviceCard from '../components/bleDevice/DeviceCard';
import { bleManagerRef } from '../utils/BleHelper';
import { type SettingsScreenProps } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingVertical: 16,
    paddingEnd: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 0.5,
    marginHorizontal: 8,
  },
  card: {
    flex: 0.5,
    marginVertical: 8,
    marginHorizontal: 8,
  },
});

const SettingsScreen = ({ navigation }: SettingsScreenProps): JSX.Element => {
  const devices = useAppSelector((state) => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);

  const dispatch = useAppDispatch();

  const navigateToDevice = (device: Device): void => {
    navigation.navigate('Device', { device });
  };

  const scanDevices = async (): Promise<void> => {
    try {
      setBluetoothLoading(true);
      const stopScan = (): void => {
        bleManagerRef.current?.stopDeviceScan();
        setBluetoothLoading(false);
      };
      const locationGranted = await requestLocationPermissions();
      const bluetoothGranted = await requestBluetoothPermissions();
      if (locationGranted && bluetoothGranted) {
        bleManagerRef.current?.startDeviceScan(
          null,
          null,
          (error, scannedDevice) => {
            const scanTimeout = setTimeout(() => {
              stopScan();
            }, 5000);
            if (error != null) {
              console.error(error);
              clearTimeout(scanTimeout);
              stopScan();
              Alert.alert('Error', 'Could not scan for bluetooth devices');
            }
            if (scannedDevice != null) {
              dispatch(addDevice(scannedDevice));
            }
          },
        );
      } else {
        setBluetoothLoading(false);
        Alert.alert('Error', 'Bluetooth permissions not granted', [
          { text: 'OK' },
          {
            text: 'Try again',
            onPress: () => {
              void (async () => {
                try {
                  await scanDevices();
                } catch (err) {
                  console.error(err);
                }
              })();
            },
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            onPress={scanDevices}
            title="SCAN"
            disabled={bluetoothLoading}
          />
        </View>
        <View style={styles.button}>
          <Button
            onPress={() => dispatch(resetDevices())}
            title="RESET"
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
    </SafeAreaView>
  );
};

export default SettingsScreen;
