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

export interface CentralService {
  id: string;
  name: string;
  displayName: string;
  type: CentralServiceType;
  config: string;
  exclusiveLink: boolean;
  linkedServiceIds: string[];
  deviceId: string;
}

export interface CentralDevice {
  id: string;
  serial: string;
  authId: string;
  userId: string;
  groupId: string;
  serviceIds: string[];
  leaseIds: string[];
}

export interface CentralUser {
  id: string;
  email: string;
  name: string;
  authId: string;
  groupId: string;
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
