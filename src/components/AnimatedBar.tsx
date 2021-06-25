import React from 'react';
import Animated, {
  useAnimatedProps,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedBarProps {
  d: string;
  progress: Animated.SharedValue<number>;
  index: number;
}

const AnimatedBar = ({ d, progress, index }: AnimatedBarProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      opacity: interpolate(
        progress.value,
        [index * (1 / 32), (index + 1) * (1 / 32)],
        [0.2, 1],
        Extrapolate.CLAMP,
      ),
    };
  });
  return (
    <AnimatedPath
      d={d}
      fill='#C4C4C4'
      key={index}
      animatedProps={animatedProps}
    />
  );
};

export default AnimatedBar;
