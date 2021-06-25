import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 520,
  },
  speedIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    transform: [{ scaleX: 0.8 }],
    fontSize: 300,
  },
  units: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: 35,
    bottom: 5,
    right: 65,
  },
});

const SpeedIndicator = props => {
  return (
    <View {...props} style={[styles.container, props.style]}>
      <Text style={styles.speedIndicator}>88.8</Text>
      <Text style={styles.units}>KM/H</Text>
    </View>
  );
};

export default SpeedIndicator;
