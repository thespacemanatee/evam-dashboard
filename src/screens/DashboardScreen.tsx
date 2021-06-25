import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { FINAL_BASE_GRAPHIC_HEIGHT } from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import TopIndicator from '../components/TopIndicator';
import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';
import ThemedButton from '../components/ThemedButton';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  baseGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '101.75%',
    height: FINAL_BASE_GRAPHIC_HEIGHT * 1.1,
  },
  analogIndicators: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
  },
  speedIndicator: {
    position: 'absolute',
    top: 20,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  leftTachometer: {
    right: 70,
  },
  rightTachometer: {
    left: 70,
  },
  buttonRight: {
    position: 'absolute',
    left: 32,
  },
  buttonLeft: {
    position: 'absolute',
    right: 32,
  },
});

const DashboardScreen = ({ navigation }) => {
  const brakeProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleBrakeIn = () => {
    brakeProgress.value = withTiming(1, { duration: 1000 });
  };

  const handleThrottleIn = () => {
    throttleProgress.value = withTiming(1, { duration: 1000 });
  };

  const handleBrakeOut = () => {
    brakeProgress.value = withTiming(0, { duration: 1000 });
  };

  const handleThrottleOut = () => {
    throttleProgress.value = withTiming(0, { duration: 1000 });
  };

  return (
    <View style={styles.screen}>
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <View style={styles.analogIndicators}>
        <ThemedButton
          onPressIn={handleBrakeIn}
          onPressOut={handleBrakeOut}
          style={styles.buttonRight}>
          BRAKE
        </ThemedButton>
        <View style={styles.speedIndicator}>
          <SpeedIndicator progress={throttleProgress} />
        </View>
        <View style={styles.leftTachometer}>
          <LeftTachometer progress={brakeProgress} />
        </View>
        <View style={styles.rightTachometer}>
          <RightTachometer progress={throttleProgress} />
        </View>
        <ThemedButton
          onPressIn={handleThrottleIn}
          onPressOut={handleThrottleOut}
          style={styles.buttonLeft}>
          THROTTLE
        </ThemedButton>
      </View>
      <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
        <Ionicons name='bluetooth-outline' size={32} color='gray' />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
