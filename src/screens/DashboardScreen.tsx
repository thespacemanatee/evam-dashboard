import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { Subscription } from 'react-native-ble-plx';
import { Ionicons } from '@expo/vector-icons';
import RadioPlayer, { RadioPlayerEvents } from 'react-native-radio-player';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

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
import { channelsSelector } from '../features/radio/channelsSlice';
import { RadioChannel } from '../types';
import SheetHandle from '../components/SheetHandle';

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
});

const DashboardScreen = (): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const channels = useAppSelector(channelsSelector.selectAll);
  const speedProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);
  const brakeProgress = useSharedValue(0);
  const [playerState, setPlayerState] = useState('stopped');
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    const subscription = RadioPlayerEvents.addListener(
      'stateDidChange',
      (eventObject) => {
        setPlayerState(eventObject.state);
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    RadioPlayer.radioURL(
      'https://19183.live.streamtheworld.com/YES933_SC?dist=radiosingapore',
    );
    RadioPlayer.play();
  }, []);

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

  const renderItem = useCallback(
    ({ item }: { item: RadioChannel }) => (
      <View>
        <Text style={{ color: 'white' }}>{item.channel}</Text>
        <Text style={{ color: 'white' }}>{item.name}</Text>
        <Text style={{ color: 'white' }}>{item.url}</Text>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.screen}>
      <TopIndicator style={styles.topIndicator} />
      <View style={[StyleSheet.absoluteFill, styles.speedIndicator]}>
        <SpeedIndicator progress={speedProgress} />
      </View>
      <View style={[StyleSheet.absoluteFill, styles.analogIndicators]}>
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
      <View style={{ position: 'absolute', left: 32, bottom: 32 }}>
        <TouchableOpacity onPress={() => sheetRef.current?.snapToIndex(1)}>
          <Ionicons name='play-circle' color='white' size={32} />
        </TouchableOpacity>
      </View>
      <BottomSheet
        ref={sheetRef}
        snapPoints={['25%', '90%']}
        enablePanDownToClose
        handleComponent={(props) => {
          console.log(props);
          return (
            <SheetHandle
              animatedIndex={props.animatedIndex}
              animatedPosition={props.animatedPosition}
            />
          );
        }}
        backgroundComponent={(props) => (
          <View style={[props.style, { backgroundColor: 'black' }]} />
        )}>
        <BottomSheetFlatList
          data={channels}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          // contentContainerStyle={styles.contentContainer}
        />
      </BottomSheet>
    </View>
  );
};

export default DashboardScreen;
