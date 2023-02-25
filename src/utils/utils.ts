import { PermissionsAndroid } from 'react-native';
import { decode as btoa } from 'base-64';
import { type Characteristic } from 'react-native-ble-plx';

import { bleManagerRef } from './BleHelper';
import { type StatusIndicatorData, type TopIndicatorData } from '../index';
import {
  BATTERY_CHARACTERISTIC_UUID,
  CORE_CHARACTERISTIC_UUID,
  CORE_SERVICE_UUID,
  FRONT_LIGHTING_CHARACTERISTIC_UUID,
  INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
  LIGHTING_SERVICE_UUID,
  REAR_LIGHTING_CHARACTERISTIC_UUID,
  STATUS_CHARACTERISTIC_UUID,
  STATUS_SERVICE_UUID,
} from './config';
import { store } from '../app/store';

export const decodeBleString = (value: string | undefined | null): string => {
  if (value == null) {
    return '';
  }
  return btoa(value);
};

const getCharacteristic = async (
  serviceUUID: string,
  deviceUUID: string,
  characteristicUUID: string,
): Promise<Characteristic | undefined> => {
  let characteristic: Characteristic | undefined;
  const device = await bleManagerRef.current?.devices([deviceUUID]);
  if (device != null && device.length > 0) {
    const services = await (
      await device[0].discoverAllServicesAndCharacteristics()
    ).services();
    const service = services.find((e) => e.uuid === serviceUUID);
    const characteristics = await service?.characteristics();
    characteristic = characteristics?.find(
      (e) => e.uuid === characteristicUUID,
    );
  }
  return characteristic;
};

export const getCoreCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    CORE_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    CORE_CHARACTERISTIC_UUID,
  );
};

export const getStatusCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    STATUS_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    STATUS_CHARACTERISTIC_UUID,
  );
};

export const getBatteryCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    STATUS_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    BATTERY_CHARACTERISTIC_UUID,
  );
};

export const getFrontLightingCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    FRONT_LIGHTING_CHARACTERISTIC_UUID,
  );
};

export const getRearLightingCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    REAR_LIGHTING_CHARACTERISTIC_UUID,
  );
};

export const getInteriorLightingCharacteristic = async (): Promise<
  Characteristic | undefined
> => {
  return await getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
  );
};

export const getRGBString = (decodedRGBString: string): string => {
  return `#${(
    decodedRGBString.charCodeAt(0).toString(16) +
    decodedRGBString.charCodeAt(1).toString(16) +
    decodedRGBString.charCodeAt(2).toString(16)
  )
    .padStart(6, '0')
    .toUpperCase()}`;
};

export const getTopIndicatorData = (
  decodedString: string,
): TopIndicatorData => {
  const whl =
    decodedString.charCodeAt(5) +
    decodedString.charCodeAt(6) +
    decodedString.charCodeAt(7);
  return {
    ecu: decodedString.charCodeAt(0),
    bms: decodedString.charCodeAt(1),
    tps: decodedString.charCodeAt(2),
    sas: decodedString.charCodeAt(3),
    whl:
      decodedString.charCodeAt(5) === 0 ||
      decodedString.charCodeAt(6) === 0 ||
      decodedString.charCodeAt(7) === 0
        ? 0
        : whl === 3
        ? 1
        : -1,
  };
};

export const getStatusIndicatorData = (
  decodedString: string,
): StatusIndicatorData => {
  return {
    ecu: decodedString.charCodeAt(0),
    bms: decodedString.charCodeAt(1),
    tps: decodedString.charCodeAt(2),
    sas: decodedString.charCodeAt(3),
    imu: decodedString.charCodeAt(4),
    fw: decodedString.charCodeAt(5),
    rlw: decodedString.charCodeAt(6),
    rrw: decodedString.charCodeAt(7),
    fl: decodedString.charCodeAt(8),
    rl: decodedString.charCodeAt(9),
    int: decodedString.charCodeAt(10),
  };
};

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!granted) {
      const request = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (request === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
  return true;
};

export const requestBluetoothPermissions = async (): Promise<boolean> => {
  try {
    const connectGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    );
    const scanGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    );
    if (!connectGranted || !scanGranted) {
      const request = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      if (
        request[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        request[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
  return true;
};
