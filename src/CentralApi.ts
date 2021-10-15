import {
  AuthInfo,
  CentralApiOptions,
  CentralDevice,
  CentralService,
  CentralUser,
} from './typings';
import SocketClient from './socket/SocketClient';
import HttpClient from './http/HttpClient';
import { CentralHttpResponse } from './http/typings';
import {
  CentralServiceOperationModeType,
  CentralSocketResponse,
} from './socket/typings';

export default class CentralApi {
  private http: HttpClient;

  private socket: SocketClient;

  private locale: string;

  constructor(options: CentralApiOptions) {
    const port = options.port || 4440;
    const host = options.host || 'localhost';
    const prefix = options.prefix || '/v1';
    const locale = options.locale || 'en';
    const https = options.https || false;
    this.http = new HttpClient({ port, host, prefix, locale, https });
    this.socket = new SocketClient({
      port,
      host,
      path: `${prefix}/socket.io`,
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

  onUnauthorized(handler: () => void): void {
    this.http.onUnauthorized(handler);
  }

  ejectOnUnauthorized(useHandle: number): void {
    this.http.ejectOnUnauthorized(useHandle);
  }

  socketConnect(
    onConnect: () => void,
    onConnectError: (error: Error) => void,
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
    CentralHttpResponse<{ devices: CentralDevice[] }>
  > {
    return this.http.userMyDevices();
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
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

  async serviceLink(
    sourceId: string,
    targetId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.serviceLink(sourceId, targetId);
  }

  async deviceGetInfo(): Promise<CentralSocketResponse<CentralDevice>> {
    return this.socket.deviceGetInfo();
  }

  async deviceUpdateStatus(
    status: Record<string, unknown>,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateStatus(status);
  }

  async deviceUpdateServiceOperationModes(
    operationModes: CentralServiceOperationModeType[],
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateServiceOperationModes(operationModes);
  }

  deviceOnUpdateConfig(
    callback: (info: { serviceName: string; config: string }) => void,
  ): void {
    return this.socket.deviceOnUpdateConfig(callback);
  }
}
