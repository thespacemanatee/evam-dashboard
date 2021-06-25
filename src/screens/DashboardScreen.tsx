import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue, withTiming } from 'react-native-reanimated';

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
    width: '100%',
    alignItems: 'center',
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
    top: 0,
  },
  settingsButton: {
    position: 'absolute',
    right: 32,
    top: 32,
  },
  leftTachometer: {
    right: 70,
  },
  rightTachometer: {
    left: 70,
  },
  tachoButtonRight: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'red',
    left: 32,
    width: 100,
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  tachoButtonLeft: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'red',
    right: 32,
    width: 100,
    padding: 10,
    borderRadius: 5,
  },
  tachoText: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
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
      <View style={styles.topIndicator}>
        <TopIndicator />
      </View>
      <View style={styles.analogIndicators}>
        <Pressable
          android_ripple={{ color: '#000000 ' }}
          onPressIn={handleBrakeIn}
          onPressOut={handleBrakeOut}
          style={styles.tachoButtonRight}>
          <Text style={styles.tachoText}>BRAKE</Text>
        </Pressable>
        <View style={styles.speedIndicator}>
          <SpeedIndicator progress={throttleProgress} />
        </View>
        <View style={styles.leftTachometer}>
          <LeftTachometer progress={brakeProgress} />
        </View>
        <View style={styles.rightTachometer}>
          <RightTachometer progress={throttleProgress} />
        </View>
        <Pressable
          android_ripple={{ color: '#000000 ' }}
          onPressIn={handleThrottleIn}
          onPressOut={handleThrottleOut}
          style={styles.tachoButtonLeft}>
          <Text style={styles.tachoText}>THROTTLE</Text>
        </Pressable>
      </View>
      <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
        <Ionicons name='bluetooth-outline' size={32} color='gray' />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
