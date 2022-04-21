import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Descriptor } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import BaseCard from './BaseCard';

interface DescriptorCardProps {
  descriptor: Descriptor;
}

const DescriptorCard: React.FC<DescriptorCardProps> = ({ descriptor }) => {
  const [value, setValue] = useState('');
  useEffect(() => {
    (async () => {
      descriptor.read().then(r => {
        if (r && r.value) {
          setValue(r.value);
        }
      });
    })();
  }, [descriptor]);
  return (
    <BaseCard>
      <Text>{`${descriptor.id} -> ( ${btoa(value)} ) ( ${value} )`}</Text>
    </BaseCard>
  );
};

export default DescriptorCard;
