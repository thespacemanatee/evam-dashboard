import 'react-native-gesture-handler';
import React from 'react';

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './app/store';
import AppNavigator from './navigation/AppNavigator';

const App = (): React.ReactFragment => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <AppNavigator />
        </ApplicationProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
