import { Device } from 'react-native-ble-plx';

export type RootStackParamList = {
  Dashboard: undefined;
  Temperature: undefined;
  Lighting: undefined;
  Settings: undefined;
  Device: { device: Device };
};
