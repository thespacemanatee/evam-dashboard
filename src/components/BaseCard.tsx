import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 12,
  },
});

interface BaseCardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({
  onPress,
  style,
  disabled,
  children,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      disabled={disabled}>
      {children}
    </TouchableOpacity>
  );
};

export default BaseCard;
