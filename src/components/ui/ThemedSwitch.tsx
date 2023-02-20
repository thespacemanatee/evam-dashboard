import React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import {
  type GestureEvent,
  PanGestureHandler,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import colors from '../../utils/colors';

const TRACK_WIDTH = 64;
const PADDING = 4;
const THUMB_SIZE = TRACK_WIDTH / 2 - PADDING;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING;
const TRACK_MIDPOINT = TRACK_WIDTH / 2 - THUMB_SIZE / 2;

const styles = StyleSheet.create({
  container: {
    height: TRACK_WIDTH / 2,
    width: TRACK_WIDTH,
    backgroundColor: colors.primaryLight,
    borderRadius: TRACK_WIDTH / 4,
    justifyContent: 'center',
    padding: PADDING / 2,
  },
  thumb: {
    backgroundColor: 'white',
    borderRadius: THUMB_SIZE / 2,
    height: THUMB_SIZE,
    width: THUMB_SIZE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
    overflow: 'hidden',
  },
});

const animationConfig = {
  duration: 100,
};

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

interface ThumbGestureHandlerContext {
  startX: number;
  moved: boolean;
}

const ThemedSwitch = ({
  value,
  onValueChange,
  style,
}: ThemedSwitchProps): JSX.Element => {
  const translateX = useSharedValue(value ? THUMB_TRAVEL : 0);
  const pressed = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>
  >({
    onStart: (_, ctx: ThumbGestureHandlerContext) => {
      pressed.value = true;
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx: ThumbGestureHandlerContext) => {
      ctx.moved = true;
      const newX = ctx.startX + event.translationX;
      if (newX >= 0 && newX <= THUMB_TRAVEL) {
        translateX.value = newX;
      }
    },
    onEnd: () => {
      pressed.value = false;
      if (translateX.value < TRACK_MIDPOINT) {
        translateX.value = withTiming(0, animationConfig);
      } else {
        translateX.value = withTiming(THUMB_TRAVEL, animationConfig);
      }
    },
    onFail: () => {
      pressed.value = false;
    },
    onCancel: () => {
      pressed.value = false;
    },
    onFinish: (_, ctx: ThumbGestureHandlerContext) => {
      pressed.value = false;
      if (translateX.value < TRACK_MIDPOINT) {
        if (ctx.moved) {
          runOnJS(onValueChange)(false);
        } else {
          translateX.value = withTiming(THUMB_TRAVEL, animationConfig);
          runOnJS(onValueChange)(true);
        }
      } else if (ctx.moved) {
        runOnJS(onValueChange)(true);
      } else {
        translateX.value = withTiming(0, animationConfig);
        runOnJS(onValueChange)(false);
      }
      ctx.moved = false;
    },
  });

  const trackAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, THUMB_TRAVEL],
        [colors.basic, colors.primaryLight],
      ),
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          scale: pressed.value
            ? withTiming(1.1, animationConfig)
            : withTiming(1, animationConfig),
        },
      ],
    };
  });

  return (
    <View style={style}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, trackAnimatedStyle]}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default ThemedSwitch;
