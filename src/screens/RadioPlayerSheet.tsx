import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import RadioPlayer from 'react-native-radio-player';

import SheetHandle from '../components/sheet/SheetHandle';
import RadioPlayerUI from '../components/radio/RadioPlayerUI';
import colors from '../utils/colors';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { channelsSelector } from '../features/radio/channelsSlice';
import { setCurrentChannel } from '../features/radio/playerSlice';
import RadioChannelItem from '../components/radio/RadioChannelItem';
import { type RadioChannel } from '../index';
import { SafeAreaView } from 'react-native-safe-area-context';

const RADIO_IMAGE_SIZE = 176;

const styles = StyleSheet.create({
  bottomSheetBackdrop: {
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  bottomSheetHeader: {
    fontSize: 36,
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bottomSheetContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioChannelList: {
    marginRight: 32,
  },
  bottomSheetRadioPlayerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  imageBackground: {
    backgroundColor: 'black',
    borderRadius: 8,
    marginBottom: 8,
  },
});

interface RadioPlayerSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
}

const RadioPlayerSheet = ({ sheetRef }: RadioPlayerSheetProps): JSX.Element => {
  const channels = useAppSelector(channelsSelector.selectAll);
  const currentChannel = useAppSelector((state) => state.player.currentChannel);
  const [isPlaying, setIsPlaying] = useState(false);

  const dispatch = useAppDispatch();

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

  const handlePressChannelItem = useCallback(
    async (channel: RadioChannel) => {
      try {
        await RadioPlayer.radioURL(channel.url);
        if (!isPlaying) {
          await RadioPlayer.play();
          setIsPlaying(true);
        }
        dispatch(setCurrentChannel(channel));
      } catch (err) {
        console.error(err);
      }
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
      snapPoints={['90%']}
      enablePanDownToClose
      handleComponent={(props) => <SheetHandle {...props} />}
      backgroundComponent={(props) => (
        <View style={[props.style, styles.bottomSheetBackdrop]} />
      )}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.8} />
      )}
    >
      <SafeAreaView style={styles.bottomSheetContentContainer}>
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
          style={styles.bottomSheetRadioPlayerContainer}
        >
          <View style={styles.imageBackground}>
            <Image
              source={{
                uri: currentChannel?.imageUrl,
                width: RADIO_IMAGE_SIZE,
                height: RADIO_IMAGE_SIZE,
              }}
              resizeMode="contain"
            />
          </View>
          <RadioPlayerUI
            onPressSkipBack={handleSkipBack}
            onPressPlayPause={handlePlayPause}
            onPressSkipForward={handleSkipForward}
            playing={isPlaying}
            currentChannel={currentChannel?.name ?? ''}
          />
        </LinearGradient>
      </SafeAreaView>
    </BottomSheet>
  );
};

export default RadioPlayerSheet;
