import { Dimensions } from 'react-native';

export const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const CORE_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const STATUS_CHARACTERISTIC_UUID =
  '5d2e6e74-31f0-445e-8088-827c53b71166';
export const LIGHTING_CHARACTERISTIC_UUID =
  '825eef3b-e3d0-4ca6-bef7-6428b7260f35';
export const CORE_REFRESH_RATE = 200;

export const MAX_WIDTH = Dimensions.get('window').width;
export const MAX_HEIGHT = Dimensions.get('window').height;
const TOP_INDICATOR_WIDTH = 1423;
const TOP_INDICATOR_HEIGHT = 121;
export const FINAL_TOP_INDICATOR_HEIGHT =
  TOP_INDICATOR_HEIGHT * (MAX_WIDTH / TOP_INDICATOR_WIDTH) - 16;
export const FINAL_TACHOMETER_HEIGHT = MAX_HEIGHT * 0.79;
export const FINAL_BATTERY_HEIGHT = MAX_WIDTH / 8;
export const MENU_ICON_SIZE = 32;
export const RADIO_BUTTON_SIZE = 48;
export const RADIO_LABEL_HEIGHT = 48;
export const RADIO_LABEL_WIDTH = 240;
