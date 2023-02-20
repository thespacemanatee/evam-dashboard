import { useWindowDimensions } from 'react-native';

export const CORE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const STATUS_SERVICE_UUID = '4ee1bbf0-5e71-4d58-9ce4-e3e45cb8d8f9';
export const LIGHTING_SERVICE_UUID = '1cbef3f2-12d5-4490-8a80-7f7970b51b54';
export const CORE_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const STATUS_CHARACTERISTIC_UUID =
  '5d2e6e74-31f0-445e-8088-827c53b71166';
export const BATTERY_CHARACTERISTIC_UUID =
  '3a9a4b03-75a4-48fb-a071-af568425664e';
export const FRONT_LIGHTING_CHARACTERISTIC_UUID =
  '825eef3b-e3d0-4ca6-bef7-6428b7260f35';
export const REAR_LIGHTING_CHARACTERISTIC_UUID =
  'db598591-bffe-46dd-9967-fbf869e88b3f';
export const INTERIOR_LIGHTING_CHARACTERISTIC_UUID =
  '8ecaaefa-f62f-4376-a4c8-32c74f62d950';

export const MENU_ICON_SIZE = 32;

export const useTachometerDimensions = (): {
  width: number;
  height: number;
} => {
  const { width, height } = useWindowDimensions();
  return { width: width * 0.66325, height: height * 0.79 };
};
