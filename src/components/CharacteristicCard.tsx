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
  // const [batteryPercentage, setBatteryPercentage] = useState(0);
  // const [batteryVoltage, setBatteryVoltage] = useState(0);
  // const [batteryCurrent, setBatteryCurrent] = useState(0);
  // const [batteryTemperature, setBatteryTemperature] = useState(0);
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
      // setBatteryPercentage(temp.charCodeAt(3));
      // setBatteryVoltage(temp.charCodeAt(4));
      // setBatteryCurrent(temp.charCodeAt(6) + 255);
      // setBatteryTemperature(temp.charCodeAt(7));
    });

    return () => subscription.remove();
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
          <Text style={styles.measure}>{`Velocity: ${velocity}`}</Text>
          <Text style={styles.measure}>{`Acceleration: ${acceleration}`}</Text>
          <Text style={styles.measure}>{`Brake: ${brake}`}</Text>
          {/* <Text style={styles.measure}>
            {`Percentage: ${batteryPercentage}`}
          </Text>
          <Text style={styles.measure}>{`Voltage: ${batteryVoltage}`}</Text>
          <Text style={styles.measure}>{`Current: ${batteryCurrent}`}</Text>
          <Text style={styles.measure}>
            {`Temperature: ${batteryTemperature}`}
          </Text> */}
        </View>
      </View>
    </View>
  );
};

export default CharacteristicCard;
