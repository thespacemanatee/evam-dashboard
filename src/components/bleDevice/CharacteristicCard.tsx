import { useEffect, useState } from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { type Characteristic } from 'react-native-ble-plx';
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
    void (async () => {
      try {
        const desc = await char.descriptors();
        const r = await desc[0]?.read();
        if (r?.value != null) {
          setDescriptor(btoa(r.value));
        }
      } catch (err) {
        console.error('[CharacteristicCard]', err);
      }
    })();
  }, [char]);

  return (
    <View style={style}>
      <View style={styles.container}>
        <Text>{`Characteristic UUID: ${char.uuid}`}</Text>
        <Text>{`Descriptor: ${descriptor}`}</Text>
        <View style={{ flexDirection: 'row' }}>
          <View>
            <Text>{`isIndicatable: ${String(char.isIndicatable)}`}</Text>
            <Text>{`isNotifiable: ${String(char.isNotifiable)}`}</Text>
            <Text>{`isNotifying: ${String(char.isNotifying)}`}</Text>
            <Text>{`isReadable: ${String(char.isReadable)}`}</Text>
            <Text>{`isWritableWithResponse: ${String(
              char.isWritableWithResponse,
            )}`}</Text>
            <Text>{`isWritableWithoutResponse: ${String(
              char.isWritableWithoutResponse,
            )}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CharacteristicCard;
