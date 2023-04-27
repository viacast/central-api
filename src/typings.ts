export interface CentralApiOptions {
  port?: number;
  host?: string;
  prefix?: string;
  timeout?: number;
  locale?: string;
  https?: boolean;
}

export interface AuthInfo {
  verified: boolean;
  token?: string;
  refreshToken?: string;
}

export enum AuthRole {
  ADMIN = 'ADMIN',
  KEYGEN = 'KEYGEN',
  USER = 'USER',
  DEVICE = 'DEVICE',
}

export interface CentralAuth {
  id: string;
  key: string;
  role: AuthRole;
}

export enum CentralServiceType {
  FEED = 'FEED',
  OUTPUT = 'OUTPUT',
  STATIC = 'STATIC',
}

export enum CentralServiceStatusType {
  OFF = 'OFF',
  LOAD = 'LOAD',
  NO_VIDEO = 'NO_VIDEO',
  STANDBY = 'STANDBY',
  LIVE = 'LIVE',
  ERROR = 'ERROR',
}

export enum CentralDeviceStatusType {
  OFF = 'OFF',
  ON = 'ON',
  REBOOTING = 'REBOOTING',
}

export interface CentralGroupUserRole {
  userId: string;
  roleId: string;
}

export interface CentralGroup {
  id: string;
  displayName: string;
  users: CentralUser[];
  deviceIds: string[];
  owner: CentralUser;
  ownerId: string;
  roles: CentralGroupRole[];
  defaultRoleId: string;
  userRoles?: CentralGroupUserRole[];
}

export interface CentralGroupRole {
  id: string;
  name: string;
  description: string;
}

export type ToggleRunningAction = 'start' | 'stop' | 'restart';

export interface CentralSubservice {
  id?: string;
  name: string;
  displayName: string;
  serviceName: string;
  type: CentralServiceType;
  configLayout: string;
}

export interface CentralStream {
  id: string;
  label: string;
  port: number;
  enabled: boolean;
  index: number;
  serviceIds: string[];
}

export interface CentralReceiver {
  id: string;
  maxStreams: number;
  hosts: string;
  streams?: CentralStream[];
  streamIds?: string[];
}

export interface CentralService {
  id: string;
  name: string;
  displayName: string;
  config: string;
  configLayout: string;
  subserviceId: string;
  subserviceConfig: string;
  deviceId: string;
  stream: CentralStream;
  streamId: string;
}

export interface CentralServiceStatus {
  status: CentralServiceStatusType;
  id?: string;
  info?: Record<string, unknown>;
}

export type CentralServiceWithStatus = CentralService & CentralServiceStatus;

export interface CentralDevice {
  id: string;
  displayName: string;
  serial: string;
  user: CentralUser;
  userId: string;
  model: string;
  group: CentralGroup;
  serviceIds: string[];
  subservices: CentralSubservice[];
  receiver: Partial<CentralReceiver>;
}

export interface CentralNetworkInterface {
  name: string;
  address: string;
  mac: string;
  state: 'unknown' | 'down' | 'up';
  txRate: number;
  rxRate: number;
  speed: string;
  duplex: string;
}

export interface CentralSystemInfo {
  serial: string;
  model: string;
  date: number;
  uptime: number;
  battery: number;
  cpu: {
    clock: number;
    temperature: number;
    usage: number;
    processCount: number;
  };
  memory: {
    total: number;
    free: number;
    usage: number;
  };
}

export enum CentralModemTechnology {
  NONE = 'NONE',
  ONE_G = 'G',
  TWO_G = '2G',
  THREE_G = '3G',
  E = 'E',
  H = 'H',
  H_PLUS = 'H+',
  FOUR_G = '4G',
}

export interface CentralModemInfo {
  interfaceName: string;
  model: string;
  state: string;
  signal: number;
  registration: {
    state: number;
    technology: CentralModemTechnology;
    carrier: string;
  };
  sim: {
    imsi: string;
    carrier: string;
    carrierName: string;
  };
}

export interface CentralDeviceStatistics {
  network: { interfaces: CentralNetworkInterface[] };
  system: CentralSystemInfo;
  modems: CentralModemInfo[];
}

export interface CentralDeviceStatus {
  status: CentralDeviceStatusType;
  id?: string;
  info?: Record<string, unknown>;
}

export type CentralDeviceWithStatus = CentralDevice & CentralDeviceStatus;

export interface CentralUser {
  id: string;
  email: string;
  name: string;
  organization: string;
  group: CentralGroup;
  deviceIds: string[];
}

export interface CentralDeviceAuditReport {
  id: string;
  type: string;
  when: Date;
  extra: string;
  auth: CentralAuth;
  deviceId: string;
  serviceId: string;
}

export interface ServiceConfigOption {
  value: string;
  label: string;
}

export interface ServiceConfigSlider {
  min?: string;
  max?: string;
  step?: string;
  unit?: string;
  scale?: string;
  range?: boolean;
}

export interface ServiceConfigField {
  name: string;
  label: string;
  type?: 'boolean' | 'select' | 'slider' | 'stream' | 'subservice';
  easy?: boolean;
  hidden?: boolean;
  slider?: ServiceConfigSlider;
  option?: ServiceConfigOption[];
}

export interface ServiceConfig {
  config: { field: ServiceConfigField[] };
}

export enum VideoInfoShortNameType {
  NTSC = 'ntsc',
  NTSC2398 = 'nt23',
  PAL = 'pal ',
  NTSCp = 'ntsp',
  PALp = 'palp',

  /* HD 1080 Modes */
  HD1080p2398 = '23ps',
  HD1080p24 = '24ps',
  HD1080p25 = 'Hp25',
  HD1080p2997 = 'Hp29',
  HD1080p30 = 'Hp30',
  HD1080i50 = 'Hi50',
  HD1080i5994 = 'Hi59',
  HD1080i6000 = 'Hi60',
  HD1080p50 = 'Hp50',
  HD1080p5994 = 'Hp59',
  HD1080p6000 = 'Hp60',

  /* HD 720 Modes */
  HD720p50 = 'hp50',
  HD720p5994 = 'hp59',
  HD720p60 = 'hp60',

  /* 2k Modes */
  QHD2398 = '2k23',
  QHD24 = '2k24',
  QHD25 = '2k25',

  /* DCI Modes */
  QHDDCI2398 = '2d23',
  QHDDCI24 = '2d24',
  QHDDCI25 = '2d25',

  /* 4k Modes */
  UHD2160p2398 = '4k23',
  UHD2160p24 = '4k24',
  UHD2160p25 = '4k25',
  UHD2160p2997 = '4k29',
  UHD2160p30 = '4k30',
  UHD2160p50 = '4k50',
  UHD2160p5994 = '4k59',
  UHD2160p60 = '4k60',

  /* DCI Modes  */
  UHDDCI2398 = '4d23',
  UHDDCI24 = '4d24',
  UHDDCI25 = '4d25',

  UNKNOW = 'unknow',
}

export enum VideoInfoNameType {
  NTSC = 'NTSC',
  NTSC2398 = 'NTSC',
  PAL = 'PAL',
  NTSCp = 'NTSC',
  PALp = 'PALp',

  /* HD 1080 Modes */
  HD1080p2398 = '1080p23.98',
  HD1080p24 = '1080p24',
  HD1080p25 = '1080p25',
  HD1080p2997 = '1080p2997',
  HD1080p30 = '1080p30',
  HD1080i50 = '1080i50',
  HD1080i5994 = '1080i59.94',
  HD1080i6000 = '1080i60',
  HD1080p50 = '1080p50',
  HD1080p5994 = '1080p59.94',
  HD1080p6000 = '1080p60',

  /* HD 720 Modes */
  HD720p50 = '720p50',
  HD720p5994 = '720p59.94',
  HD720p60 = '720p60',

  /* 2k Modes */
  QHD2398 = '1080p23.98_2k',
  QHD24 = '1080p24_2k',
  QHD25 = '1080p25_2k',

  /* DCI Modes */
  QHDDCI2398 = '1080p23.98_DCI_2K',
  QHDDCI24 = '1080p24_DCI_2K',
  QHDDCI25 = '1080p25_DCI_2K',

  /* 4k Modes */
  UHD2160p2398 = '2160p23.98',
  UHD2160p24 = '2160p24',
  UHD2160p25 = '2160p25',
  UHD2160p2997 = '2160p29.97',
  UHD2160p30 = '2160p30',
  UHD2160p50 = '2160p50',
  UHD2160p5994 = '2160p59.94',
  UHD2160p60 = '2160p60',

  /* DCI Modes  */
  UHDDCI2398 = '2160p23.98',
  UHDDCI24 = '2160p24',
  UHDDCI25 = '2160p25',

  UNKNOW = 'Unknow',
}

export interface VideoInfo {
  name?: VideoInfoNameType;
  shortName?: VideoInfoShortNameType;
}
