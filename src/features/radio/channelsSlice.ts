/* eslint-disable no-param-reassign */
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { type RootState } from '../../app/store';
import { type RadioChannel } from '../../index';

const channelsAdapter = createEntityAdapter<RadioChannel>({
  selectId: (channel: RadioChannel) => channel.id,
  sortComparer: (a, b) => parseFloat(a.channel) - parseFloat(b.channel),
});

export const channelsSlice = createSlice({
  name: 'radio',
  initialState: channelsAdapter.getInitialState(),
  reducers: {
    setAllChannels: channelsAdapter.setAll,
  },
});

export const { setAllChannels } = channelsSlice.actions;

export const channelsSelector = channelsAdapter.getSelectors(
  (state: RootState) => state.channels,
);

export default channelsSlice.reducer;
