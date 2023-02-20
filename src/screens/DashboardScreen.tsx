import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { type Subscription } from 'react-native-ble-plx';
import RadioPlayer from 'react-native-radio-player';
import type BottomSheet from '@gorhom/bottom-sheet';

import SpeedIndicator from '../components/core/SpeedIndicator';
import LeftTachometer from '../components/core/LeftTachometer';
import RightTachometer from '../components/core/RightTachometer';
import BatteryStatistics from '../components/battery/BatteryStatistics';
import DashboardMenu from '../components/ui/DashboardMenu';
import { useAppDispatch, useAppSelector } from '../app/hooks';
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
import { type TopIndicatorData } from '../index';
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
    right: -100,
  },
  rightTachometer: {
    left: -100,
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
    if (currentChannel != null) {
      void (async () => {
        try {
          await RadioPlayer.radioURL(currentChannel.url);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      dispatch(setCurrentChannel(channels[0]));
    }
  }, [channels, currentChannel, dispatch]);

  const handlePlayPause = async (): Promise<void> => {
    try {
      if (isPlaying) {
        await RadioPlayer.stop();
        setIsPlaying(false);
      } else {
        await RadioPlayer.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkipBack = async (): Promise<void> => {
    try {
      if (currentChannel != null) {
        const nextChannelId =
          currentChannel.id - 2 < 0
            ? channels.length - 1
            : currentChannel?.id - 2;
        const nextChannel = channels[nextChannelId];
        await RadioPlayer.radioURL(nextChannel.url);
        dispatch(setCurrentChannel(nextChannel));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkipForward = async (): Promise<void> => {
    try {
      if (currentChannel != null) {
        const nextChannelId =
          currentChannel.id > channels.length - 1 ? 0 : currentChannel.id;
        const nextChannel = channels[nextChannelId];
        await RadioPlayer.radioURL(nextChannel.url);
        dispatch(setCurrentChannel(nextChannel));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const monitorAndUpdateCoreValues = useCallback(async () => {
    try {
      const coreCharacteristic = await getCoreCharacteristic();
      return coreCharacteristic?.monitor((err, cha) => {
        if (err != null) {
          console.error(err);
          return;
        }
        const decodedString = decodeBleString(cha?.value);
        velocity.value = decodedString.charCodeAt(0);
        acceleration.value = decodedString.charCodeAt(1);
        brake.value = decodedString.charCodeAt(2);
      });
    } catch (err) {
      console.error(err);
    }
  }, [acceleration, brake, velocity]);

  const monitorAndUpdateStatusValues = useCallback(async () => {
    try {
      const statusCharacteristic = await getStatusCharacteristic();
      let decodedString: string;
      decodedString = decodeBleString(
        (await statusCharacteristic?.read())?.value,
      );
      setIndicatorData(getTopIndicatorData(decodedString));

      return statusCharacteristic?.monitor((err, cha) => {
        if (err != null) {
          console.error(err);
          return;
        }
        decodedString = decodeBleString(cha?.value);
        setIndicatorData(getTopIndicatorData(decodedString));
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const monitorAndUpdateBatteryValues = useCallback(async () => {
    const batteryCharacteristic = await getBatteryCharacteristic();

    return batteryCharacteristic?.monitor((err, cha) => {
      if (err != null) {
        console.error(err);
        return;
      }
      const decodedString = decodeBleString(cha?.value);
      battPercentage.value = decodedString.charCodeAt(0) / 10;
      battVoltage.value = decodedString.charCodeAt(1) / 10;
      battCurrent.value =
        (decodedString.charCodeAt(2) * 256 + decodedString.charCodeAt(3)) / 10 -
        320;
      battTemperature.value = decodedString.charCodeAt(4) / 10;
    });
  }, [battCurrent, battPercentage, battTemperature, battVoltage]);

  useEffect(() => {
    let coreSubscription: Subscription | undefined;
    let statusSubscription: Subscription | undefined;
    let batterySubscription: Subscription | undefined;
    void (async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device != null && device.length > 0) {
          coreSubscription = await monitorAndUpdateCoreValues();
          statusSubscription = await monitorAndUpdateStatusValues();
          batterySubscription = await monitorAndUpdateBatteryValues();
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      coreSubscription?.remove();
      statusSubscription?.remove();
      batterySubscription?.remove();
    };
  }, [
    deviceUUID,
    monitorAndUpdateBatteryValues,
    monitorAndUpdateCoreValues,
    monitorAndUpdateStatusValues,
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
        <DashboardMenu style={styles.menu} />
        <RadioPlayerUI
          onPressRadioLabel={() => {
            sheetRef.current?.expand();
          }}
          onPressSkipBack={handleSkipBack}
          onPressPlayPause={handlePlayPause}
          onPressSkipForward={handleSkipForward}
          playing={isPlaying}
          currentChannel={currentChannel?.name ?? ''}
          style={styles.dashboardRadioPlayer}
        />
      </View>
      <RadioPlayerSheet sheetRef={sheetRef} />
    </>
  );
};

export default DashboardScreen;
