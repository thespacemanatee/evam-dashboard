import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ColorPicker from 'react-native-wheel-color-picker';
import AnimateableText from 'react-native-animateable-text';
import {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { MENU_ICON_SIZE } from '../utils/config';
import { RootStackParamList } from '../navigation';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    width: '50%',
    height: '80%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
});

type Props = StackScreenProps<RootStackParamList, 'Lighting'>;

const LightingScreen = ({ navigation }: Props): JSX.Element => {
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
  const handleColorChange = (color) => {
    colorAnim.value = color;
  };

  const handleColorChangeComplete = (color) => {};

  return (
    <View style={styles.screen}>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='chevron-back-outline'
            size={MENU_ICON_SIZE}
            color='white'
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LightingScreen;
