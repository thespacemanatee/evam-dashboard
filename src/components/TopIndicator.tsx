import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { MAX_WIDTH } from '../utils/config';
import Indicator from './Indicator';

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    width: MAX_WIDTH / 3,
    alignItems: 'center',
    alignSelf: 'center',
  },
  topIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  indicator: {
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
  },
  labelText: {
    fontFamily: 'Gotham-Narrow',
    color: 'white',
  },
});

type TopIndicatorProps = {
  tps: Animated.SharedValue<number>;
  sas: Animated.SharedValue<number>;
  ecu: Animated.SharedValue<number>;
  bms: Animated.SharedValue<number>;
  whl: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
};

const TopIndicator = ({
  tps,
  sas,
  ecu,
  bms,
  whl,
  style,
}: TopIndicatorProps): JSX.Element => {
  return (
    <View style={[styles.contentContainer, style]}>
      <View style={styles.topIndicator}>
        <Indicator status={tps} style={styles.indicator} />
        <Indicator status={sas} style={styles.indicator} />
        <Indicator status={ecu} style={styles.indicator} />
        <Indicator status={bms} style={styles.indicator} />
        <Indicator status={whl} style={styles.indicator} />
      </View>
      <View style={styles.divider} />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>TPS</Text>
        <Text style={styles.labelText}>SAS</Text>
        <Text style={styles.labelText}>ECU</Text>
        <Text style={styles.labelText}>BMS</Text>
        <Text style={styles.labelText}>WHL</Text>
      </View>
    </View>
  );
};

TopIndicator.defaultProps = {
  style: undefined,
};

export default TopIndicator;
