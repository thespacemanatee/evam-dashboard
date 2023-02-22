import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { type DashboardScreenNavigationProp } from '../../navigation';

import { MENU_ICON_SIZE } from '../../utils/config';
import MenuButton from './MenuButton';

const SPACING = 20;
const MENU_SIZE = 160;

const styles = StyleSheet.create({
  mainButton: {
    position: 'absolute',
  },
  menuButtons: {
    alignItems: 'flex-start',
  },
  bluetoothButton: {
    position: 'absolute',
    top: MENU_ICON_SIZE + SPACING,
  },
  temperatureButton: {
    position: 'absolute',
    top: (MENU_ICON_SIZE + SPACING) * 2,
  },
  lightingButton: {
    position: 'absolute',
    top: (MENU_ICON_SIZE + SPACING) * 3,
  },
});

interface DashboardMenuProps {
  style?: StyleProp<ViewStyle>;
}

const DashboardMenu = ({ style }: DashboardMenuProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const mainProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);

  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const handleSettings = (): void => {
    navigation.navigate('SettingsStack');
    setOpen(!open);
  };

  const handleTemperature = (): void => {
    navigation.navigate('Status');
    setOpen(!open);
  };

  const handleLighting = (): void => {
    navigation.navigate('Lighting');
    setOpen(!open);
  };

  const handleMenuPress = (): void => {
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
    const rotate = `${interpolate(mainProgress.value, [0, 1], [0, 90])}deg`;
    const opacity = interpolate(mainProgress.value, [0, 1], [0, 1]);
    return {
      transform: [{ rotate }],
      opacity,
    };
  });

  const bluetoothAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(menuProgress.value, [0, 1], [-MENU_SIZE, 0]);
    return {
      transform: [{ translateX }],
    };
  });

  const temperatureAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      menuProgress.value,
      [0.33, 1],
      [-MENU_SIZE, 0],
    );
    return {
      transform: [{ translateX }],
    };
  });

  const lightingAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      menuProgress.value,
      [0.66, 1],
      [-MENU_SIZE, 0],
    );
    return {
      transform: [{ translateX }],
    };
  });

  useEffect(() => {
    mainProgress.value = open ? withTiming(1) : withTiming(0);
    menuProgress.value = open ? withSpring(1) : withSpring(0);
  }, [open, mainProgress, menuProgress]);

  return (
    <View style={style}>
      <TouchableOpacity
        containerStyle={styles.mainButton}
        onPress={handleMenuPress}
      >
        <Animated.View style={cogAnimatedStyle}>
          <Ionicons name="cog-outline" size={MENU_ICON_SIZE} color="white" />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        containerStyle={styles.mainButton}
        onPress={handleMenuPress}
      >
        <Animated.View style={closeAnimatedStyle}>
          <Ionicons name="close-outline" size={MENU_ICON_SIZE} color="white" />
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.menuButtons}>
        <MenuButton
          iconName="bluetooth-outline"
          iconSize={MENU_ICON_SIZE}
          label="Bluetooth"
          style={[styles.bluetoothButton, bluetoothAnimatedStyle]}
          onPress={handleSettings}
        />
        <MenuButton
          iconName="thermometer-outline"
          iconSize={MENU_ICON_SIZE}
          label="Vehicle Status"
          style={[styles.temperatureButton, temperatureAnimatedStyle]}
          onPress={handleTemperature}
        />
        <MenuButton
          iconName="sunny-outline"
          iconSize={MENU_ICON_SIZE}
          label="Lighting"
          style={[styles.lightingButton, lightingAnimatedStyle]}
          onPress={handleLighting}
        />
      </View>
    </View>
  );
};

export default DashboardMenu;
