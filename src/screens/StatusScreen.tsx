import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Subscription } from 'react-native-ble-plx';

import {
  MENU_ICON_SIZE,
  STATUS_CHARACTERISTIC_UUID,
  STATUS_SERVICE_UUID,
} from '../utils/config';
import CarGraphic from '../components/CarGraphic';
import { RootStackParamList } from '../navigation';
import { bleManagerRef } from '../utils/BleHelper';
import { useAppSelector } from '../app/hooks';
import { decodeBleString, getCharacteristic } from '../utils/utils';
import StatusIndicator from '../components/StatusIndicator';
import { StatusIndicatorData } from '../index';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
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
    top: 90,
    right: 16,
  },
  SAS: {
    position: 'absolute',
    top: 140,
    right: 16,
  },
});

type Props = StackScreenProps<RootStackParamList, 'Status'>;

const StatusScreen = ({ navigation }: Props): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const [data, setIndicatorData] = useState<StatusIndicatorData>();

  const readAndUpdateStatusValues = useCallback(async () => {
    const statusCharacteristic = await getCharacteristic(
      STATUS_SERVICE_UUID,
      deviceUUID,
      STATUS_CHARACTERISTIC_UUID,
    );

    const decodedString = decodeBleString(
      (await statusCharacteristic?.read())?.value,
    );
    setIndicatorData({
      ecu: decodedString.charCodeAt(0),
      bms: decodedString.charCodeAt(1),
      tps: decodedString.charCodeAt(2),
      sas: decodedString.charCodeAt(3),
      imu: decodedString.charCodeAt(4),
      int: decodedString.charCodeAt(5),
      flw: decodedString.charCodeAt(6),
      frw: decodedString.charCodeAt(7),
      rlw: decodedString.charCodeAt(8),
      rrw: decodedString.charCodeAt(9),
      fll: decodedString.charCodeAt(10),
      frl: decodedString.charCodeAt(11),
      rll: decodedString.charCodeAt(12),
      rrl: decodedString.charCodeAt(13),
    });
  }, [deviceUUID]);

  const monitorAndUpdateStatusValues = useCallback(async () => {
    const characteristic = await getCharacteristic(
      STATUS_SERVICE_UUID,
      deviceUUID,
      STATUS_CHARACTERISTIC_UUID,
    );
    return characteristic?.monitor((err, cha) => {
      if (err) {
        console.error(err);
        return;
      }
      const decodedString = decodeBleString(cha?.value);
      setIndicatorData({
        ecu: decodedString.charCodeAt(0),
        bms: decodedString.charCodeAt(1),
        tps: decodedString.charCodeAt(2),
        sas: decodedString.charCodeAt(3),
        imu: decodedString.charCodeAt(4),
        int: decodedString.charCodeAt(5),
        flw: decodedString.charCodeAt(6),
        frw: decodedString.charCodeAt(7),
        rlw: decodedString.charCodeAt(8),
        rrw: decodedString.charCodeAt(9),
        fll: decodedString.charCodeAt(10),
        frl: decodedString.charCodeAt(11),
        rll: decodedString.charCodeAt(12),
        rrl: decodedString.charCodeAt(13),
      });
    });
  }, [deviceUUID]);

  useEffect(() => {
    readAndUpdateStatusValues();
  }, [readAndUpdateStatusValues]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device) {
          subscription = await monitorAndUpdateStatusValues();
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();

    return () => subscription?.remove();
  }, [deviceUUID, monitorAndUpdateStatusValues]);

  return (
    <>
      <View style={[StyleSheet.absoluteFill, styles.screen]}>
        <CarGraphic />
        <StatusIndicator status={data?.frl} label='FRL' style={styles.FRL} />
        <StatusIndicator status={data?.frw} label='FRW' style={styles.FRW} />
        <StatusIndicator status={data?.fll} label='FLL' style={styles.FLL} />
        <StatusIndicator status={data?.flw} label='FLW' style={styles.FLW} />
        <StatusIndicator status={data?.int} label='INT' style={styles.INT} />
        <StatusIndicator status={data?.ecu} label='ECU' style={styles.ECU} />
        <StatusIndicator status={data?.imu} label='IMU' style={styles.IMU} />
        <StatusIndicator status={data?.rrl} label='RRL' style={styles.RRL} />
        <StatusIndicator status={data?.rrw} label='RRW' style={styles.RRW} />
        <StatusIndicator status={data?.rll} label='RLL' style={styles.RLL} />
        <StatusIndicator status={data?.rlw} label='RLW' style={styles.RLW} />
        <StatusIndicator status={data?.bms} label='BMS' style={styles.BMS} />
        <StatusIndicator status={data?.tps} label='TPS' style={styles.TPS} />
        <StatusIndicator status={data?.sas} label='SAS' style={styles.SAS} />
      </View>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.buttonContainer}>
        <Ionicons
          name='chevron-back-outline'
          size={MENU_ICON_SIZE}
          color='white'
        />
      </TouchableOpacity>
    </>
  );
};

export default StatusScreen;
