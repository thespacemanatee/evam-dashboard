import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

interface ThemedButtonProps {
  label: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: ViewStyle;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  label,
  onPress,
  onPressIn,
  onPressOut,
  style,
}) => {
  return (
    <View style={style}>
      <View style={styles.container}>
        <Pressable
          android_ripple={{ color: '#000000', borderless: true }}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.button}>
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      </View>
    </View>
  );
};

ThemedButton.defaultProps = {
  onPress: undefined,
  onPressIn: undefined,
  onPressOut: undefined,
  style: undefined,
};

export default ThemedButton;
