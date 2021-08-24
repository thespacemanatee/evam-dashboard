import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    paddingLeft: 10,
  },
});

interface MenuButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconSize: number;
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  iconName,
  iconSize,
  label,
  style,
  onPress,
}) => {
  return (
    <AnimatedTouchable onPress={onPress} style={[styles.container, style]}>
      <Ionicons name={iconName} size={iconSize} color='white' />
      <Text style={styles.labelText}>{label}</Text>
    </AnimatedTouchable>
  );
};

MenuButton.defaultProps = {
  style: null,
};

export default MenuButton;
