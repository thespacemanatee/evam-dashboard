import React, { useCallback } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { FINAL_BASE_GRAPHIC_HEIGHT } from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';
import BatteryStatistics from '../components/BatteryStatistics';
import DashboardButtonGroup from '../components/DashboardMenu';
import { useAppSelector } from '../app/hooks';
import { CORE_CHARACTERISTIC_UUID } from '../utils/constants';
import { bleManagerRef } from '../utils/BleHelper';
import { decodeBleString, getCharacteristic } from '../utils/utils';

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

const DashboardScreen = () => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const speedProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);
  const brakeProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const getDevice = async () => {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device) {
          const characteristic = await getCharacteristic(
            deviceUUID,
            CORE_CHARACTERISTIC_UUID,
          );
          characteristic?.monitor((err, cha) => {
            if (err) {
              console.warn('Disconnected BLE device', err);
              return;
            }
            const decodedString = decodeBleString(cha?.value);
            speedProgress.value = withTiming(decodedString.charCodeAt(0) / 100);
            throttleProgress.value = withTiming(
              decodedString.charCodeAt(1) / 100,
            );
            brakeProgress.value = withTiming(decodedString.charCodeAt(2) / 100);
          });
        }
      };
      getDevice();
    }, [brakeProgress, deviceUUID, speedProgress, throttleProgress]),
  );

  return (
    <View style={styles.screen}>
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <View style={styles.batteryContainer}>
        <BatteryStatistics />
      </View>
      <View style={styles.analogIndicators}>
        <View style={styles.speedIndicator}>
          <SpeedIndicator progress={throttleProgress} />
        </View>
        <View style={styles.leftTachometer}>
          <LeftTachometer progress={brakeProgress} />
        </View>
        <View style={styles.rightTachometer}>
          <RightTachometer progress={throttleProgress} />
        </View>
      </View>
      <View style={styles.menuContainer}>
        <DashboardButtonGroup />
      </View>
    </View>
  );
};

export default DashboardScreen;
