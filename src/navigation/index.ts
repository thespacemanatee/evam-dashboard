import { Device } from 'react-native-ble-plx';

export type RootStackParamList = {
  Home: undefined;
  Device: { device: Device };
};
