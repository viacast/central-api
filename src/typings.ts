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

enum IperfAction {
  SERVER = 'server',
  CLIENT = 'client',
}

/* eslint-disable camelcase */

export interface ConnectedInfo {
  socket: number;
  local_host: string;
  local_port: number;
  remote_host: string;
  remote_port: number;
}

export interface TimestampInfo {
  time: string;
  timesecs: number;
}

export interface AcceptedConnectionInfo {
  host: string;
  port: number;
}

export interface TestStartInfo {
  protocol: 'TCP' | 'UDP';
  num_streams: number;
  blksize: number;
  omit: number;
  duration: number;
  bytes: number;
  blocks: number;
  reverse: number;
  tos: number;
  target_bitrate?: number;
  bidir?: number;
  fqrate?: number;
}

export interface StartInfo {
  connected: ConnectedInfo[];
  version: string;
  system_info: string;
  sock_bufsize: number;
  sndbuf_actual: number;
  rcvbuf_actual: number;
  timestamp: TimestampInfo;
  connecting_to: AcceptedConnectionInfo;
  cookie: string;
  tcp_mss_default: number;
  target_bitrate?: number;
  fq_rate?: number;
  test_start: TestStartInfo;
}

export interface IperfInterval {
  streams: IperfStream[];
  sum: IperfStreamSummary;
  sum_bidir: IperfStreamSummary;
  sum_bidir_reverse: IperfStreamSummary;
  sum_sent: IperfStreamSummary;
  sum_received: IperfStreamSummary;
}

export interface IperfStream {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  retransmits?: number;
  omitted: boolean;
  sender: boolean;
  snd_cwnd?: number;
  snd_wnd?: number;
  rtt?: number;
  rttvar?: number;
  pmtu?: number;
}

export interface IperfStreamSummary {
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  retransmits?: number;
  omitted: boolean;
  sender: boolean;
}
export interface Sender {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
  retransmits?: number;
  max_snd_cwnd?: number;
  max_snd_wnd?: number;
  max_rtt?: number;
  min_rtt?: number;
  mean_rtt?: number;
}
export interface Receiver {
  socket: number;
  start: number;
  end: number;
  seconds: number;
  bytes: number;
  bits_per_second: number;
  sender: boolean;
}
export interface Stream {
  sender: Sender;
  receiver: Receiver;
}
export interface End {
  streams: Stream[];
  sum_sent: Sender;
  sum_received: Receiver;
  sum_sent_bidir_reverse?: Sender;
  sum_received_bidir_reverse?: Receiver;
  cpu_utilization_percent: {
    host_total: number;
    host_user: number;
    host_system: number;
    remote_total: number;
    remote_user: number;
    remote_system: number;
  };
  sender_tcp_congestion: string;
  receiver_tcp_congestion?: string;
}

export interface IperfResult {
  start: StartInfo;
  intervals: IperfInterval[];
  end: End;
}
