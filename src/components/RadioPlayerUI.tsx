import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  RADIO_BUTTON_SIZE,
  RADIO_LABEL_HEIGHT,
  RADIO_LABEL_WIDTH,
} from '../utils/config';

const styles = StyleSheet.create({
  radioLabelContainer: {
    position: 'absolute',
    width: 150,
    top: -RADIO_LABEL_HEIGHT,
    overflow: 'hidden',
  },
  radioLabel: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
    fontSize: 24,
    width: RADIO_LABEL_WIDTH,
  },
  radioControls: {
    flexDirection: 'row',
  },
});

type RadioPlayerUIProps = {
  onPressRadioLabel?: () => void;
  onPressSkipBack: () => void;
  onPressPlayPause: () => void;
  onPressSkipForward: () => void;
  playing: boolean;
  currentChannel: string;
  style?: StyleProp<ViewStyle>;
};

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

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 7500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      right: interpolate(
        progress.value,
        [0, 1],
        [-RADIO_LABEL_WIDTH, RADIO_LABEL_WIDTH],
      ),
    };
  });

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPressRadioLabel}
        style={styles.radioLabelContainer}>
        <Animated.Text style={[styles.radioLabel, labelAnimatedStyle]}>
          {currentChannel}
        </Animated.Text>
      </TouchableOpacity>
      <View style={styles.radioControls}>
        <TouchableOpacity onPress={onPressSkipBack}>
          <Ionicons
            name='play-skip-back-circle'
            color='white'
            size={RADIO_BUTTON_SIZE}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressPlayPause}>
          <Ionicons
            name={playing ? 'pause-circle' : 'play-circle'}
            color='white'
            size={48}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSkipForward}>
          <Ionicons
            name='play-skip-forward-circle'
            color='white'
            size={RADIO_BUTTON_SIZE}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

RadioPlayerUI.defaultProps = {
  onPressRadioLabel: undefined,
  style: undefined,
};

export default RadioPlayerUI;
