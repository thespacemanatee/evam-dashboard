import React, { createRef } from 'react';
import { BleManager } from 'react-native-ble-plx';

export const isReadyRef: React.MutableRefObject<boolean | null> = createRef();

export const bleManagerRef: React.MutableRefObject<BleManager | null> =
  createRef();
