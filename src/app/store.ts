import { configureStore, combineReducers } from '@reduxjs/toolkit';

import settingsReducer from '../features/settings/settingsSlice';
import channelsReducer from '../features/radio/channelsSlice';
import playerReducer from '../features/radio/playerSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  channels: channelsReducer,
  player: playerReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
