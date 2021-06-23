import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import {
  BASE_GRAPHIC_HEIGHT,
  BASE_GRAPHIC_WIDTH,
  MAX_WIDTH,
} from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import TopIndicator from '../components/TopIndicator';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  baseGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: BASE_GRAPHIC_HEIGHT * (MAX_WIDTH / BASE_GRAPHIC_WIDTH),
  },
  text: {
    textAlign: 'center',
  },
  scanButton: {
    marginVertical: 16,
  },
  indicator: {
    position: 'absolute',
    right: 20,
  },
});

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <TopIndicator style={{ marginTop: 16, position: 'absolute' }} />
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            alignItems: 'flex-end',
          }}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Digital-Numbers',
              fontSize: 200,
            }}>
            88.8
          </Text>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Gotham-Narrow',
              fontSize: 20,
            }}>
            KM/H
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Dashboard;
