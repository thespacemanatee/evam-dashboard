import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { Subscription } from 'react-native-ble-plx';
import { LinearGradient } from 'expo-linear-gradient';
import RadioPlayer from 'react-native-radio-player';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

import SpeedIndicator from '../components/SpeedIndicator';
import LeftTachometer from '../components/LeftTachometer';
import RightTachometer from '../components/RightTachometer';
import BatteryStatistics from '../components/BatteryStatistics';
import DashboardButtonGroup from '../components/DashboardMenu';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  CORE_CHARACTERISTIC_UUID,
  CORE_REFRESH_RATE,
} from '../utils/constants';
import { bleManagerRef } from '../utils/BleHelper';
import { decodeBleString, getCharacteristic } from '../utils/utils';
import TopIndicator from '../components/TopIndicator';
import { channelsSelector } from '../features/radio/channelsSlice';
import SheetHandle from '../components/SheetHandle';
import { setCurrentChannel } from '../features/radio/playerSlice';
import RadioPlayerUI from '../components/RadioPlayerUI';
import RadioChannelItem from '../components/RadioChannelItem';
import { RadioChannel } from '../types';
import colors from '../utils/colors';

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
  dashboardRadioPlayer: {
    position: 'absolute',
    left: 32,
    bottom: 32,
  },
  bottomSheetBackdrop: {
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  bottomSheetHeader: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    marginBottom: 16,
  },
  bottomSheetContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 32,
  },
  radioChannelList: {
    marginRight: 32,
  },
  bottomSheetRadioPlayerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  imageBackground: {
    backgroundColor: 'black',
    borderRadius: 8,
  },
  bottomSheetRadioPlayer: {
    marginTop: 8,
  },
});

const DashboardScreen = (): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const channels = useAppSelector(channelsSelector.selectAll);
  const currentChannel = useAppSelector((state) => state.player.currentChannel);
  const speedProgress = useSharedValue(0);
  const throttleProgress = useSharedValue(0);
  const brakeProgress = useSharedValue(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handlePressChannelItem = useCallback(
    (channel: RadioChannel) => {
      RadioPlayer.radioURL(channel.url);
      if (!isPlaying) {
        RadioPlayer.play();
        setIsPlaying(true);
      }
      dispatch(setCurrentChannel(channel));
    },
    [dispatch, isPlaying],
  );

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
                duration: CORE_REFRESH_RATE,
              });
              throttleProgress.value = withTiming(decodedString.charCodeAt(1), {
                duration: CORE_REFRESH_RATE,
              });
              brakeProgress.value = withTiming(decodedString.charCodeAt(2), {
                duration: CORE_REFRESH_RATE,
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
    ({ item }) => (
      <RadioChannelItem radioChannel={item} onPress={handlePressChannelItem} />
    ),
    [handlePressChannelItem],
  );

  return (
    <View style={styles.screen}>
      <TopIndicator style={styles.topIndicator} />
      <View style={[StyleSheet.absoluteFill, styles.analogIndicators]}>
        <View style={styles.leftTachometer}>
          <LeftTachometer progress={brakeProgress} />
        </View>
        <View style={styles.rightTachometer}>
          <RightTachometer progress={throttleProgress} />
        </View>
      </View>
      <View style={[StyleSheet.absoluteFill, styles.speedIndicator]}>
        <SpeedIndicator progress={speedProgress} />
      </View>
      <View style={styles.batteryContainer}>
        <BatteryStatistics />
      </View>
      <View style={styles.menuContainer}>
        <DashboardButtonGroup />
      </View>
      <RadioPlayerUI
        onPressRadioLabel={() => sheetRef.current?.snapToIndex(1)}
        onPressSkipBack={handleSkipBack}
        onPressPlayPause={handlePlayPause}
        onPressSkipForward={handleSkipForward}
        playing={isPlaying}
        currentChannel={currentChannel?.name || ''}
        style={styles.dashboardRadioPlayer}
      />
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['25%', '99.999%']}
        enablePanDownToClose
        handleComponent={(props) => <SheetHandle {...props} />}
        backgroundComponent={(props) => (
          <View style={[props.style, styles.bottomSheetBackdrop]} />
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} opacity={1} />
        )}>
        <View style={styles.bottomSheetContentContainer}>
          <View style={styles.radioChannelList}>
            <Text style={styles.bottomSheetHeader}>Radio Stations</Text>
            <BottomSheetFlatList
              data={channels}
              keyExtractor={(i) => String(i.id)}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <LinearGradient
            colors={[colors.background, '#414345']}
            style={styles.bottomSheetRadioPlayerContainer}>
            <View style={styles.imageBackground}>
              <Image
                source={{
                  uri: currentChannel?.imageUrl,
                  width: 200,
                  height: 200,
                }}
                resizeMode='contain'
              />
            </View>
            <RadioPlayerUI
              onPressSkipBack={handleSkipBack}
              onPressPlayPause={handlePlayPause}
              onPressSkipForward={handleSkipForward}
              playing={isPlaying}
              currentChannel={currentChannel?.name || ''}
              style={styles.bottomSheetRadioPlayer}
            />
          </LinearGradient>
        </View>
      </BottomSheet>
    </View>
  );
};

export default DashboardScreen;
