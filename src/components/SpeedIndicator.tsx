import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    transform: [{ scaleX: 0.8 }],
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: 200,
  },
  units: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: 20,
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
