/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import { decode as btoa } from 'base-64';
import { Characteristic } from 'react-native-ble-plx';
import {
  checkMultiple,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

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
    const statuses = await checkMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    ]);
    if (
      !statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ||
      !statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] ||
      !statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN]
    ) {
      const requests = await requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ]);
      if (
        requests[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
          RESULTS.GRANTED &&
        requests[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED &&
        requests[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
      ) {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
};
