import React, { ReactChild } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../utils/colors';

const styles = StyleSheet.create({
  buttonContainer: {
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
    padding: 10,
    alignItems: 'center',
    width: 150,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

interface ThemedButtonProps {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  children: ReactChild;
  style?: ViewStyle;
}

const ThemedButton = ({
  onPress,
  onPressIn,
  onPressOut,
  children,
  style,
}: ThemedButtonProps) => {
  return (
    <View style={[styles.buttonContainer, style]}>
      <Pressable
        android_ripple={{ color: '#000000', borderless: true }}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.button}>
        <Text style={styles.buttonText}>{children}</Text>
      </Pressable>
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
