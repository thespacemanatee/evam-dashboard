import { useEffect, useState } from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { type Characteristic, type Service } from 'react-native-ble-plx';

import BaseCard from './BaseCard';
import CharacteristicCard from './CharacteristicCard';

const styles = StyleSheet.create({
  characteristicCard: {
    marginTop: 16,
  },
});

interface ServiceCardProps {
  service: Service;
  style?: StyleProp<ViewStyle>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, style }) => {
  const [characteristics, setCharacteristics] = useState<Characteristic[]>();
  const [areCharacteristicsVisible, setAreCharacteristicsVisible] =
    useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const newCharacteristics = await service.characteristics();
        setCharacteristics(newCharacteristics);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [service]);

  return (
    <BaseCard disabled style={style}>
      <TouchableOpacity
        onPress={() => {
          setAreCharacteristicsVisible((prev) => !prev);
        }}
      >
        <Text>{`Service UUID: ${service.uuid}`}</Text>
      </TouchableOpacity>

      {areCharacteristicsVisible &&
        characteristics != null &&
        characteristics.map((char) => (
          <CharacteristicCard
            key={char.id}
            char={char}
            style={styles.characteristicCard}
          />
        ))}
    </BaseCard>
  );
};

export default ServiceCard;
