import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Service } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import { RootStackParamList } from '../navigation';
import ServiceCard from '../components/ServiceCard';
import { MAX_WIDTH } from '../utils/config';
import { useAppDispatch } from '../app/hooks';
import { setSelectedDeviceUUID } from '../features/settings/settingsSlice';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 12,
  },
  header: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    padding: 12,
    width: MAX_WIDTH / 3,
    flexGrow: 1,
    marginRight: 6,
  },
  services: {
    width: MAX_WIDTH / 2,
    marginLeft: 6,
  },
});

const DeviceScreen = ({
  route,
}: StackScreenProps<RootStackParamList, 'Device'>) => {
  // get the device object which was given through navigation params
  const { device } = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const dispatch = useAppDispatch();

  const disconnectDevice = useCallback(async () => {
    const isDeviceConnected = await device.isConnected();
    if (isDeviceConnected) {
      await device.cancelConnection();
    }
  }, [device]);

  useEffect(() => {
    const getDeviceInformation = async () => {
      try {
        // connect to the device
        const connectedDevice = await device.connect();
        dispatch(setSelectedDeviceUUID(device.id));
        setIsConnected(true);

        // discover all device services and characteristics
        const allServicesAndCharacteristics =
          await connectedDevice.discoverAllServicesAndCharacteristics();
        // get the services only
        const discoveredServices =
          await allServicesAndCharacteristics.services();
        setServices(discoveredServices);

        device.onDisconnected(() => {
          Alert.alert('Disconnected', 'Device was disconnected');
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not connect to selected device');
        // navigation.goBack();
      }
    };

    getDeviceInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderServices = ({ item }) => {
    return <ServiceCard service={item} />;
  };

  return (
    <View style={styles.screen}>
      <Button onPress={disconnectDevice} title='DISCONNECT' />
      <View style={styles.container}>
        <View>
          <View style={styles.header}>
            <Text>{`Id : ${device.id}`}</Text>
            <Text>{`Name : ${device.name}`}</Text>
            <Text>{`Is connected : ${isConnected}`}</Text>
            <Text>{`RSSI : ${device.rssi}`}</Text>
            {device.manufacturerData && (
              <Text>{`Manufacturer : ${btoa(device.manufacturerData)}`}</Text>
            )}
            <Text>{`ServiceData : ${device.serviceData}`}</Text>
            <Text>{`UUIDS : ${device.serviceUUIDs}`}</Text>
          </View>
        </View>
        <FlatList
          data={services}
          renderItem={renderServices}
          style={styles.services}
        />
      </View>
    </View>
  );
};

export default DeviceScreen;
