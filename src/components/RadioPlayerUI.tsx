import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { RADIO_BUTTON_SIZE } from '../utils/config';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 180,
  },
  radioLabel: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
    fontSize: 24,
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
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={onPressRadioLabel}>
        <Text style={styles.radioLabel}>{currentChannel}</Text>
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
