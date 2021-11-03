export interface CentralApiOptions {
  port?: number;
  host?: string;
  prefix?: string;
  timeout?: number;
  locale?: string;
  https?: boolean;
}

export interface AuthInfo {
  token: string;
  refreshToken: string;
}

export enum AuthRole {
  ADMIN = 'ADMIN',
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

export interface CentralServiceOperationMode {
  id: string;
  name: string;
  displayName: string;
  type: CentralServiceType;
  configLayout: string;
}

export interface CentralService {
  id: string;
  name: string;
  displayName: string;
  config: string;
  operationMode: CentralServiceOperationMode;
  operationModeId: string;
  exclusiveLink: boolean;
  linkedServiceIds: string[];
  deviceId: string;
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
  type: string;
  group: CentralGroup;
  serviceIds: string[];
  leaseIds: string[];
  serviceOperationModes: CentralServiceOperationMode[];
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
