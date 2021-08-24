import React, { useEffect, useState } from 'react';
import { StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Characteristic, Service } from 'react-native-ble-plx';

import BaseCard from './BaseCard';
import CharacteristicCard from './CharacteristicCard';

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
          setAreCharacteristicsVisible((prev) => !prev);
        }}>
        <Text>{`UUID : ${service.uuid}`}</Text>
      </TouchableOpacity>

      {areCharacteristicsVisible &&
        characteristics &&
        characteristics.map((char) => (
          <CharacteristicCard key={char.id} char={char} />
        ))}
    </BaseCard>
  );
};

export default ServiceCard;
