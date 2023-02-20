/* eslint-disable no-param-reassign */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RadioChannel } from '../../index';

interface PlayerState {
  currentChannel?: RadioChannel;
}

const initialState: PlayerState = {
  currentChannel: undefined,
};
export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentChannel: (state, action: PayloadAction<RadioChannel>) => {
      state.currentChannel = action.payload;
    },
  },
});

export const { setCurrentChannel } = playerSlice.actions;

export default playerSlice.reducer;
