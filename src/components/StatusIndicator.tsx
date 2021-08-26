import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../utils/colors';

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
  indicator: {
    width: 25.5,
    height: 25.5,
    backgroundColor: '#66FF91',
    borderColor: '#838383',
    borderRadius: 17.25,
    borderWidth: 1,
  },
});

type StatusIndicatorProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

const StatusIndicator = ({
  label,
  style,
}: StatusIndicatorProps): JSX.Element => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.indicatorText}>{label}</Text>
      <View style={styles.indicator} />
    </View>
  );
};

StatusIndicator.defaultProps = {
  style: undefined,
};

export default StatusIndicator;
