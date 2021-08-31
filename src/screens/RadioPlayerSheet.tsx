import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import RadioPlayer from 'react-native-radio-player';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

import SheetHandle from '../components/SheetHandle';
import RadioPlayerUI from '../components/RadioPlayerUI';
import colors from '../utils/colors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { channelsSelector } from '../features/radio/channelsSlice';
import { setCurrentChannel } from '../features/radio/playerSlice';
import RadioChannelItem from '../components/RadioChannelItem';
import { RadioChannel } from '../index';

const styles = StyleSheet.create({
  bottomSheetBackdrop: {
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  bottomSheetHeader: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontWeight: 'bold',
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

type RadioPlayerSheetProps = {
  sheetRef: React.RefObject<BottomSheetMethods>;
};

const RadioPlayerSheet = ({ sheetRef }: RadioPlayerSheetProps): JSX.Element => {
  const channels = useAppSelector(channelsSelector.selectAll);
  const currentChannel = useAppSelector((state) => state.player.currentChannel);
  const [isPlaying, setIsPlaying] = useState(false);

  const dispatch = useAppDispatch();

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

  const renderItem = useCallback(
    ({ item }) => (
      <RadioChannelItem radioChannel={item} onPress={handlePressChannelItem} />
    ),
    [handlePressChannelItem],
  );

  return (
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
  );
};

export default RadioPlayerSheet;
