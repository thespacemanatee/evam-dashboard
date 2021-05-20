import React from 'react';
import { Spinner } from '@ui-kitten/components';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    right: 20,
  },
});

const LoadingIndicator = ({
  loading,
  style,
}: {
  loading: boolean;
  style?: ViewStyle;
}) => {
  return loading ? (
    <View style={[style, styles.indicator]}>
      <Spinner size='small' status='control' />
    </View>
  ) : (
    <View />
  );
};

LoadingIndicator.defaultProps = {
  style: null,
};

export default LoadingIndicator;
