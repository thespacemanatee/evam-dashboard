import { PermissionsAndroid } from 'react-native';
import { decode as btoa } from 'base-64';
import { Characteristic } from 'react-native-ble-plx';
import { bleManagerRef } from './BleHelper';

export const decodeBleString = (value: string | undefined | null): string => {
  if (!value) {
    return '';
  }
  return btoa(value);
};

export const getCharacteristic = async (
  serviceUUID: string,
  deviceUUID: string,
  characteristicUUID: string,
): Promise<Characteristic | undefined> => {
  const device = await bleManagerRef.current?.devices([deviceUUID]);
  if (device && device[0]) {
    const services = await (
      await device[0].discoverAllServicesAndCharacteristics()
    ).services();
    const service = services.find((e) => e.uuid === serviceUUID);
    const characteristics = await service?.characteristics();
    return characteristics?.find((e) => e.uuid === characteristicUUID);
  }
  return undefined;
};

export const getRGBString = (decodedRGBString: string): string => {
  return (
    decodedRGBString.charCodeAt(0).toString(16) +
    decodedRGBString.charCodeAt(1).toString(16) +
    decodedRGBString.charCodeAt(2).toString(16)
  );
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
