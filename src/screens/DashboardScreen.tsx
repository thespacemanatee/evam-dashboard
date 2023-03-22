import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { scanDevices } from '../utils/BleHelper';
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
import { type DashboardScreenProps } from '../navigation';
import { setSelectedDeviceUUID } from '../features/settings/settingsSlice';
import SteeringWheel from '../components/core/SteeringWheel';

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
  horizontalIndicatorContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 32,
  },
  horizontalIndicators: {
    flex: 1,
    justifyContent: 'center',
  },
  analogIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    bottom: 16,
  },
  speedIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftTachometer: {
    right: -120,
  },
  rightTachometer: {
    left: -120,
  },
  dashboardRadioPlayer: {
    position: 'absolute',
    left: 32,
    bottom: 32,
  },
  disconnectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  disconnectedCard: {
    padding: 32,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
  },
  disconnectedText: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: 40,
    textAlign: 'center',
  },
});

const DashboardScreen = ({ navigation }: DashboardScreenProps): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const channels = useAppSelector(channelsSelector.selectAll);
  const currentChannel = useAppSelector((state) => state.player.currentChannel);
  const [isPlaying, setIsPlaying] = useState(false);
  const [indicatorData, setIndicatorData] = useState<TopIndicatorData>();
  const [isReversing, setIsReversing] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [isBluetoothLoading, setIsBluetoothLoading] = useState(false);
  const velocity = useSharedValue(0);
  const acceleration = useSharedValue(0);
  const brake = useSharedValue(0);
  const steering = useSharedValue(127);
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

  const handlePlayPause = useCallback(async (): Promise<void> => {
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
  }, [isPlaying]);

  const handleSkipBack = useCallback(async (): Promise<void> => {
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
  }, [channels, currentChannel, dispatch]);

  const handleSkipForward = useCallback(async (): Promise<void> => {
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
  }, [channels, currentChannel, dispatch]);

  const monitorAndUpdateCoreValues = useCallback(
    async (uuid?: string) => {
      try {
        const coreCharacteristic = await getCoreCharacteristic(uuid);
        setIsDisconnected(false);
        return coreCharacteristic?.monitor((err, cha) => {
          if (err != null) {
            setIsDisconnected(true);
            console.error('[coreCharacteristic.monitor]', err);
            return;
          }
          const decodedString = decodeBleString(cha?.value);
          velocity.value = decodedString.charCodeAt(0);
          acceleration.value = decodedString.charCodeAt(1);
          brake.value = decodedString.charCodeAt(2);
          setIsReversing(decodedString.charCodeAt(3) === 1);
          steering.value = decodedString.charCodeAt(4);
        });
      } catch (err) {
        setIsDisconnected(true);
        console.error('[monitorAndUpdateCoreValues]', err);
      }
    },
    [acceleration, brake, steering, velocity],
  );

  const monitorAndUpdateStatusValues = useCallback(async (uuid?: string) => {
    try {
      const statusCharacteristic = await getStatusCharacteristic(uuid);
      setIsDisconnected(false);
      let decodedString: string;
      decodedString = decodeBleString(
        (await statusCharacteristic?.read())?.value,
      );
      setIndicatorData(getTopIndicatorData(decodedString));
      return statusCharacteristic?.monitor((err, cha) => {
        if (err != null) {
          setIsDisconnected(true);
          console.error('[statusCharacteristic.monitor]', err);
          return;
        }
        decodedString = decodeBleString(cha?.value);
        setIndicatorData(getTopIndicatorData(decodedString));
      });
    } catch (err) {
      setIsDisconnected(true);
      console.error('[monitorAndUpdateStatusValues]', err);
    }
  }, []);

  const monitorAndUpdateBatteryValues = useCallback(
    async (uuid?: string) => {
      try {
        const batteryCharacteristic = await getBatteryCharacteristic(uuid);
        setIsDisconnected(false);
        return batteryCharacteristic?.monitor((err, cha) => {
          if (err != null) {
            setIsDisconnected(true);
            console.error('[batteryCharacteristic.monitor]', err);
            return;
          }
          const decodedString = decodeBleString(cha?.value);
          battPercentage.value = decodedString.charCodeAt(0);
          battVoltage.value = decodedString.charCodeAt(1);
          battCurrent.value =
            (decodedString.charCodeAt(3) * 256 + decodedString.charCodeAt(2)) /
              10 -
            320;
          battTemperature.value = decodedString.charCodeAt(4);
        });
      } catch (err) {
        setIsDisconnected(true);
        console.error('[monitorAndUpdateBatteryValues]', err);
      }
    },
    [battCurrent, battPercentage, battTemperature, battVoltage],
  );

  const handleScanDevices = useCallback(async (): Promise<void> => {
    try {
      setIsBluetoothLoading(true);
      await scanDevices(
        (scannedDevice) => {
          if (scannedDevice.name === 'EVAM') {
            void (async () => {
              try {
                if (!(await scannedDevice.isConnected())) {
                  await scannedDevice.connect();
                  console.log(scannedDevice.name, 'is connected');
                  dispatch(setSelectedDeviceUUID(scannedDevice.id));
                }
              } catch (err) {
                console.error('[handleScanDevices]', err);
              }
            })();
          }
        },
        () => {
          setIsBluetoothLoading(false);
        },
      );
    } catch (err) {
      setIsBluetoothLoading(false);
      console.error(err);
    }
  }, [dispatch]);

  useEffect(() => {
    void handleScanDevices();
  }, [handleScanDevices]);

  useEffect(() => {
    let coreSubscription: Subscription | undefined;
    let statusSubscription: Subscription | undefined;
    let batterySubscription: Subscription | undefined;
    void (async () => {
      try {
        if (deviceUUID !== '') {
          coreSubscription = await monitorAndUpdateCoreValues(deviceUUID);
          statusSubscription = await monitorAndUpdateStatusValues(deviceUUID);
          batterySubscription = await monitorAndUpdateBatteryValues(deviceUUID);
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
        <View style={[StyleSheet.absoluteFill, styles.analogIndicators]}>
          <LeftTachometer progress={brake} style={styles.leftTachometer} />
          <View
            style={{
              borderWidth: 2,
              borderColor: isReversing ? 'red' : 'green',
              width: 60,
            }}
          >
            <Text
              style={{
                fontFamily: 'Gotham-Narrow',
                fontWeight: 'bold',
                fontSize: 40,
                color: isReversing ? 'red' : 'green',
              }}
            >
              {isReversing ? ' R ' : ' D '}
            </Text>
          </View>
          <RightTachometer
            progress={acceleration}
            style={styles.rightTachometer}
          />
        </View>
        <View style={styles.horizontalIndicatorContainer}>
          <View style={styles.horizontalIndicators}>
            <SteeringWheel progress={steering} />
          </View>
          <BatteryStatistics
            percentage={battPercentage}
            voltage={battVoltage}
            current={battCurrent}
            temperature={battTemperature}
            style={styles.horizontalIndicators}
          />
        </View>
        <SpeedIndicator progress={velocity} style={styles.speedIndicator} />
        <TopIndicator
          data={indicatorData}
          onPress={() => {
            navigation.navigate('Status');
          }}
        />
        {isDisconnected && (
          <View style={styles.disconnectedOverlay}>
            <View style={styles.disconnectedCard}>
              <Text style={styles.disconnectedText}>Disconnected</Text>
              {isBluetoothLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <TouchableOpacity
                  onPress={handleScanDevices}
                  style={{ flexDirection: 'row', marginTop: 16 }}
                >
                  <Text style={{ color: 'white', fontSize: 18 }}>
                    Try again
                  </Text>
                  <Ionicons
                    name="refresh-circle"
                    size={24}
                    color="white"
                    style={{ marginStart: 4 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
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
        <DashboardMenu style={styles.menu} />
      </View>
      <RadioPlayerSheet sheetRef={sheetRef} />
    </>
  );
};

export default DashboardScreen;
