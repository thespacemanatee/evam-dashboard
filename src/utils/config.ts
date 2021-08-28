import { Dimensions } from 'react-native';

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
