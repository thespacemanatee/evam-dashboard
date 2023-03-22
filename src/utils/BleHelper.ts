import { createRef } from 'react';
import { Alert } from 'react-native';
import { type Device, type BleManager } from 'react-native-ble-plx';
import {
  requestBluetoothPermissions,
  requestLocationPermissions,
} from './utils';

export const isReadyRef: React.MutableRefObject<boolean | null> = createRef();

export const bleManagerRef: React.MutableRefObject<BleManager | null> =
  createRef();

export const stopScan = (): void => {
  bleManagerRef.current?.stopDeviceScan();
};

export const scanDevices = async (
  onDevice: (device: Device) => void,
  onStopScan: (err?: Error) => void,
): Promise<void> => {
  const locationGranted = await requestLocationPermissions();
  const bluetoothGranted = await requestBluetoothPermissions();
  if (locationGranted && bluetoothGranted) {
    bleManagerRef.current?.startDeviceScan(
      null,
      null,
      (error, scannedDevice) => {
        const scanTimeout = setTimeout(() => {
          stopScan();
          onStopScan();
        }, 5000);
        if (error != null) {
          console.error(error);
          clearTimeout(scanTimeout);
          stopScan();
          onStopScan();
          Alert.alert('Error', 'Could not scan for bluetooth devices');
        }
        if (scannedDevice != null) {
          onDevice(scannedDevice);
        }
      },
    );
  } else {
    Alert.alert('Error', 'Bluetooth permissions not granted', [
      { text: 'OK' },
      {
        text: 'Try again',
        onPress: () => {
          void (async () => {
            try {
              await scanDevices(onDevice, onStopScan);
            } catch (err) {
              console.error(err);
            }
          })();
        },
      },
    ]);
  }
};
