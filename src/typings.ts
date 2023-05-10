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

export interface Version {
  version: string;
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
