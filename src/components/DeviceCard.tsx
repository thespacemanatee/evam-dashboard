import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import { RootStackParamList } from '../navigation/index';

type DeviceCardProps = {
  device: Device;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    padding: 12,
  },
});

const DeviceCard = ({ device }: DeviceCardProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // is the device connected?
    device.isConnected().then(setIsConnected);
  }, [device]);

  return (
    <TouchableOpacity
      style={styles.container}
      // navigate to the Device Screen
      onPress={() => navigation.navigate('Device', { device })}>
      <Text>{`ID: ${device.id}`}</Text>
      <Text>{`Name: ${device.name}`}</Text>
      <Text>{`Connected: ${isConnected}`}</Text>
      <Text>{`RSSI : ${device.rssi}`}</Text>
      {device.manufacturerData ? (
        <Text>{`Manufacturer : ${btoa(device.manufacturerData)}`}</Text>
      ) : null}
      <Text>{`UUIDs: ${device.serviceUUIDs}`}</Text>
    </TouchableOpacity>
  );
};

export default DeviceCard;
