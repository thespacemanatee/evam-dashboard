import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface SteeringWheelProps {
  progress: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

const SteeringWheel: React.FC<SteeringWheelProps> = ({ progress, style }) => {
  const animatedProps = useAnimatedProps(() => ({
    rotation: progress.value - 127,
  }));

  return (
    <AnimatedSvg
      fill="#ffffff"
      height="64px"
      width="64px"
      id="Layer_1"
      viewBox="0 0 512 512"
      animatedProps={animatedProps}
    >
      <G>
        <G>
          <Path d="M437.02,74.981C388.668,26.628,324.38,0,256,0S123.333,26.628,74.98,74.981C26.628,123.333,0,187.62,0,256 s26.628,132.667,74.98,181.019C123.333,485.372,187.62,512,256,512s132.667-26.628,181.02-74.981 C485.372,388.668,512,324.38,512,256S485.372,123.333,437.02,74.981z M256,57.263c100.782,0,184.276,75.409,197.04,172.765 L329.849,218.03c-13.813-26.755-41.72-45.102-73.849-45.102s-60.036,18.347-73.849,45.102L58.96,230.028 C71.724,132.672,155.218,57.263,256,57.263z M58.889,281.375l121.731,9.484c7.69,16.55,20.669,30.166,36.76,38.655l7.978,122.859 C138.513,438.875,70.099,368.943,58.889,281.375z M256,281.809c-14.232,0-25.809-11.578-25.809-25.809S241.77,230.191,256,230.191 S281.809,241.77,281.809,256S270.232,281.809,256,281.809z M286.644,452.373l7.978-122.859 c16.091-8.488,29.069-22.105,36.76-38.655l121.731-9.484C441.901,368.943,373.487,438.875,286.644,452.373z" />
        </G>
      </G>
    </AnimatedSvg>
  );
};
export default SteeringWheel;
