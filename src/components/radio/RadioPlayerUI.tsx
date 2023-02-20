import { Ionicons } from '@expo/vector-icons';
import { useEffect, useCallback } from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const RADIO_BUTTON_SIZE = 48;
const RADIO_LABEL_HEIGHT = 48;
const RADIO_LABEL_WIDTH = 240;

const styles = StyleSheet.create({
  container: {
    marginTop: RADIO_LABEL_HEIGHT,
  },
  radioLabelContainer: {
    position: 'absolute',
    width: 150,
    top: -RADIO_LABEL_HEIGHT,
    overflow: 'hidden',
  },
  radioTitle: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
  },
  radioLabel: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
    fontSize: 24,
    width: RADIO_LABEL_WIDTH,
  },
  radioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

interface RadioPlayerUIProps {
  onPressRadioLabel?: () => void;
  onPressSkipBack: () => void;
  onPressPlayPause: () => void;
  onPressSkipForward: () => void;
  playing: boolean;
  currentChannel: string;
  style?: StyleProp<ViewStyle>;
}

const RadioPlayerUI = ({
  onPressRadioLabel,
  onPressSkipBack,
  onPressPlayPause,
  onPressSkipForward,
  playing,
  currentChannel,
  style,
}: RadioPlayerUIProps): JSX.Element => {
  const progress = useSharedValue(0);

  const resetAnimation = useCallback(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  useEffect(() => {
    resetAnimation();
  }, [progress, resetAnimation]);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    right: interpolate(
      progress.value,
      [0.33, 0.66, 0.66, 1],
      [0, RADIO_LABEL_WIDTH, -RADIO_LABEL_WIDTH, 0],
      Extrapolate.CLAMP,
    ),
  }));

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={onPressRadioLabel}
        disabled={onPressRadioLabel == null}
        style={styles.radioLabelContainer}
      >
        <Text style={styles.radioTitle}>Now Playing</Text>
        <Animated.Text style={[styles.radioLabel, labelAnimatedStyle]}>
          {currentChannel}
        </Animated.Text>
      </TouchableOpacity>
      <View style={styles.radioControls}>
        <TouchableOpacity
          onPress={() => {
            resetAnimation();
            onPressSkipBack();
          }}
        >
          <Ionicons
            name="play-skip-back-circle"
            color="white"
            size={RADIO_BUTTON_SIZE}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressPlayPause}>
          <Ionicons
            name={playing ? 'pause-circle' : 'play-circle'}
            color="white"
            size={RADIO_BUTTON_SIZE + 16}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            resetAnimation();
            onPressSkipForward();
          }}
        >
          <Ionicons
            name="play-skip-forward-circle"
            color="white"
            size={RADIO_BUTTON_SIZE}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RadioPlayerUI;
