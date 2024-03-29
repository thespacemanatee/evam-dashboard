/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
import React from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import colors from '../../utils/colors';
import Indicator from './Indicator';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    width: 100,
    height: 40,
  },
  indicatorText: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Gotham-Narrow',
  },
});

interface StatusIndicatorProps {
  label: string;
  status?: number;
  style?: StyleProp<ViewStyle>;
}

const StatusIndicator = ({
  label,
  status,
  style,
}: StatusIndicatorProps): JSX.Element => {
  return (
    <View style={style}>
      <View style={styles.container}>
        <Text style={styles.indicatorText}>{label}</Text>
        <Indicator status={status} />
      </View>
    </View>
  );
};

export default StatusIndicator;
