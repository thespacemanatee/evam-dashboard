import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
import { BleManager } from 'react-native-ble-plx';

import { store } from './app/store';
import AppNavigator from './navigation/AppNavigator';
import { bleManagerRef } from './utils/BleHelper';
import { setAllChannels } from './features/radio/channelsSlice';
import * as channelsData from '../assets/stations.json';

const App = (): React.ReactElement | null => {
  const [loaded, setLoaded] = useState(false);

  const loadAssets = async () => {
    // await SplashScreen.preventAutoHideAsync();
    await Font.loadAsync({
      // eslint-disable-next-line global-require
      'Gotham-Narrow': require('../assets/fonts/Gotham-Narrow-Book.otf'),
      // eslint-disable-next-line global-require
      'Digital-Numbers': require('../assets/fonts/Digital-Numbers.ttf'),
    });
  };

  useEffect(() => {
    loadAssets().then(() => {
      setLoaded(true);
      // SplashScreen.hideAsync();
    });
    bleManagerRef.current = new BleManager();
    store.dispatch(setAllChannels(channelsData.stations));
  });

  if (!loaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <StatusBar hidden />
      <AppNavigator />
    </Provider>
  );
};

export default App;
