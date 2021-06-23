import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    fontSize: 160,
  },
  units: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: 20,
  },
});

const SpeedIndicator = () => {
  return (
    <View
      style={{
        alignItems: 'flex-end',
        transform: [{ scaleX: 0.8 }],
      }}>
      <Text style={styles.speedIndicator}>88.8</Text>
      <Text style={styles.units}>KM/H</Text>
    </View>
  );
};

export default SpeedIndicator;
