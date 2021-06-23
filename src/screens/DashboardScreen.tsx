import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  FINAL_BASE_GRAPHIC_HEIGHT,
  FINAL_TOP_INDICATOR_HEIGHT,
} from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import TopIndicator from '../components/TopIndicator';
import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  topIndicator: {
    marginTop: 16,
    position: 'absolute',
  },
  baseGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: FINAL_BASE_GRAPHIC_HEIGHT,
  },
  analogIndicators: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 16,
    left: 0,
    right: 30,
  },
  speedIndicator: {
    position: 'absolute',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: FINAL_TOP_INDICATOR_HEIGHT + 16,
  },
  leftTachometer: {
    marginRight: 50,
  },
  rightTachometer: {
    marginLeft: 50,
  },
});

const DashboardScreen = ({ navigation }) => {
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.screen}>
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <TopIndicator style={styles.topIndicator} />
      <View style={styles.analogIndicators}>
        <SpeedIndicator style={styles.speedIndicator} />
        <LeftTachometer style={styles.leftTachometer} />
        <RightTachometer style={styles.rightTachometer} />
      </View>
      <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
        <Ionicons name='settings-outline' size={32} color='gray' />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
