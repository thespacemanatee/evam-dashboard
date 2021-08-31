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
import LightingOption from '../components/LightingOption';
import ThemedButton from '../components/ThemedButton';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  colorPicker: {
    flex: 1,
    alignItems: 'center',
  },
  lightingOption: {
    padding: 16,
  },
  selectedColorText: {
    color: 'white',
    fontSize: 16,
    right: 48,
  },
  sendButton: {
    right: 48,
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
  const [frontChecked, setFrontChecked] = useState(false);
  const [rearChecked, setRearChecked] = useState(false);
  const [interiorChecked, setInteriorChecked] = useState(false);
  const [frontColor, setFrontColor] = useState<string>();
  const [rearColor, setRearColor] = useState<string>();
  const [interiorColor, setInteriorColor] = useState<string>();
  const [colorPayload, setColorPayload] = useState<string>();
  const pickerRef = useRef(null);
  const colorAnim = useSharedValue('#ffffff');

  const handleSendRGBData = async () => {
    if (colorPayload) {
      const payload = atob(
        String.fromCharCode(
          parseInt(colorPayload.slice(1, 3), 16),
          parseInt(colorPayload.slice(3, 5), 16),
          parseInt(colorPayload.slice(5, 7), 16),
        ),
      );
      if (frontChecked) {
        let frontLightChar;
        frontLightChar = await getCharacteristic(
          LIGHTING_SERVICE_UUID,
          deviceUUID,
          FRONT_LIGHTING_CHARACTERISTIC_UUID,
        );
        frontLightChar = await frontLightChar?.writeWithResponse(payload);
        const decodedFrontRGB = decodeBleString(
          (await frontLightChar?.read())?.value,
        );
        setFrontColor(getRGBString(decodedFrontRGB));
      }
      if (rearChecked) {
        let rearLightChar;
        rearLightChar = await getCharacteristic(
          LIGHTING_SERVICE_UUID,
          deviceUUID,
          REAR_LIGHTING_CHARACTERISTIC_UUID,
        );
        rearLightChar = await rearLightChar?.writeWithResponse(payload);
        const decodedRearRGB = decodeBleString(
          (await rearLightChar?.read())?.value,
        );
        setRearColor(getRGBString(decodedRearRGB));
      }
      if (interiorChecked) {
        let interiorLightChar;
        interiorLightChar = await getCharacteristic(
          LIGHTING_SERVICE_UUID,
          deviceUUID,
          INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
        );
        interiorLightChar = await interiorLightChar?.writeWithResponse(payload);
        const decodedInteriorRGB = decodeBleString(
          (await interiorLightChar?.read())?.value,
        );
        setInteriorColor(getRGBString(decodedInteriorRGB));
      }
    }
  };

  const readAndUpdateFrontRGBValues = useCallback(async () => {
    const frontLightChar = await getCharacteristic(
      LIGHTING_SERVICE_UUID,
      deviceUUID,
      FRONT_LIGHTING_CHARACTERISTIC_UUID,
    );
    const decodedFrontRGB = decodeBleString(
      (await frontLightChar?.read())?.value,
    );
    setFrontColor(getRGBString(decodedFrontRGB));
  }, [deviceUUID]);

  const readAndUpdateRearRGBValues = useCallback(async () => {
    const rearLightChar = await getCharacteristic(
      LIGHTING_SERVICE_UUID,
      deviceUUID,
      REAR_LIGHTING_CHARACTERISTIC_UUID,
    );
    const decodedRearRgb = decodeBleString(
      (await rearLightChar?.read())?.value,
    );
    setRearColor(getRGBString(decodedRearRgb));
  }, [deviceUUID]);

  const readAndUpdateInteriorRGBValues = useCallback(async () => {
    const interiorLightChar = await getCharacteristic(
      LIGHTING_SERVICE_UUID,
      deviceUUID,
      INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
    );
    const decodedRearRgb = decodeBleString(
      (await interiorLightChar?.read())?.value,
    );

    setInteriorColor(getRGBString(decodedRearRgb));
  }, [deviceUUID]);

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
        if (device) {
          readAndUpdateFrontRGBValues();
          readAndUpdateRearRGBValues();
          readAndUpdateInteriorRGBValues();
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
          <ThemedButton
            label='SEND'
            style={styles.sendButton}
            onPress={handleSendRGBData}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.buttonContainer}>
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
