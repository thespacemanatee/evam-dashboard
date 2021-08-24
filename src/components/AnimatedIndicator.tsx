import React from 'react';
import Animated, {
  interpolateColor,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedIndicatorProps {
  transform: string;
  progress: Animated.SharedValue<number>;
}

const AnimatedIndicator: React.FC<AnimatedIndicatorProps> = ({
  transform,
  progress,
}) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      fill: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        ['#66FF91', '#FF8300', '#FF0000'],
      ),
    };
  });

  return (
    <AnimatedCircle
      r={25.5}
      transform={transform}
      stroke='#838383'
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
};

export default AnimatedIndicator;
