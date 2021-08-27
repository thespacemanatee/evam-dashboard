import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import AnimateableText from 'react-native-animateable-text';
import {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import Battery from './Battery';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  stats: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: 32,
    marginTop: 5,
  },
  units: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
    fontSize: 16,
  },
});

type BatteryStatisticsProps = {
  style?: StyleProp<ViewStyle>;
};

const BatteryStatistics = ({ style }: BatteryStatisticsProps): JSX.Element => {
  const voltage = useSharedValue(0);
  const ampere = useSharedValue(0);
  const temperature = useSharedValue(0);

  useEffect(() => {
    voltage.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      true,
    );
    ampere.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.linear }),
      -1,
      true,
    );
    temperature.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.linear }),
      -1,
      true,
    );
  });

  const voltageProps = useAnimatedProps(() => {
    return {
      text: interpolate(voltage.value, [0, 1], [78, 82]).toFixed(1),
    };
  });

  const ampereProps = useAnimatedProps(() => {
    return {
      text: interpolate(ampere.value, [0, 1], [498, 502]).toFixed(1),
    };
  });

  const temperatureProps = useAnimatedProps(() => {
    return {
      text: interpolate(temperature.value, [0, 1], [90, 100]).toFixed(1),
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Battery />
      <View style={styles.statsContainer}>
        <AnimateableText animatedProps={voltageProps} style={styles.stats} />
        <Text style={styles.units}>V</Text>
      </View>
      <View style={styles.statsContainer}>
        <AnimateableText animatedProps={ampereProps} style={styles.stats} />
        <Text style={styles.units}>A</Text>
      </View>
      <View style={styles.statsContainer}>
        <AnimateableText
          animatedProps={temperatureProps}
          style={styles.stats}
        />
        <Text style={styles.units}>°C</Text>
      </View>
    </View>
  );
};

BatteryStatistics.defaultProps = {
  style: undefined,
};

export default BatteryStatistics;
