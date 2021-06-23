import React, { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Service } from 'react-native-ble-plx';

import { RootStackParamList } from '../navigation';
import ServiceCard from '../components/ServiceCard';

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },

  header: {
    backgroundColor: 'teal',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    padding: 12,
  },
});

const DeviceScreen = ({
  route,
  navigation,
}: StackScreenProps<RootStackParamList, 'Device'>) => {
  // get the device object which was given through navigation params
  const { device } = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  // handle the device disconnection
  const disconnectDevice = useCallback(async () => {
    navigation.goBack();
    const isDeviceConnected = await device.isConnected();
    if (isDeviceConnected) {
      await device.cancelConnection();
    }
  }, [device]);

  useEffect(() => {
    const getDeviceInformation = async () => {
      // connect to the device
      const connectedDevice = await device.connect();
      setIsConnected(true);

      // discover all device services and characteristics
      const allServicesAndCharacteristics =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      // get the services only
      const discoveredServices = await allServicesAndCharacteristics.services();
      setServices(discoveredServices);
    };

    getDeviceInformation();

    device.onDisconnected(() => {
      navigation.navigate('Dashboard');
    });

    // give a callback to the useEffect to disconnect the device when we will leave the device screen
    return () => {
      disconnectDevice();
    };
  }, [device, disconnectDevice, navigation]);

  const renderDevices = ({ item }) => {
    return <ServiceCard service={item} />;
  };

  return (
    <>
      <FlatList data={services} renderItem={renderDevices} />
      <Button onPress={disconnectDevice} title='DISCONNECT' />
      <View>
        <View style={styles.header}>
          <Text>{`Id : ${device.id}`}</Text>
          <Text>{`Name : ${device.name}`}</Text>
          <Text>{`Is connected : ${isConnected}`}</Text>
          <Text>{`RSSI : ${device.rssi}`}</Text>
          <Text>{`Manufacturer : ${device.manufacturerData}`}</Text>
          <Text>{`ServiceData : ${device.serviceData}`}</Text>
          <Text>{`UUIDS : ${device.serviceUUIDs}`}</Text>
        </View>
      </View>
    </>
  );
};

export default DeviceScreen;
