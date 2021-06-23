import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'react-native';
import * as Font from 'expo-font';

import { store, persistor } from './app/store';
import AppNavigator from './navigation/AppNavigator';

const App = (): React.ReactFragment => {
  const [loaded] = Font.useFonts({
    // eslint-disable-next-line global-require
    'Gotham-Narrow': require('../assets/fonts/Gotham-Narrow-Book.otf'),
    // eslint-disable-next-line global-require
    'Digital-Numbers': require('../assets/fonts/Digital-Numbers.ttf'),
  });

  if (!loaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar hidden />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
