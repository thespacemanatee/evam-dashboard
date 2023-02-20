export interface RadioChannel {
  id: number;
  name: string;
  channel: string;
  url: string;
  imageUrl: string;
}

export interface TopIndicatorData {
  ecu: number;
  bms: number;
  tps: number;
  sas: number;
  whl: number;
}

export interface StatusIndicatorData {
  ecu: number;
  bms: number;
  tps: number;
  sas: number;
  imu: number;
  int: number;
  flw: number;
  frw: number;
  rlw: number;
  rrw: number;
  fll: number;
  frl: number;
  rll: number;
  rrl: number;
}
