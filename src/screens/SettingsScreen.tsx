import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, FlatList, Button } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

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

const SettingsScreen = ({ navigation }) => {
  const devices = useAppSelector(state => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);
  const manager = useRef(new BleManager());
  const isMounted = useRef(false);

  const dispatch = useAppDispatch();

  const scanDevices = async () => {
    setBluetoothLoading(true);
    const granted = await requestLocationPermissions();
    if (granted) {
      manager.current?.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          Alert.alert('Error', 'Could not scan for bluetooth devices');
        }

        // if a device is detected add the device to the list by dispatching the action into the reducer
        if (scannedDevice) {
          //   console.log(scannedDevice.manufacturerData);
          dispatch(addDevice(scannedDevice));
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        if (isMounted.current) {
          manager.current?.stopDeviceScan();
          setBluetoothLoading(false);
        }
      }, 5000);
    } else {
      setBluetoothLoading(false);
      Alert.alert('Error', 'Bluetooth permissions not granted', [
        { text: 'OK' },
        { text: 'Try again', onPress: scanDevices },
      ]);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      manager.current?.destroy();
      isMounted.current = false;
    };
  }, []);

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
        keyExtractor={item => item.id}
        data={devices}
        renderItem={({ item }) => <DeviceCard device={item} />}
      />
    </View>
  );
};

export default SettingsScreen;
