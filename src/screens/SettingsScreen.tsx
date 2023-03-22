import { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, Button, Text } from 'react-native';
import { type Subscription, type Device } from 'react-native-ble-plx';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addDevice,
  resetDevices,
  setSelectedDeviceUUID,
} from '../features/settings/settingsSlice';
import DeviceCard from '../components/bleDevice/DeviceCard';
import { bleManagerRef, scanDevices } from '../utils/BleHelper';
import { type SettingsScreenProps } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CORE_SERVICE_UUID } from '../utils/config';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingVertical: 16,
    paddingEnd: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 0.5,
    marginHorizontal: 8,
  },
  list: {
    flex: 1,
    marginHorizontal: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  card: {
    marginVertical: 8,
  },
  connectedSection: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  connectedText: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const SettingsScreen = ({ navigation }: SettingsScreenProps): JSX.Element => {
  const devices = useAppSelector((state) => state.settings.devices);
  const [bluetoothLoading, setBluetoothLoading] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device>();

  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      // get currently connected devices
      let subscription: Subscription | undefined;
      bleManagerRef.current
        ?.connectedDevices([CORE_SERVICE_UUID])
        .then((devices) => {
          const device = devices.find((device) =>
            device.name?.includes('EVAM'),
          );
          setConnectedDevice(device);
          subscription = device?.onDisconnected(() => {
            setConnectedDevice(undefined);
            dispatch(setSelectedDeviceUUID(''));
          });
        })
        .catch((error) => {
          console.error(error);
        });

      return () => subscription?.remove();
    }, []),
  );

  const navigateToDevice = (device: Device): void => {
    navigation.navigate('Device', { device });
  };

  const handleScanDevices = async (): Promise<void> => {
    try {
      setBluetoothLoading(true);
      await scanDevices(
        (scannedDevice) => {
          if (scannedDevice.name?.includes('EVAM') === true) {
            dispatch(addDevice(scannedDevice));
          }
        },
        () => {
          setBluetoothLoading(false);
        },
      );
    } catch (err) {
      setBluetoothLoading(false);
      console.error(err);
    }
  };

  const EmptyComponent = (): React.ReactElement => {
    return (
      <View style={styles.emptyContainer}>
        <Text>No devices found!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            onPress={handleScanDevices}
            title="SCAN"
            disabled={bluetoothLoading}
          />
        </View>
        <View style={styles.button}>
          <Button
            onPress={() => dispatch(resetDevices())}
            title="RESET"
            disabled={bluetoothLoading}
          />
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={styles.connectedSection}>
          <Text style={styles.connectedText}>Currently connected to:</Text>
          {connectedDevice != null ? (
            <DeviceCard device={connectedDevice} onPress={navigateToDevice} />
          ) : null}
        </View>
        <FlatList
          keyExtractor={(item) => item.id}
          data={devices}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyComponent}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPress={navigateToDevice}
              style={styles.card}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
