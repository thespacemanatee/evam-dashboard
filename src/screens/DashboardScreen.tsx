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
    alignItems: 'flex-start',
    bottom: 16,
    left: 0,
    right: 0,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: FINAL_TOP_INDICATOR_HEIGHT + 16,
  },
});

const DashboardScreen = ({ navigation }) => {
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.screen}>
      <TopIndicator style={styles.topIndicator} />
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <View style={styles.analogIndicators}>
        <LeftTachometer />
        <SpeedIndicator />
        <RightTachometer />
      </View>
      <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
        <Ionicons name='settings-outline' size={32} color='gray' />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
