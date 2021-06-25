import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import colors from '../utils/colors';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 10,
  },
});

interface ThemedIconButtonProps {
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const ThemedIconButton = ({
  onPress,
  iconName,
  style,
}: ThemedIconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Ionicons name={iconName} size={32} color='white' />
    </TouchableOpacity>
  );
};

ThemedIconButton.defaultProps = {
  style: undefined,
};

export default ThemedIconButton;
