import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';

import { type TopIndicatorData } from '../../index';

import Indicator from './Indicator';

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
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

interface TopIndicatorProps {
  data?: TopIndicatorData;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const TopIndicator = ({
  data,
  onPress,
  style,
}: TopIndicatorProps): JSX.Element => {
  const { width } = useWindowDimensions();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.contentContainer, { width: width / 3 }, style]}
    >
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
    </TouchableOpacity>
  );
};

export default TopIndicator;
