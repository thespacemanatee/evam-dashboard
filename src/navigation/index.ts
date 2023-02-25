import type { CompositeNavigationProp } from '@react-navigation/native';
import type {
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import { type Device } from 'react-native-ble-plx';

export type RootStackParamList = {
  DashboardStack: undefined;
  SettingsStack: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  Status: undefined;
  Lighting: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Device: { device: Device };
};

export type DashboardScreenProps = StackScreenProps<
  DashboardStackParamList,
  'Dashboard'
>;

export type DashboardScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<DashboardStackParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

export type SettingsScreenProps = StackScreenProps<
  SettingsStackParamList,
  'Settings'
>;
