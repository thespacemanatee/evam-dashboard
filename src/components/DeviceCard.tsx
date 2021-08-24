import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleProp, Text, ViewStyle } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import { RootStackParamList } from '../navigation/index';
import BaseCard from './BaseCard';

interface DeviceCardProps {
  device: Device;
  style?: StyleProp<ViewStyle>;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, style }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // is the device connected?
    device.isConnected().then(setIsConnected);
  }, [device]);

  return (
    <BaseCard
      style={style}
      onPress={() => navigation.navigate('Device', { device })}>
      <Text>{`ID: ${device.id}`}</Text>
      <Text>{`Name: ${device.name}`}</Text>
      <Text>{`Connected: ${isConnected}`}</Text>
      <Text>{`RSSI : ${device.rssi}`}</Text>
      {device.manufacturerData ? (
        <Text>{`Manufacturer : ${btoa(device.manufacturerData)}`}</Text>
      ) : null}
      <Text>{`UUIDs: ${device.serviceUUIDs}`}</Text>
    </BaseCard>
  );
};

export default DeviceCard;
