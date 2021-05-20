import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Device } from 'react-native-ble-plx';
import { StackNavigationProp } from '@react-navigation/stack';

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
  const navigation = useNavigation<StackNavigationProp<any>>();

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
      <Text>{`Id : ${device.id}`}</Text>
      <Text>{`Name : ${device.name}`}</Text>
      <Text>{`Is connected : ${isConnected}`}</Text>
      <Text>{`RSSI : ${device.rssi}`}</Text>
      {/* Decode the ble device manufacturer which is encoded with the base64 algorithm */}
      <Text>
        {`Manufacturer : ${btoa(device.manufacturerData?.replace(/[=]/g, ''))}`}
      </Text>
      <Text>{`ServiceData : ${device.serviceData}`}</Text>
      <Text>{`UUIDS : ${device.serviceUUIDs}`}</Text>
    </TouchableOpacity>
  );
};

export default DeviceCard;
