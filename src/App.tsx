import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BleManager } from 'react-native-ble-plx';

import { store } from './app/store';
import AppNavigator from './navigation/AppNavigator';
import { bleManagerRef } from './utils/BleHelper';
import { setAllChannels } from './features/radio/channelsSlice';
import * as channelsData from '../assets/stations.json';

const App = (): React.ReactElement | null => {
  const [loaded, setLoaded] = useState(false);

  const loadAssets = async (): Promise<void> => {
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
      );
      await SplashScreen.preventAutoHideAsync();
      await Font.loadAsync({
        'Gotham-Narrow': require('../assets/fonts/Gotham-Narrow-Book.otf'),
        'Digital-Numbers': require('../assets/fonts/Digital-Numbers.ttf'),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadAssets();
        setLoaded(true);
        bleManagerRef.current = new BleManager();
        store.dispatch(setAllChannels(channelsData.stations));
        await SplashScreen.hideAsync();
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

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
