import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ColorPicker from 'react-native-wheel-color-picker';
import AnimateableText from 'react-native-animateable-text';
import { encode as atob } from 'base-64';
import {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import {
  MENU_ICON_SIZE,
  FRONT_LIGHTING_CHARACTERISTIC_UUID,
  LIGHTING_SERVICE_UUID,
  REAR_LIGHTING_CHARACTERISTIC_UUID,
  INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
} from '../utils/config';
import { RootStackParamList } from '../navigation';
import { bleManagerRef } from '../utils/BleHelper';
import { useAppSelector } from '../app/hooks';
import {
  decodeBleString,
  getCharacteristic,
  getRGBString,
} from '../utils/utils';

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
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );

  const pickerRef = useRef(null);
  const colorAnim = useSharedValue('#ffffff');

  useEffect(() => {
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device) {
          const frontLightChar = await getCharacteristic(
            LIGHTING_SERVICE_UUID,
            deviceUUID,
            FRONT_LIGHTING_CHARACTERISTIC_UUID,
          );
          const rearLightChar = await getCharacteristic(
            LIGHTING_SERVICE_UUID,
            deviceUUID,
            REAR_LIGHTING_CHARACTERISTIC_UUID,
          );
          const interiorLightChar = await getCharacteristic(
            LIGHTING_SERVICE_UUID,
            deviceUUID,
            INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
          );
          const decodedFrontRGB = decodeBleString(
            (await frontLightChar?.read())?.value,
          );
          const decodedRearRgb = decodeBleString(
            (await rearLightChar?.read())?.value,
          );
          const decodedInteriorRGB = decodeBleString(
            (await interiorLightChar?.read())?.value,
          );

          const frontRgb = getRGBString(decodedFrontRGB);
          const rearRgb = getRGBString(decodedRearRgb);
          const interiorRGB = getRGBString(decodedInteriorRGB);

          console.log(frontRgb, rearRgb, interiorRGB);

          const res = await rearLightChar?.writeWithResponse(
            atob(String.fromCharCode(0xff, 0xf0, 0xff)),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();
  }, [deviceUUID]);

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
  const handleColorChange = (color: string) => {
    colorAnim.value = color;
  };

  const handleColorChangeComplete = (color: string) => {};

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
