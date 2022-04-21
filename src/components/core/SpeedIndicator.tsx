import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';

import { MAX_HEIGHT } from '../../utils/config';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: MAX_HEIGHT / 3,
  },
  units: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: MAX_HEIGHT / 15,
  },
});

interface SpeedIndicatorProps {
  progress: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ progress, style }) => {
  const animatedProps = useAnimatedProps(() => ({
    text: progress.value.toString().padStart(2, '0'),
  }));

  return (
    <View style={style}>
      <View style={styles.container}>
        <AnimateableText
          animatedProps={animatedProps}
          style={styles.speedIndicator}
        />
        <Text style={styles.units}>KM/H</Text>
      </View>
    </View>
  );
};

SpeedIndicator.defaultProps = {
  style: undefined,
};

export default SpeedIndicator;
