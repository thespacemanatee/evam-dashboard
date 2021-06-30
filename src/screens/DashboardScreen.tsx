import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { FINAL_BASE_GRAPHIC_HEIGHT } from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';
import ThemedButton from '../components/ThemedButton';
import BatteryStatistics from '../components/BatteryStatistics';
import DashboardButtonGroup from '../components/DashboardMenu';

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
  batteryContainer: {
    position: 'absolute',
    right: 32,
  },
  menuContainer: {
    position: 'absolute',
    left: 32,
  },
  analogIndicators: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    bottom: 16,
    left: 0,
    right: 0,
  },
  speedIndicator: {
    position: 'absolute',
    top: 20,
  },
  leftTachometer: {
    right: 70,
  },
  rightTachometer: {
    left: 70,
  },
  button: {
    zIndex: 10,
    marginHorizontal: 20,
  },
});

const DashboardScreen = ({ navigation }) => {
  const brakeProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);

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
      <View style={styles.batteryContainer}>
        <BatteryStatistics />
      </View>
      <View style={styles.analogIndicators}>
        <ThemedButton
          onPressIn={handleBrakeIn}
          onPressOut={handleBrakeOut}
          style={styles.button}>
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
          style={styles.button}>
          THROTTLE
        </ThemedButton>
      </View>
      <View style={styles.menuContainer}>
        <DashboardButtonGroup />
      </View>
    </View>
  );
};

export default DashboardScreen;
