import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Descriptor } from 'react-native-ble-plx';

type DescriptorCardProps = {
  descriptor: Descriptor;
};

const styles = StyleSheet.create({ container: {} });

const DescriptorCard = ({ descriptor }: DescriptorCardProps) => {
  const [value, setValue] = useState('');
  useEffect(() => {
    (async () => {
      descriptor.read().then(r => {
        if (r && r.value) {
          setValue(r.value);
        }
      });
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Text>{`${descriptor.id} -> ( ${btoa(value)} ) ( ${value} )`}</Text>
    </View>
  );
};

export default DescriptorCard;
