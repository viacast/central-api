import {
  CentralDeviceStatus,
  CentralDeviceWithStatus,
  CentralServiceStatus,
  CentralServiceWithStatus,
} from 'index';
import {
  AuthInfo,
  CentralApiOptions,
  CentralDevice,
  CentralService,
  CentralServiceOperationMode,
  CentralUser,
} from './typings';
import SocketClient from './socket/SocketClient';
import HttpClient from './http/HttpClient';
import { CentralHttpResponse } from './http/typings';
import { CentralSocketResponse } from './socket/typings';

export default class CentralApi {
  private http: HttpClient;

  private socket: SocketClient;

  private locale: string;

  constructor(options: CentralApiOptions) {
    const port = options.port || 4440;
    const host = options.host || 'localhost';
    const prefix = options.prefix || '/v1';
    const timeout = options.timeout || 3000;
    const locale = options.locale || 'en';
    const https = options.https || false;
    this.http = new HttpClient({ port, host, prefix, timeout, locale, https });
    this.socket = new SocketClient({
      port,
      host,
      path: `${prefix}/socket.io`,
      timeout,
      locale,
      https,
    });
  }

  get currentLocale(): string {
    return this.locale;
  }

  setLocale(locale: string): void {
    this.http.setLocale(locale);
    this.socket.setLocale(locale);
  }

  setToken(token: string): void {
    this.http.setToken(token);
    this.socket.setToken(token);
  }

  onUnauthorized(handler: () => void): number {
    return this.http.onUnauthorized(handler);
  }

  ejectOnUnauthorized(useHandle: number): void {
    this.http.ejectOnUnauthorized(useHandle);
  }

  socketTryConnect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    return this.socket.tryConnect(onConnect, onConnectError);
  }

  socketConnect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    return this.socket.connect(onConnect, onConnectError);
  }

  async authLogin(
    key: string,
    password: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    const r = await this.http.authLogin(key, password);
    if (r.success) {
      this.socket.setToken(r.data.token);
    }
    return r;
  }

  async authRefreshToken(
    refreshToken: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    const r = await this.http.authRefreshToken(refreshToken);
    if (r.success) {
      this.socket.setToken(r.data.token);
    }
    return this.http.authRefreshToken(refreshToken);
  }

  async authChangePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.authChangePassword(oldPassword, newPassword);
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.http.userMe();
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
  > {
    return this.http.userMyDevices();
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
  > {
    return this.http.userMyServices();
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.http.deviceMe();
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.http.deviceMyServices();
  }

  async deviceGetInfo(): Promise<CentralSocketResponse<CentralDevice>> {
    return this.socket.deviceGetInfo();
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateStatus(status);
  }

  async deviceUpdateServiceStatus(
    status: CentralServiceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateServiceStatus(status);
  }

  async deviceUpdateServiceOperationModes(
    operationModes: CentralServiceOperationMode[],
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateServiceOperationModes(operationModes);
  }

  deviceOnStatusUpdated(callback: (status: CentralDeviceStatus) => void): void {
    return this.socket.deviceOnStatusUpdated(callback);
  }

  deviceOnServiceStatusUpdated(
    callback: (status: CentralServiceStatus) => void,
  ): void {
    return this.socket.deviceOnServiceStatusUpdated(callback);
  }

  deviceOnUpdate(callback: (device: Partial<CentralDevice>) => void): void {
    return this.socket.deviceOnUpdate(callback);
  }

  deviceOnUpdateConfig(
    callback: (info: { serviceName: string; config: string }) => void,
  ): void {
    return this.socket.deviceOnUpdateConfig(callback);
  }

  async serviceLink(
    sourceId: string,
    targetId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.serviceLink(sourceId, targetId);
  }

  async serviceUpdate(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.serviceUpdate(service);
  }

  serviceOnUpdate(callback: (service: Partial<CentralService>) => void): void {
    return this.socket.serviceOnUpdate(callback);
  }
}
