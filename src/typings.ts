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
  READY = 'READY',
  LOAD = 'LOAD',
  LIVE = 'LIVE',
}

export enum CentralDeviceStatusType {
  OFF = 'OFF',
  ON = 'ON',
  REBOOTING = 'REBOOTING',
}

export interface CentralGroup {
  id: string;
  displayName: string;
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
}

export interface CentralReceiver {
  id: string;
  maxStreams: number;
  streams: CentralStream[];
  hosts: string;
}

export interface CentralService {
  id: string;
  name: string;
  displayName: string;
  config: string;
  configLayout: string;
  subservice: CentralSubservice;
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
  userId: string;
  model: string;
  group: CentralGroup;
  serviceIds: string[];
  leaseIds: string[];
  subservices: CentralSubservice[];
  receiver: Partial<CentralReceiver>;
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
  leasesOwnedIds: string[];
  leasesBorrowedIds: string[];
}

export enum CentralLeaseType {
  EXCLUSIVE = 'EXCLUSIVE',
  NON_EXCLUSIVE = 'NON_EXCLUSIVE',
}

export interface CentralLease {
  id: string;
  annotations: string;
  type: CentralLeaseType;
  start: Date;
  expiration: Date;
  canceled: boolean;
  ownerId: string;
  borrowerId: string;
  deviceIds: string[];
}
