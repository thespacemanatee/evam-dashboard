import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import type Animated from 'react-native-reanimated';
import { useAnimatedProps } from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
  },
  units: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
  },
});

interface SpeedIndicatorProps {
  progress: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

const SpeedIndicator: React.FC<SpeedIndicatorProps> = ({ progress, style }) => {
  const { width } = useWindowDimensions();

  const animatedProps = useAnimatedProps(() => ({
    text: progress.value.toString().padStart(3, '0'),
  }));

  return (
    <View style={[styles.container, style]}>
      <AnimateableText
        animatedProps={animatedProps}
        style={[styles.speedIndicator, { fontSize: width / 6 }]}
      />
      <Text style={[styles.units, { fontSize: width / 32 }]}>KM/H</Text>
    </View>
  );
};

export default SpeedIndicator;
