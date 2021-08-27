import { Dimensions } from 'react-native';

export const MAX_WIDTH = Dimensions.get('window').width;
export const MAX_HEIGHT = Dimensions.get('window').height;
const BASE_GRAPHIC_WIDTH = 2340;
const BASE_GRAPHIC_HEIGHT = 261;
export const FINAL_BASE_GRAPHIC_HEIGHT =
  BASE_GRAPHIC_HEIGHT * (MAX_WIDTH / BASE_GRAPHIC_WIDTH);
const TOP_INDICATOR_WIDTH = 1423;
const TOP_INDICATOR_HEIGHT = 121;
export const FINAL_TOP_INDICATOR_HEIGHT =
  TOP_INDICATOR_HEIGHT * (MAX_WIDTH / TOP_INDICATOR_WIDTH) - 16;
export const FINAL_TACHOMETER_HEIGHT = MAX_HEIGHT * 0.79;
export const FINAL_BATTERY_HEIGHT = MAX_WIDTH / 8;
export const MENU_ICON_SIZE = 32;
export const RADIO_BUTTON_SIZE = 48;
