import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { MENU_ICON_SIZE } from '../utils/config';
import { RootStackParamList } from '../navigation';
import { bleManagerRef } from '../utils/BleHelper';
import { useAppSelector } from '../app/hooks';
import {
  decodeBleString,
  getFrontLightingCharacteristic,
  getInteriorLightingCharacteristic,
  getRearLightingCharacteristic,
  getRGBString,
} from '../utils/utils';
import LightingOption from '../components/lighting/LightingOption';
import ThemedButton from '../components/ui/ThemedButton';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 32,
    alignItems: 'flex-end',
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  colorPicker: {
    flex: 1,
  },
  lightingOption: {
    padding: 16,
  },
  selectedColorText: {
    color: 'white',
    fontSize: 16,
    left: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 8,
  },
  backButton: {
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
  const [frontChecked, setFrontChecked] = useState(false);
  const [rearChecked, setRearChecked] = useState(false);
  const [interiorChecked, setInteriorChecked] = useState(false);
  const [frontColor, setFrontColor] = useState<string>();
  const [rearColor, setRearColor] = useState<string>();
  const [interiorColor, setInteriorColor] = useState<string>();
  const [colorPayload, setColorPayload] = useState<string>();
  const pickerRef = useRef(null);
  const colorAnim = useSharedValue('#ffffff');

  const sendFrontRGBData = async (payload: string) => {
    const char = await getFrontLightingCharacteristic();
    const newChar = await char?.writeWithResponse(payload);
    const decodedFrontRGB = decodeBleString((await newChar?.read())?.value);
    setFrontColor(getRGBString(decodedFrontRGB));
  };

  const sendRearRGBData = async (payload: string) => {
    const char = await getRearLightingCharacteristic();
    const newChar = await char?.writeWithResponse(payload);
    const decodedRearRGB = decodeBleString((await newChar?.read())?.value);
    setRearColor(getRGBString(decodedRearRGB));
  };

  const sendInteriorRGBData = async (payload: string) => {
    const char = await getInteriorLightingCharacteristic();
    const newChar = await char?.writeWithResponse(payload);
    const decodedInteriorRGB = decodeBleString((await newChar?.read())?.value);
    setInteriorColor(getRGBString(decodedInteriorRGB));
  };

  const handleSendRGBData = async () => {
    const device = await bleManagerRef.current?.devices([deviceUUID]);
    if (device && device.length > 0 && colorPayload) {
      const payload = atob(
        String.fromCharCode(
          parseInt(colorPayload.slice(1, 3), 16),
          parseInt(colorPayload.slice(3, 5), 16),
          parseInt(colorPayload.slice(5, 7), 16),
        ),
      );
      if (frontChecked) {
        sendFrontRGBData(payload);
      }
      if (rearChecked) {
        sendRearRGBData(payload);
      }
      if (interiorChecked) {
        sendInteriorRGBData(payload);
      }
    }
  };

  const handleSetFade = () => {};

  const handleSetChase = () => {};

  const readAndUpdateFrontRGBValues = useCallback(async () => {
    const frontLightChar = await getFrontLightingCharacteristic();
    const decodedFrontRGB = decodeBleString(
      (await frontLightChar?.read())?.value,
    );
    setFrontColor(getRGBString(decodedFrontRGB));
  }, []);

  const readAndUpdateRearRGBValues = useCallback(async () => {
    const rearLightChar = await getRearLightingCharacteristic();
    const decodedRearRgb = decodeBleString(
      (await rearLightChar?.read())?.value,
    );
    setRearColor(getRGBString(decodedRearRgb));
  }, []);

  const readAndUpdateInteriorRGBValues = useCallback(async () => {
    const interiorLightChar = await getInteriorLightingCharacteristic();
    const decodedRearRgb = decodeBleString(
      (await interiorLightChar?.read())?.value,
    );

    setInteriorColor(getRGBString(decodedRearRgb));
  }, []);

  const onFrontCheckedChange = (value: boolean) => {
    setFrontChecked(value);
  };

  const onRearCheckedChange = (value: boolean) => {
    setRearChecked(value);
  };

  const onInteriorCheckedChange = (value: boolean) => {
    setInteriorChecked(value);
  };

  useEffect(() => {
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device && device.length > 0) {
          await readAndUpdateFrontRGBValues();
          await readAndUpdateRearRGBValues();
          await readAndUpdateInteriorRGBValues();
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();
  }, [
    deviceUUID,
    readAndUpdateFrontRGBValues,
    readAndUpdateInteriorRGBValues,
    readAndUpdateRearRGBValues,
  ]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `Selected Color: ${colorAnim.value}`,
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: colorAnim.value,
    };
  });

  const handleColorChange = (color: string) => {
    colorAnim.value = color.toUpperCase();
  };

  const handleColorChangeComplete = (color: string) => {
    setColorPayload(color);
  };

  return (
    <>
      <View style={styles.screen}>
        <View>
          <LightingOption
            label='Front Lights'
            value={frontChecked}
            onValueChange={onFrontCheckedChange}
            color={frontColor}
            style={styles.lightingOption}
          />
          <LightingOption
            label='Rear Lights'
            value={rearChecked}
            onValueChange={onRearCheckedChange}
            color={rearColor}
            style={styles.lightingOption}
          />
          <LightingOption
            label='Interior Lights'
            value={interiorChecked}
            onValueChange={onInteriorCheckedChange}
            color={interiorColor}
            style={styles.lightingOption}
          />
          <View style={styles.buttonContainer}>
            <ThemedButton
              label='FADE'
              onPress={handleSetFade}
              style={styles.button}
            />
            <ThemedButton
              label='CHASE'
              onPress={handleSetChase}
              style={styles.button}
            />
            <ThemedButton
              label='SET COLORS'
              onPress={handleSendRGBData}
              style={styles.button}
            />
          </View>
        </View>
        <View style={styles.colorPicker}>
          <AnimateableText
            animatedProps={animatedProps}
            style={[styles.selectedColorText, animatedStyle]}
          />
          <ColorPicker
            ref={pickerRef}
            row
            sliderSize={40}
            onColorChangeComplete={handleColorChangeComplete}
            onColorChange={handleColorChange}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons
          name='chevron-back-outline'
          size={MENU_ICON_SIZE}
          color='white'
        />
      </TouchableOpacity>
    </>
  );
};

export default LightingScreen;
