import React, { useEffect, useState } from 'react';
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
  const [ECU, setECU] = useState(-1);
  const [BMS, setBMS] = useState(-1);
  const [TPS, setTPS] = useState(-1);
  const [SAS, setSAS] = useState(-1);
  const [FLW, setFLW] = useState(-1);
  const [IMU, setIMU] = useState(-1);
  const [INT, setINT] = useState(-1);
  const [FRW, setFRW] = useState(-1);
  const [RLW, setRLW] = useState(-1);
  const [RRW, setRRW] = useState(-1);
  const [FLL, setFLL] = useState(-1);
  const [FRL, setFRL] = useState(-1);
  const [RLL, setRLL] = useState(-1);
  const [RRL, setRRL] = useState(-1);

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
            setECU(decodedString.charCodeAt(0));
            setBMS(decodedString.charCodeAt(1));
            setTPS(decodedString.charCodeAt(2));
            setSAS(decodedString.charCodeAt(3));
            setIMU(decodedString.charCodeAt(4));
            setINT(decodedString.charCodeAt(5));
            setFLW(decodedString.charCodeAt(6));
            setFRW(decodedString.charCodeAt(7));
            setRLW(decodedString.charCodeAt(8));
            setRRW(decodedString.charCodeAt(9));
            setFLL(decodedString.charCodeAt(10));
            setFRL(decodedString.charCodeAt(11));
            setRLL(decodedString.charCodeAt(12));
            setRRL(decodedString.charCodeAt(13));
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
        <StatusIndicator status={FRL} label='FRL' style={styles.FRL} />
        <StatusIndicator status={FRW} label='FRW' style={styles.FRW} />
        <StatusIndicator status={FLL} label='FLL' style={styles.FLL} />
        <StatusIndicator status={FLW} label='FLW' style={styles.FLW} />
        <StatusIndicator status={INT} label='INT' style={styles.INT} />
        <StatusIndicator status={ECU} label='ECU' style={styles.ECU} />
        <StatusIndicator status={IMU} label='IMU' style={styles.IMU} />
        <StatusIndicator status={RRL} label='RRL' style={styles.RRL} />
        <StatusIndicator status={RRW} label='RRW' style={styles.RRW} />
        <StatusIndicator status={RLL} label='RLL' style={styles.RLL} />
        <StatusIndicator status={RLW} label='RLW' style={styles.RLW} />
        <StatusIndicator status={BMS} label='BMS' style={styles.BMS} />
        <StatusIndicator status={TPS} label='TPS' style={styles.TPS} />
        <StatusIndicator status={SAS} label='SAS' style={styles.SAS} />
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
