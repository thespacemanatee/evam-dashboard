/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import colors from '../utils/colors';

const styles = StyleSheet.create({
  indicator: {
    width: 25.5,
    height: 25.5,
    borderColor: '#838383',
    borderRadius: 17.25,
    borderWidth: 1,
  },
});

type IndicatorProps = {
  status?: number;
  style?: StyleProp<ViewStyle>;
};

const Indicator = ({ status, style }: IndicatorProps): JSX.Element => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        status === 1
          ? colors.nodeActive
          : status === 0
          ? colors.nodeError
          : colors.nodeInactive,
    };
  });
  return <Animated.View style={[styles.indicator, animatedStyle, style]} />;
};

Indicator.defaultProps = {
  status: -1,
  style: undefined,
};

export default Indicator;
