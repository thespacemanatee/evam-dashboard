import React from 'react';
import { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';

import { MAX_HEIGHT } from '../utils/config';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: MAX_HEIGHT,
  },
  speedIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    transform: [{ scaleX: 0.8 }],
    fontSize: MAX_HEIGHT / 2,
  },
  units: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: MAX_HEIGHT / 15,
    bottom: 0,
    right: MAX_HEIGHT / 6,
  },
});

interface SpeedIndicatorProps {
  progress: Animated.SharedValue<number>;
  style?: ViewStyle;
}

const SpeedIndicator = ({ progress, ...props }: SpeedIndicatorProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: interpolate(progress.value, [0, 1], [0, 50]).toFixed(1),
    };
  });
  return (
    <View {...props} style={[styles.container, props.style]}>
      <AnimateableText
        animatedProps={animatedProps}
        style={styles.speedIndicator}
      />
      <Text style={styles.units}>KM/H</Text>
    </View>
  );
};

SpeedIndicator.defaultProps = {
  style: null,
};

export default SpeedIndicator;
