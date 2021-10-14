export interface CentralApiOptions {
  port?: number;
  host?: string;
  prefix?: string;
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
  linkedServices: CentralService[];
  device: CentralDevice[];
}

export interface CentralDevice {
  id: string;
  serial: string;
  auth: CentralAuth;
  services: CentralService[];
  user: CentralUser;
  leases: CentralLease[];
}

export interface CentralUser {
  id: string;
  username: string;
  email: string;
  auth: CentralAuth;
  devices: CentralDevice[];
  leasesOwned: CentralLease[];
  leasesBorrowed: CentralLease[];
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
  owner: CentralUser;
  borrower: CentralUser;
  devices: CentralDevice[];
}
