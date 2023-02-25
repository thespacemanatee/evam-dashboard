/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import React from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import colors from '../../utils/colors';

const styles = StyleSheet.create({
  indicator: {
    width: 25.5,
    height: 25.5,
    borderColor: '#838383',
    borderRadius: 17.25,
    borderWidth: 1,
  },
});

interface IndicatorProps {
  status?: number;
  style?: StyleProp<ViewStyle>;
}

const Indicator = ({ status, style }: IndicatorProps): JSX.Element => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        status === 1
          ? colors.nodeActive
          : status === 255
          ? colors.nodeInactive
          : colors.nodeError,
    };
  });
  return <Animated.View style={[styles.indicator, animatedStyle, style]} />;
};

export default Indicator;
