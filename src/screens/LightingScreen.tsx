import React, { useRef } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import AnimateableText from 'react-native-animateable-text';
import {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { FINAL_BASE_GRAPHIC_HEIGHT } from '../utils/config';
import BaseGraphic from '../../assets/base-graphic.png';
import ThemedIconButton from '../components/ThemedIconButton';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  baseGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '101.75%',
    height: FINAL_BASE_GRAPHIC_HEIGHT * 1.1,
  },
  colorPickerContainer: {
    width: '50%',
    height: '90%',
  },
  buttonContainer: {
    position: 'absolute',
    left: 32,
    top: 0,
  },
});

const LightingScreen = ({ navigation }) => {
  const pickerRef = useRef(null);
  const colorAnim = useSharedValue('#ffffff');

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `LED Color: ${colorAnim.value.toUpperCase()}`,
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: colorAnim.value,
    };
  });

  /**
   * TODO Persist color settings in redux
   * @param color string
   */
  const handleColorChange = color => {
    colorAnim.value = color;
  };

  const handleColorChangeComplete = color => {};

  return (
    <View style={styles.screen}>
      <ImageBackground source={BaseGraphic} style={styles.baseGraphic} />
      <View style={styles.container}>
        <AnimateableText
          animatedProps={animatedProps}
          style={[{ color: 'white', fontSize: 16 }, animatedStyle]}
        />
        <View style={styles.colorPickerContainer}>
          <ColorPicker
            ref={pickerRef}
            sliderSize={40}
            onColorChangeComplete={handleColorChangeComplete}
            onColorChange={handleColorChange}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ThemedIconButton
          onPress={() => navigation.goBack()}
          iconName='chevron-back-outline'
        />
      </View>
    </View>
  );
};

export default LightingScreen;
