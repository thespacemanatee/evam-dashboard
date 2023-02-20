import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import AnimateableText from 'react-native-animateable-text';
import type Animated from 'react-native-reanimated';
import { useAnimatedProps } from 'react-native-reanimated';

import Battery from './Battery';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  battery: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  stats: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: 32,
  },
  units: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
    fontSize: 16,
  },
});

interface BatteryStatisticsProps {
  percentage: Animated.SharedValue<number>;
  voltage: Animated.SharedValue<number>;
  current: Animated.SharedValue<number>;
  temperature: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

const BatteryStatistics = ({
  percentage,
  voltage,
  current,
  temperature,
  style,
}: BatteryStatisticsProps): JSX.Element => {
  const voltageProps = useAnimatedProps(() => {
    return {
      text: voltage.value.toFixed(1),
    };
  });

  const ampereProps = useAnimatedProps(() => {
    return {
      text: current.value.toFixed(1),
    };
  });

  const temperatureProps = useAnimatedProps(() => {
    return {
      text: temperature.value.toFixed(1),
    };
  });

  return (
    <View style={style}>
      <View style={styles.container}>
        <Battery percentage={percentage} style={styles.battery} />
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
    </View>
  );
};

export default BatteryStatistics;
