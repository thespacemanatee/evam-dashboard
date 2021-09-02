import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { TopIndicatorData } from '../../index';

import { MAX_WIDTH } from '../../utils/config';
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
  data?: TopIndicatorData;
  style?: StyleProp<ViewStyle>;
};

const TopIndicator = ({ data, style }: TopIndicatorProps): JSX.Element => {
  return (
    <View style={style}>
      <View style={styles.contentContainer}>
        <View style={styles.topIndicator}>
          <Indicator status={data?.tps} style={styles.indicator} />
          <Indicator status={data?.sas} style={styles.indicator} />
          <Indicator status={data?.ecu} style={styles.indicator} />
          <Indicator status={data?.bms} style={styles.indicator} />
          <Indicator status={data?.whl} style={styles.indicator} />
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
    </View>
  );
};

TopIndicator.defaultProps = {
  data: undefined,
  style: undefined,
};

export default TopIndicator;
