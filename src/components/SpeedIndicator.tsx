import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    width: 400,
  },
  speedIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
  },
  speedIndicator: {
    color: 'white',
    fontFamily: 'Digital-Numbers',
    transform: [{ scaleX: 0.8 }],
    fontSize: 200,
  },
  units: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: 20,
    paddingRight: 65,
  },
});

const SpeedIndicator = props => {
  return (
    <View {...props} style={[styles.container, props.style]}>
      <View style={styles.speedIndicatorContainer}>
        <Text style={styles.speedIndicator}>88.8</Text>
      </View>
      <Text style={styles.units}>KM/H</Text>
    </View>
  );
};

export default SpeedIndicator;
