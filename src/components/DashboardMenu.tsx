import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MAX_HEIGHT } from '../utils/config';
import MenuButton from './MenuButton';

const ICON_SIZE = 32;
const SPACING = 20;
const MENU_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    height: MAX_HEIGHT / 2,
    width: '100%',
  },
  mainButton: {
    position: 'absolute',
  },
  menuButtons: {
    alignItems: 'flex-start',
  },
  bluetoothButton: {
    position: 'absolute',
    top: ICON_SIZE + SPACING,
    left: -MENU_SIZE,
  },
  temperatureButton: {
    position: 'absolute',
    top: (ICON_SIZE + SPACING) * 2,
    left: -MENU_SIZE,
  },
  lightingButton: {
    position: 'absolute',
    top: (ICON_SIZE + SPACING) * 3,
    left: -MENU_SIZE,
  },
});

const DashboardMenu = () => {
  const [open, setOpen] = useState(false);
  const mainProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);

  const navigation = useNavigation();

  const handleSettings = () => {
    navigation.navigate('SettingsStack');
    setOpen(!open);
  };

  const handleTemperature = () => {
    navigation.navigate('Temperature');
    setOpen(!open);
  };

  const handleLighting = () => {
    navigation.navigate('Lighting');
    setOpen(!open);
  };

  const handleMenuPress = () => {
    setOpen(!open);
  };

  const cogAnimatedStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(mainProgress.value, [0, 1], [0, 90])}deg`;
    const opacity = interpolate(mainProgress.value, [0, 1], [1, 0]);
    return {
      transform: [{ rotate }],
      opacity,
    };
  });

  const closeAnimatedStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(mainProgress.value, [0, 1], [90, 0])}deg`;
    const opacity = interpolate(mainProgress.value, [0, 1], [0, 1]);
    return {
      transform: [{ rotate }],
      opacity,
    };
  });

  const bluetoothAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(menuProgress.value, [0, 1], [0, MENU_SIZE]);
    const opacity = interpolate(menuProgress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const temperatureAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      menuProgress.value,
      [0.3, 1],
      [0, MENU_SIZE],
    );
    const opacity = interpolate(menuProgress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const lightingAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      menuProgress.value,
      [0.6, 1],
      [0, MENU_SIZE],
    );
    const opacity = interpolate(menuProgress.value, [0, 0.5, 1], [0, 0, 1]);
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  useEffect(() => {
    mainProgress.value = open ? withTiming(1) : withTiming(0);
    menuProgress.value = open ? withSpring(1) : withSpring(0);
  }, [open, mainProgress, menuProgress]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        containerStyle={styles.mainButton}
        onPress={handleMenuPress}>
        <Animated.View style={cogAnimatedStyle}>
          <Ionicons name='cog-outline' size={ICON_SIZE} color='white' />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        containerStyle={styles.mainButton}
        onPress={handleMenuPress}>
        <Animated.View style={closeAnimatedStyle}>
          <Ionicons name='close-outline' size={ICON_SIZE} color='white' />
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.menuButtons}>
        <MenuButton
          iconName='bluetooth-outline'
          iconSize={ICON_SIZE}
          label='Bluetooth'
          style={[styles.bluetoothButton, bluetoothAnimatedStyle]}
          onPress={handleSettings}
        />
        <MenuButton
          iconName='thermometer-outline'
          iconSize={ICON_SIZE}
          label='Temperature'
          style={[styles.temperatureButton, temperatureAnimatedStyle]}
          onPress={handleTemperature}
        />
        <MenuButton
          iconName='sunny-outline'
          iconSize={ICON_SIZE}
          label='Lighting'
          style={[styles.lightingButton, lightingAnimatedStyle]}
          onPress={handleLighting}
        />
      </View>
    </View>
  );
};

export default DashboardMenu;
