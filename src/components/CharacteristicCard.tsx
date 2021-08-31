import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Characteristic } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';
import { decodeBleString } from '../utils/utils';

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
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [brake, setBrake] = useState(0);
  const [descriptor, setDescriptor] = useState('');

  useEffect(() => {
    char.descriptors().then((desc) => {
      desc[0]?.read().then((val) => {
        if (val) {
          setDescriptor(btoa(val.value || ''));
        }
      });
    });

    const subscription = char.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      const temp = decodeBleString(cha?.value);
      setVelocity(temp.charCodeAt(0));
      setAcceleration(temp.charCodeAt(1));
      setBrake(temp.charCodeAt(2));
    });

    return () => subscription.remove();
  }, [char]);

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
          <Text style={styles.measure}>{`Velocity: ${velocity}`}</Text>
          <Text style={styles.measure}>{`Acceleration: ${acceleration}`}</Text>
          <Text style={styles.measure}>{`Brake: ${brake}`}</Text>
        </View>
      </View>
    </View>
  );
};

CharacteristicCard.defaultProps = {
  style: undefined,
};

export default CharacteristicCard;
