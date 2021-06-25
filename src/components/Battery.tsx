import React, { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Mask, G } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const Battery = props => {
  const batteryLevel = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    return {
      y: interpolate(batteryLevel.value, [0, 1], [200, -20]),
    };
  });

  useEffect(() => {
    batteryLevel.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true,
    );
  }, []);

  return (
    <Svg
      width={125}
      height={66.88}
      viewBox='0 0 260 139'
      fill='none'
      {...props}>
      <Path
        d='M22.4605 111.842L22.4605 26.6717C22.4605 15.2859 31.6905 6.05589 43.0763 6.05589L232.844 6.05589C244.23 6.05589 253.46 15.2859 253.46 26.6717L253.46 111.842C253.46 123.228 244.23 132.458 232.844 132.458L43.0763 132.458C31.6905 132.458 22.4605 123.228 22.4605 111.842Z'
        fill='black'
        stroke='white'
        strokeWidth={12}
      />
      <Rect
        x={0.942322}
        y={91.2148}
        width={43.2507}
        height={22.6234}
        rx={11.3117}
        transform='rotate(-90 0.942322 91.2148)'
        fill='white'
      />
      <Mask
        id='mask0'
        mask-type='alpha'
        maskUnits='userSpaceOnUse'
        x={23}
        y={4}
        width={247}
        height={129}>
        <Rect
          x={23.5657}
          y={132.469}
          width={127.756}
          height={230.227}
          rx={20}
          transform='rotate(-90 23.5657 132.469)'
          fill='#CDCDCD'
        />
      </Mask>
      <G mask='url(#mask0)'>
        <AnimatedRect
          x={176.942}
          width={127.756}
          height={230.227}
          rx={20}
          transform='rotate(-90 176.942 132.458)'
          fill='#66FF91'
          animatedProps={animatedProps}
        />
        <Path
          d='M177.259 75.0269L142.1 68.1034L127.6 91.394L89.2491 61.4142L121.818 64.0259L136.684 42.466L177.259 75.0269Z'
          fill='white'
        />
        <Path
          d='M22.2464 111.842L22.2464 26.6717C22.2464 15.2859 31.4764 6.05589 42.8622 6.05589L232.63 6.05589C244.015 6.05589 253.246 15.2859 253.246 26.6717L253.246 111.842C253.246 123.228 244.015 132.458 232.63 132.458L42.8622 132.458C31.4764 132.458 22.2464 123.228 22.2464 111.842Z'
          stroke='white'
          strokeWidth={12}
        />
      </G>
    </Svg>
  );
};

export default Battery;
