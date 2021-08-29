import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Characteristic } from 'react-native-ble-plx';
import { encode as atob, decode as btoa } from 'base-64';
import { decodeBleString } from '../utils/utils';

interface CharacteristicCardProps {
  char: Characteristic;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  measureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measure: {
    color: 'red',
    fontSize: 64,
  },
});

const CharacteristicCard: React.FC<CharacteristicCardProps> = ({
  char,
  style,
}) => {
  const [measure, setMeasure] = useState(0);
  const [descriptor, setDescriptor] = useState('');

  useEffect(() => {
    char.descriptors().then((desc) => {
      desc[0]?.read().then((val) => {
        if (val) {
          setDescriptor(btoa(val.value || ''));
        }
      });
    });

    char.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      setMeasure(decodeBleString(cha?.value).charCodeAt(0));
    });
  }, [char]);

  // write on a charactestic the number 6 (e.g.)
  const writeCharacteristic = () => {
    // encode the string with the Base64 algorithm
    char
      .writeWithResponse(atob('6'))
      .then(() => {
        console.warn('Success');
      })
      .catch((e) => console.log('Error', e));
  };

  return (
    <View style={[styles.container, style]}>
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
        <View style={styles.measureContainer}>
          <Text style={styles.measure}>{measure}</Text>
        </View>
      </View>
    </View>
  );
};

export default CharacteristicCard;
