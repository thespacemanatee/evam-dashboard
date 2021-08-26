import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { Subscription } from 'react-native-ble-plx';

import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';
import BatteryStatistics from '../components/BatteryStatistics';
import DashboardButtonGroup from '../components/DashboardMenu';
import { useAppSelector } from '../app/hooks';
import { CORE_CHARACTERISTIC_UUID } from '../utils/constants';
import { bleManagerRef } from '../utils/BleHelper';
import { decodeBleString, getCharacteristic } from '../utils/utils';
import TopIndicator from '../components/TopIndicator';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  topIndicator: {
    position: 'absolute',
    width: '100%',
    top: 0,
  },
  menuContainer: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  batteryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 32,
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
});

const DashboardScreen = (): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const speedProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);
  const brakeProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      let subscription: Subscription | undefined;
      const getDevice = async () => {
        try {
          const device = await bleManagerRef.current?.devices([deviceUUID]);
          if (device) {
            const characteristic = await getCharacteristic(
              deviceUUID,
              CORE_CHARACTERISTIC_UUID,
            );
            subscription = characteristic?.monitor((err, cha) => {
              if (err) {
                console.error(err);
                return;
              }
              const decodedString = decodeBleString(cha?.value);
              speedProgress.value = withTiming(decodedString.charCodeAt(0), {
                duration: 1000,
              });
              throttleProgress.value = withTiming(decodedString.charCodeAt(1), {
                duration: 1000,
              });
              brakeProgress.value = withTiming(decodedString.charCodeAt(2), {
                duration: 1000,
              });
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      getDevice();

      return () => subscription?.remove();
    }, [brakeProgress, deviceUUID, speedProgress, throttleProgress]),
  );

  return (
    <View style={styles.screen}>
      <TopIndicator style={styles.topIndicator} />
      <View style={styles.analogIndicators}>
        <View style={styles.speedIndicator}>
          <SpeedIndicator progress={speedProgress} />
        </View>
        <View style={styles.leftTachometer}>
          <LeftTachometer progress={brakeProgress} />
        </View>
        <View style={styles.rightTachometer}>
          <RightTachometer progress={throttleProgress} />
        </View>
      </View>
      <View style={styles.batteryContainer}>
        <BatteryStatistics />
      </View>
      <View style={styles.menuContainer}>
        <DashboardButtonGroup />
      </View>
    </View>
  );
};

export default DashboardScreen;
