import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Subscription } from 'react-native-ble-plx';
import { useSharedValue } from 'react-native-reanimated';

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
  const ecu = useSharedValue(-1);
  const bms = useSharedValue(-1);
  const tps = useSharedValue(-1);
  const sas = useSharedValue(-1);
  const imu = useSharedValue(-1);
  const int = useSharedValue(-1);
  const flw = useSharedValue(-1);
  const frw = useSharedValue(-1);
  const rlw = useSharedValue(-1);
  const rrw = useSharedValue(-1);
  const fll = useSharedValue(-1);
  const frl = useSharedValue(-1);
  const rll = useSharedValue(-1);
  const rrl = useSharedValue(-1);

  useEffect(() => {
    let subscription: Subscription | undefined;
    const getDevice = async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device) {
          const characteristic = await getCharacteristic(
            STATUS_SERVICE_UUID,
            deviceUUID,
            STATUS_CHARACTERISTIC_UUID,
          );
          subscription = characteristic?.monitor((err, cha) => {
            if (err) {
              console.error(err);
              return;
            }
            const decodedString = decodeBleString(cha?.value);
            ecu.value = decodedString.charCodeAt(0);
            bms.value = decodedString.charCodeAt(1);
            tps.value = decodedString.charCodeAt(2);
            sas.value = decodedString.charCodeAt(3);
            imu.value = decodedString.charCodeAt(4);
            int.value = decodedString.charCodeAt(5);
            flw.value = decodedString.charCodeAt(6);
            frw.value = decodedString.charCodeAt(7);
            rlw.value = decodedString.charCodeAt(8);
            rrw.value = decodedString.charCodeAt(9);
            fll.value = decodedString.charCodeAt(10);
            frl.value = decodedString.charCodeAt(11);
            rll.value = decodedString.charCodeAt(12);
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDevice();

    return () => subscription?.remove();
  }, [
    bms,
    deviceUUID,
    ecu,
    fll,
    flw,
    frl,
    frw,
    imu,
    int,
    rll,
    rlw,
    rrw,
    sas,
    tps,
  ]);

  return (
    <View style={styles.screen}>
      <View style={[StyleSheet.absoluteFill, styles.carGraphicContainer]}>
        <CarGraphic />
        <StatusIndicator status={frl} label='FRL' style={styles.FRL} />
        <StatusIndicator status={frw} label='FRW' style={styles.FRW} />
        <StatusIndicator status={fll} label='FLL' style={styles.FLL} />
        <StatusIndicator status={flw} label='FLW' style={styles.FLW} />
        <StatusIndicator status={int} label='INT' style={styles.INT} />
        <StatusIndicator status={ecu} label='ECU' style={styles.ECU} />
        <StatusIndicator status={imu} label='IMU' style={styles.IMU} />
        <StatusIndicator status={rrl} label='RRL' style={styles.RRL} />
        <StatusIndicator status={rrw} label='RRW' style={styles.RRW} />
        <StatusIndicator status={rll} label='RLL' style={styles.RLL} />
        <StatusIndicator status={rlw} label='RLW' style={styles.RLW} />
        <StatusIndicator status={bms} label='BMS' style={styles.BMS} />
        <StatusIndicator status={tps} label='TPS' style={styles.TPS} />
        <StatusIndicator status={sas} label='SAS' style={styles.SAS} />
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
    </View>
  );
};

export default StatusScreen;
