import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Characteristic, Service } from 'react-native-ble-plx';

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
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [areCharacteristicsVisible, setAreCharacteristicsVisible] =
    useState(true);

  useEffect(() => {
    const getCharacteristics = async () => {
      const newCharacteristics = await service.characteristics();
      setCharacteristics(newCharacteristics);
    };

    getCharacteristics();
  }, [service]);

  return (
    <BaseCard disabled style={style}>
      <TouchableOpacity
        onPress={() => {
          setAreCharacteristicsVisible(prev => !prev);
        }}>
        <Text>{`Service UUID: ${service.uuid}`}</Text>
      </TouchableOpacity>

      {areCharacteristicsVisible &&
        characteristics &&
        characteristics.map(char => (
          <CharacteristicCard
            key={char.id}
            char={char}
            style={styles.characteristicCard}
          />
        ))}
    </BaseCard>
  );
};

ServiceCard.defaultProps = {
  style: undefined,
};

export default ServiceCard;
