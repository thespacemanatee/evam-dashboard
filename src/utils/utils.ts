/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import { PermissionsAndroid } from 'react-native';
import { decode as btoa } from 'base-64';
import { Characteristic } from 'react-native-ble-plx';

import { bleManagerRef } from './BleHelper';
import { TopIndicatorData } from '../index';
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
  if (!value) {
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
  if (device && device.length > 0) {
    const services = await (
      await device[0].discoverAllServicesAndCharacteristics()
    ).services();
    const service = services.find(e => e.uuid === serviceUUID);
    const characteristics = await service?.characteristics();
    characteristic = characteristics?.find(e => e.uuid === characteristicUUID);
  }
  return characteristic;
};

export const getCoreCharacteristic = async () =>
  getCharacteristic(
    CORE_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    CORE_CHARACTERISTIC_UUID,
  );

export const getStatusCharacteristic = async () =>
  getCharacteristic(
    STATUS_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    STATUS_CHARACTERISTIC_UUID,
  );

export const getBatteryCharacteristic = async () =>
  getCharacteristic(
    STATUS_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    BATTERY_CHARACTERISTIC_UUID,
  );

export const getFrontLightingCharacteristic = async () =>
  getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    FRONT_LIGHTING_CHARACTERISTIC_UUID,
  );

export const getRearLightingCharacteristic = async () =>
  getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    REAR_LIGHTING_CHARACTERISTIC_UUID,
  );

export const getInteriorLightingCharacteristic = async () =>
  getCharacteristic(
    LIGHTING_SERVICE_UUID,
    store.getState().settings.selectedDeviceUUID,
    INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
  );

export const getRGBString = (decodedRGBString: string): string =>
  `#${(
    decodedRGBString.charCodeAt(0).toString(16) +
    decodedRGBString.charCodeAt(1).toString(16) +
    decodedRGBString.charCodeAt(2).toString(16)
  )
    .padStart(6, '0')
    .toUpperCase()}`;

export const getTopIndicatorData = (
  decodedString: string,
): TopIndicatorData => {
  const whl =
    decodedString.charCodeAt(6) +
    decodedString.charCodeAt(7) +
    decodedString.charCodeAt(8) +
    decodedString.charCodeAt(9);
  return {
    ecu: decodedString.charCodeAt(0),
    bms: decodedString.charCodeAt(1),
    tps: decodedString.charCodeAt(2),
    sas: decodedString.charCodeAt(3),
    whl:
      decodedString.charCodeAt(6) === 0 ||
      decodedString.charCodeAt(7) === 0 ||
      decodedString.charCodeAt(8) === 0 ||
      decodedString.charCodeAt(9) === 0
        ? 0
        : whl === 4
        ? 1
        : -1,
  };
};

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const fine = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    const connect = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    );
    const scan = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    );
    if (!fine || !connect || !scan) {
      const request = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
      if (
        request['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        request['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        request['android.permission.BLUETOOTH_SCAN'] ===
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
