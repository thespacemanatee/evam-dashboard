import React, { useEffect, useState } from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import BaseCard from './BaseCard';

interface DeviceCardProps {
  device: Device;
  onPress: (device: Device) => void;
  style?: StyleProp<ViewStyle>;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress, style }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // is the device connected?
    device.isConnected().then(setIsConnected);
  }, [device]);

  return (
    <BaseCard style={style} onPress={() => onPress(device)}>
      <Text>{`ID: ${device.id}`}</Text>
      <Text>{`Name: ${device.name}`}</Text>
      <Text>{`Connected: ${isConnected}`}</Text>
      <Text>{`RSSI: ${device.rssi}`}</Text>
      {device.manufacturerData ? (
        <Text>{`Manufacturer: ${btoa(device.manufacturerData)}`}</Text>
      ) : null}
      <Text>{`UUIDs: ${device.serviceUUIDs}`}</Text>
    </BaseCard>
  );
};

export default DeviceCard;
