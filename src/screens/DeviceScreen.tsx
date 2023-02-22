import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  type ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type StackScreenProps } from '@react-navigation/stack';
import { type Service, type Subscription } from 'react-native-ble-plx';
import { decode as btoa } from 'base-64';

import { type SettingsStackParamList } from '../navigation';
import ServiceCard from '../components/bleDevice/ServiceCard';
import { useAppDispatch } from '../app/hooks';
import { setSelectedDeviceUUID } from '../features/settings/settingsSlice';
import BaseCard from '../components/bleDevice/BaseCard';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 12,
  },
  services: {
    marginLeft: 16,
  },
  separator: {
    height: 16,
  },
});

const DeviceScreen = ({
  route,
}: StackScreenProps<SettingsStackParamList, 'Device'>): JSX.Element => {
  const { device } = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<Service[]>();

  const dispatch = useAppDispatch();

  const disconnectDevice = async (): Promise<void> => {
    const isDeviceConnected = await device.isConnected();
    if (isDeviceConnected) {
      await device.cancelConnection();
      setIsConnected(false);
      setServices(undefined);
    }
  };

  useEffect(() => {
    let subscription: Subscription;
    void (async (): Promise<void> => {
      let connectedDevice = device;
      try {
        if (!(await device.isConnected())) {
          connectedDevice = await device.connect();
          dispatch(setSelectedDeviceUUID(device.id));
        }
        setIsConnected(true);

        const allServicesAndCharacteristics =
          await connectedDevice.discoverAllServicesAndCharacteristics();
        const discoveredServices =
          await allServicesAndCharacteristics.services();
        setServices(discoveredServices.reverse());

        subscription = device.onDisconnected(() => {
          setIsConnected(false);
          setServices(undefined);
          Alert.alert('Disconnected', 'Device was disconnected');
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not connect to selected device');
      }
    })();

    return () => {
      subscription.remove();
    };
  }, [device, dispatch]);

  const renderServices: ListRenderItem<Service> = ({ item }) => {
    return <ServiceCard service={item} />;
  };

  return (
    <View style={styles.screen}>
      <Button onPress={disconnectDevice} title="DISCONNECT" />
      <View style={styles.container}>
        <BaseCard disabled>
          <Text>{`Id: ${device.id}`}</Text>
          <Text>{`Name: ${device.name ?? ''}`}</Text>
          <Text>{`Is connected: ${String(isConnected)}`}</Text>
          <Text>{`RSSI: ${device.rssi ?? ''}`}</Text>
          {device.manufacturerData != null && (
            <Text>{`Manufacturer: ${btoa(device.manufacturerData)}`}</Text>
          )}
          <Text>{`ServiceData: ${device.serviceData}`}</Text>
          <Text>{`UUIDS: ${device.serviceUUIDs}`}</Text>
        </BaseCard>
        <FlatList
          data={services}
          renderItem={renderServices}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.services}
        />
      </View>
    </View>
  );
};

export default DeviceScreen;
