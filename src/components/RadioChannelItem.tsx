import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { RadioChannel } from '../index';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  channelLabel: {
    marginLeft: 16,
  },
  channelName: {
    color: 'white',
    fontFamily: 'Gotham-Narrow',
    fontSize: 32,
  },
  channelChannel: {
    color: 'lightgray',
    fontFamily: 'Gotham-Narrow',
    fontSize: 16,
  },
});

type RadioChannelItemProps = {
  radioChannel: RadioChannel;
  onPress: (radioChannel: RadioChannel) => void;
};

const RadioChannelItem = ({
  radioChannel,
  onPress,
}: RadioChannelItemProps): JSX.Element => {
  const { imageUrl, name, channel } = radioChannel;
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(radioChannel)}>
      <Image source={{ uri: imageUrl, width: 96, height: 66 }} />
      <View style={styles.channelLabel}>
        <Text style={styles.channelName}>{name}</Text>
        <Text style={styles.channelChannel}>{`${channel} FM`}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RadioChannelItem;
