import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type StackScreenProps } from '@react-navigation/stack';
import { type Subscription } from 'react-native-ble-plx';

import { MENU_ICON_SIZE } from '../utils/config';
import CarGraphic from '../components/status/CarGraphic';
import { type DashboardStackParamList } from '../navigation';
import { bleManagerRef } from '../utils/BleHelper';
import { useAppSelector } from '../app/hooks';
import {
  decodeBleString,
  getStatusCharacteristic,
  getStatusIndicatorData,
} from '../utils/utils';
import StatusIndicator from '../components/status/StatusIndicator';
import { type StatusIndicatorData } from '../index';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
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
  FW: {
    position: 'absolute',
    top: 110,
    right: 220,
  },
  FL: {
    position: 'absolute',
    top: 60,
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
  RL: {
    position: 'absolute',
    top: 270,
    right: 195,
  },
  RRW: {
    position: 'absolute',
    top: 320,
    right: 195,
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

type Props = StackScreenProps<DashboardStackParamList, 'Status'>;

const StatusScreen = ({ navigation }: Props): JSX.Element => {
  const deviceUUID = useAppSelector(
    (state) => state.settings.selectedDeviceUUID,
  );
  const [indicatorData, setIndicatorData] = useState<StatusIndicatorData>();

  const readAndUpdateStatusValues = useCallback(async () => {
    try {
      const statusCharacteristic = await getStatusCharacteristic();
      const decodedString = decodeBleString(
        (await statusCharacteristic?.read())?.value,
      );
      setIndicatorData(getStatusIndicatorData(decodedString));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const monitorAndUpdateStatusValues = useCallback(async () => {
    try {
      const characteristic = await getStatusCharacteristic();
      return characteristic?.monitor((err, cha) => {
        if (err != null) {
          console.error(err);
          return;
        }
        const decodedString = decodeBleString(cha?.value);
        setIndicatorData(getStatusIndicatorData(decodedString));
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await readAndUpdateStatusValues();
      } catch (err) {
        console.error(err);
      }
    })();
  }, [readAndUpdateStatusValues]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    void (async () => {
      try {
        const device = await bleManagerRef.current?.devices([deviceUUID]);
        if (device != null && device.length > 0) {
          subscription = await monitorAndUpdateStatusValues();
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, [deviceUUID, monitorAndUpdateStatusValues]);

  return (
    <>
      <View style={[StyleSheet.absoluteFill, styles.screen]}>
        <CarGraphic />
        <StatusIndicator
          status={indicatorData?.fw}
          label="FW"
          style={styles.FW}
        />
        <StatusIndicator
          status={indicatorData?.fl}
          label="FL"
          style={styles.FL}
        />
        <StatusIndicator
          status={indicatorData?.int}
          label="INT"
          style={styles.INT}
        />
        <StatusIndicator
          status={indicatorData?.ecu}
          label="ECU"
          style={styles.ECU}
        />
        <StatusIndicator
          status={indicatorData?.imu}
          label="IMU"
          style={styles.IMU}
        />
        <StatusIndicator
          status={indicatorData?.rl}
          label="RL"
          style={styles.RL}
        />
        <StatusIndicator
          status={indicatorData?.rrw}
          label="RRW"
          style={styles.RRW}
        />
        <StatusIndicator
          status={indicatorData?.rlw}
          label="RLW"
          style={styles.RLW}
        />
        <StatusIndicator
          status={indicatorData?.bms}
          label="BMS"
          style={styles.BMS}
        />
        <StatusIndicator
          status={indicatorData?.tps}
          label="TPS"
          style={styles.TPS}
        />
        <StatusIndicator
          status={indicatorData?.sas}
          label="SAS"
          style={styles.SAS}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={styles.backButton}
      >
        <Ionicons
          name="chevron-back-outline"
          size={MENU_ICON_SIZE}
          color="white"
        />
      </TouchableOpacity>
    </>
  );
};

export default StatusScreen;
