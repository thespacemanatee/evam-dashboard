/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useSharedValue } from 'react-native-reanimated';
import { Subscription } from 'react-native-ble-plx';
import RadioPlayer from 'react-native-radio-player';
import BottomSheet from '@gorhom/bottom-sheet';

import SpeedIndicator from '../components/core/SpeedIndicator';
import LeftTachometer from '../components/core/LeftTachometer';
import RightTachometer from '../components/core/RightTachometer';
import BatteryStatistics from '../components/battery/BatteryStatistics';
import DashboardButtonGroup from '../components/ui/DashboardMenu';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { SLOW_REFRESH_RATE } from '../utils/config';
import { bleManagerRef } from '../utils/BleHelper';
import {
  decodeBleString,
  getBatteryCharacteristic,
  getCoreCharacteristic,
  getStatusCharacteristic,
  getTopIndicatorData,
} from '../utils/utils';
import { channelsSelector } from '../features/radio/channelsSlice';
import { setCurrentChannel } from '../features/radio/playerSlice';
import RadioPlayerUI from '../components/radio/RadioPlayerUI';
import TopIndicator from '../components/status/TopIndicator';
import { TopIndicatorData } from '../index';
import RadioPlayerSheet from './RadioPlayerSheet';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  menu: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  battery: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 16,
  },
  analogIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    bottom: 16,
  },
  speedIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftTachometer: {
    right: 70,
  },
  rightTachometer: {
    left: 70,
  },
  dashboardRadioPlayer: {
    position: 'absolute',
    left: 32,
    bottom: 32,
  },
});

const DashboardScreen = (): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const channels = useAppSelector(channelsSelector.selectAll);
  const currentChannel = useAppSelector((state) => state.player.currentChannel);
  const [isPlaying, setIsPlaying] = useState(false);
  const [indicatorData, setIndicatorData] = useState<TopIndicatorData>();
  const velocity = useSharedValue(0);
  const acceleration = useSharedValue(0);
  const brake = useSharedValue(0);
  const battPercentage = useSharedValue(0);
  const battVoltage = useSharedValue(0);
  const battCurrent = useSharedValue(0);
  const battTemperature = useSharedValue(0);
  const sheetRef = useRef<BottomSheet>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentChannel) {
      RadioPlayer.radioURL(currentChannel.url);
    } else {
      dispatch(setCurrentChannel(channels[0]));
    }
  }, [channels, currentChannel, dispatch]);

  const handlePlayPause = () => {
    if (isPlaying) {
      RadioPlayer.stop();
      setIsPlaying(false);
    } else {
      RadioPlayer.play();
      setIsPlaying(true);
    }
  };

  const handleSkipBack = () => {
    if (currentChannel) {
      const nextChannelId =
        currentChannel.id - 2 < 0
          ? channels.length - 1
          : currentChannel?.id - 2;
      const nextChannel = channels[nextChannelId];
      RadioPlayer.radioURL(nextChannel.url);
      dispatch(setCurrentChannel(nextChannel));
    }
  };

  const handleSkipForward = () => {
    if (currentChannel) {
      const nextChannelId =
        currentChannel.id > channels.length - 1 ? 0 : currentChannel.id;
      const nextChannel = channels[nextChannelId];
      RadioPlayer.radioURL(nextChannel.url);
      dispatch(setCurrentChannel(nextChannel));
    }
  };

  const monitorAndUpdateCoreValues = useCallback(async () => {
    const coreCharacteristic = await getCoreCharacteristic();
    return coreCharacteristic?.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      const decodedString = decodeBleString(cha?.value);
      velocity.value = decodedString.charCodeAt(0);
      acceleration.value = decodedString.charCodeAt(1);
      brake.value = decodedString.charCodeAt(2);
    });
  }, [acceleration, brake, velocity]);

  const monitorAndUpdateStatusValues = useCallback(async () => {
    const statusCharacteristic = await getStatusCharacteristic();
    let decodedString: string;
    decodedString = decodeBleString(
      (await statusCharacteristic?.read())?.value,
    );
    setIndicatorData(getTopIndicatorData(decodedString));

    return statusCharacteristic?.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      decodedString = decodeBleString(cha?.value);
      setIndicatorData(getTopIndicatorData(decodedString));
    });
  }, []);

  const monitorAndUpdateBatteryValues = useCallback(async () => {
    const batteryCharacteristic = await getBatteryCharacteristic();

    return batteryCharacteristic?.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      const decodedString = decodeBleString(cha?.value);
      battPercentage.value = decodedString.charCodeAt(0);
      battVoltage.value = decodedString.charCodeAt(1);
      battCurrent.value =
        (decodedString.charCodeAt(2) * 256 + decodedString.charCodeAt(3)) / 10 -
        320;
      battTemperature.value = decodedString.charCodeAt(4);
    });
  }, [battCurrent, battPercentage, battTemperature, battVoltage]);

  useEffect(() => {
    let coreSubscription: Subscription | undefined;
    let statusSubscription: Subscription | undefined;
    let batterySubscription: Subscription | undefined;
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device && device.length > 0) {
          coreSubscription = await monitorAndUpdateCoreValues();
          statusSubscription = await monitorAndUpdateStatusValues();
          batterySubscription = await monitorAndUpdateBatteryValues();
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();

    return () => {
      coreSubscription?.remove();
      statusSubscription?.remove();
      batterySubscription?.remove();
    };
  }, [
    monitorAndUpdateCoreValues,
    monitorAndUpdateStatusValues,
    monitorAndUpdateBatteryValues,
    deviceUUID,
  ]);

  return (
    <>
      <View style={styles.screen}>
        <TopIndicator data={indicatorData} />
        <View style={[StyleSheet.absoluteFill, styles.analogIndicators]}>
          <LeftTachometer progress={brake} style={styles.leftTachometer} />
          <RightTachometer
            progress={acceleration}
            style={styles.rightTachometer}
          />
        </View>
        <SpeedIndicator
          progress={velocity}
          style={[StyleSheet.absoluteFill, styles.speedIndicator]}
        />
        <BatteryStatistics
          percentage={battPercentage}
          voltage={battVoltage}
          current={battCurrent}
          temperature={battTemperature}
          style={styles.battery}
        />
        <DashboardButtonGroup style={styles.menu} />
        <RadioPlayerUI
          onPressRadioLabel={() => sheetRef.current?.expand()}
          onPressSkipBack={handleSkipBack}
          onPressPlayPause={handlePlayPause}
          onPressSkipForward={handleSkipForward}
          playing={isPlaying}
          currentChannel={currentChannel?.name || ''}
          style={styles.dashboardRadioPlayer}
        />
      </View>
      <RadioPlayerSheet sheetRef={sheetRef} />
    </>
  );
};

export default DashboardScreen;
