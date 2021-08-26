import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Subscription } from 'react-native-ble-plx';

import { MENU_ICON_SIZE } from '../utils/config';
import CarGraphic from '../components/CarGraphic';
import { RootStackParamList } from '../navigation';
import { bleManagerRef } from '../utils/BleHelper';
import { useAppSelector } from '../app/hooks';
import { STATUS_CHARACTERISTIC_UUID } from '../utils/constants';
import { decodeBleString, getCharacteristic } from '../utils/utils';
import BatteryStatistics from '../components/BatteryStatistics';
import StatusIndicator from '../components/StatusIndicator';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  carGraphicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  batteryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 16,
  },
  FRL: {
    position: 'absolute',
    top: 60,
    right: 220,
  },
  FRW: {
    position: 'absolute',
    top: 110,
    right: 220,
  },
  FLL: {
    position: 'absolute',
    top: 60,
    left: 220,
  },
  FLW: {
    position: 'absolute',
    top: 110,
    left: 220,
  },
  INT: {
    position: 'absolute',
    top: 190,
    right: 260,
  },
  ECU: {
    position: 'absolute',
    top: 190,
    left: 260,
  },
  IMU: {
    position: 'absolute',
    top: 190,
    left: 150,
  },
  RRL: {
    position: 'absolute',
    top: 270,
    right: 195,
  },
  RRW: {
    position: 'absolute',
    top: 320,
    right: 195,
  },
  RLL: {
    position: 'absolute',
    top: 270,
    left: 195,
  },
  RLW: {
    position: 'absolute',
    top: 320,
    left: 195,
  },
  BMS: {
    position: 'absolute',
    top: 40,
    right: 16,
  },
  TPS: {
    position: 'absolute',
    top: 80,
    left: 16,
  },
  SAS: {
    position: 'absolute',
    top: 130,
    left: 16,
  },
});

type Props = StackScreenProps<RootStackParamList, 'Status'>;

const StatusScreen = ({ navigation }: Props): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );

  useEffect(() => {
    let subscription: Subscription | undefined;
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device) {
          const characteristic = await getCharacteristic(
            deviceUUID,
            STATUS_CHARACTERISTIC_UUID,
          );
          subscription = characteristic?.monitor((err, cha) => {
            if (err) {
              console.error(err);
              return;
            }
            const decodedString = decodeBleString(cha?.value);
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();

    return () => subscription?.remove();
  }, [deviceUUID]);

  return (
    <View style={styles.screen}>
      <View style={[StyleSheet.absoluteFill, styles.carGraphicContainer]}>
        <CarGraphic />
        <StatusIndicator label='FRL' style={styles.FRL} />
        <StatusIndicator label='FRW' style={styles.FRW} />
        <StatusIndicator label='FLL' style={styles.FLL} />
        <StatusIndicator label='FLW' style={styles.FLW} />
        <StatusIndicator label='INT' style={styles.INT} />
        <StatusIndicator label='ECU' style={styles.ECU} />
        <StatusIndicator label='IMU' style={styles.IMU} />
        <StatusIndicator label='RRL' style={styles.RRL} />
        <StatusIndicator label='RRW' style={styles.RRW} />
        <StatusIndicator label='RLL' style={styles.RLL} />
        <StatusIndicator label='RLW' style={styles.RLW} />
        <StatusIndicator label='BMS' style={styles.BMS} />
        <StatusIndicator label='TPS' style={styles.TPS} />
        <StatusIndicator label='SAS' style={styles.SAS} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='chevron-back-outline'
            size={MENU_ICON_SIZE}
            color='white'
          />
        </TouchableOpacity>
      </View>
      <View style={styles.batteryContainer}>
        <BatteryStatistics />
      </View>
    </View>
  );
};

export default StatusScreen;
