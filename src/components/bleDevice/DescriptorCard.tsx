import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { type Descriptor } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import BaseCard from './BaseCard';

interface DescriptorCardProps {
  descriptor: Descriptor;
}

const DescriptorCard: React.FC<DescriptorCardProps> = ({ descriptor }) => {
  const [value, setValue] = useState('');
  useEffect(() => {
    void (async () => {
      try {
        const r = await descriptor.read();
        if (r.value != null) {
          setValue(r.value);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [descriptor]);
  return (
    <BaseCard>
      <Text>{`${descriptor.id} -> ( ${btoa(value)} ) ( ${value} )`}</Text>
    </BaseCard>
  );
};

export default DescriptorCard;
