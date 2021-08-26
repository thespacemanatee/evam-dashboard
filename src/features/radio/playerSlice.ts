/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RadioChannel } from '../../types';

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
