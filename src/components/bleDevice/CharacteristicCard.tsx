import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Characteristic } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

interface CharacteristicCardProps {
  char: Characteristic;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  measure: {
    color: 'red',
    fontSize: 16,
  },
});

const CharacteristicCard: React.FC<CharacteristicCardProps> = ({
  char,
  style,
}) => {
  const [descriptor, setDescriptor] = useState('');

  useEffect(() => {
    char.descriptors().then((desc) => {
      desc[0]?.read().then((val) => {
        if (val) {
          setDescriptor(btoa(val.value || ''));
        }
      });
    });
  }, [char]);

  return (
    <View style={style}>
      <View style={styles.container}>
        <Text>{`Characteristic UUID: ${char.uuid}`}</Text>
        <Text>{`Descriptor: ${descriptor}`}</Text>
        <View style={{ flexDirection: 'row' }}>
          <View>
            <Text>{`isIndicatable: ${char.isIndicatable}`}</Text>
            <Text>{`isNotifiable: ${char.isNotifiable}`}</Text>
            <Text>{`isNotifying: ${char.isNotifying}`}</Text>
            <Text>{`isReadable: ${char.isReadable}`}</Text>
            <Text>{`isWritableWithResponse: ${char.isWritableWithResponse}`}</Text>
            <Text>{`isWritableWithoutResponse: ${char.isWritableWithoutResponse}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

CharacteristicCard.defaultProps = {
  style: undefined,
};

export default CharacteristicCard;
