/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device } from 'react-native-ble-plx';

import type { RootState } from '../../app/store';

// Define a type for the slice state
interface SettingsState {
  devices: Device[];
}

// Define the initial state using that type
const initialState: SettingsState = {
  devices: [],
};
export const settingsSlice = createSlice({
  name: 'settings',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addDevice: (state, action: PayloadAction<Device>) => {
      if (!state.devices.some(e => e.id === action.payload.id)) {
        state.devices.push(action.payload);
      }
    },
    removeDevice: (state, action: PayloadAction<Device>) => {
      state.devices = state.devices.filter(e => e !== action.payload);
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    resetDevices: state => {
      state.devices = [];
    },
  },
});

export const { addDevice, removeDevice, resetDevices } = settingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.settings.devices;

export default settingsSlice.reducer;
