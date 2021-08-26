/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device } from 'react-native-ble-plx';

interface SettingsState {
  selectedDeviceUUID: string;
  devices: Device[];
}

const initialState: SettingsState = {
  selectedDeviceUUID: '',
  devices: [],
};
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<Device>) => {
      if (!state.devices.some((e) => e.id === action.payload.id)) {
        state.devices.push(action.payload);
      }
    },
    setSelectedDeviceUUID: (state, action: PayloadAction<string>) => {
      state.selectedDeviceUUID = action.payload;
    },
    removeDevice: (state, action: PayloadAction<Device>) => {
      state.devices = state.devices.filter((e) => e !== action.payload);
    },
    resetDevices: (state) => {
      state.devices = [];
    },
  },
});

export const { addDevice, setSelectedDeviceUUID, removeDevice, resetDevices } =
  settingsSlice.actions;

export default settingsSlice.reducer;
