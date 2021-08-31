export type RadioChannel = {
  id: number;
  name: string;
  channel: string;
  url: string;
  imageUrl: string;
};

export type TopIndicatorData = {
  ecu: number;
  bms: number;
  tps: number;
  sas: number;
  whl: number;
};

export type StatusIndicatorData = {
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
};
