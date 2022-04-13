import {
  CentralDeviceStatus,
  CentralDeviceWithStatus,
  CentralServiceStatus,
  CentralServiceWithStatus,
  AuthInfo,
  CentralApiOptions,
  CentralDevice,
  CentralService,
  CentralUser,
  ToggleRunningAction,
  CentralGroup,
  CentralStream,
} from './typings';
import SocketClient, { SocketEventOff } from './socket/SocketClient';
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

  get socketConnected(): boolean {
    return this.socket.connected;
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

  socketConnect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    return this.socket.connect(onConnect, onConnectError);
  }

  socketTryConnect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    return this.socket.tryConnect(onConnect, onConnectError);
  }

  socketDisconnect(): void {
    return this.socket.disconnect();
  }

  socketWaitConnected(howLong?: number): Promise<void> {
    return this.socket.waitConnected(howLong);
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

  async authRequestVerificationCode(): Promise<CentralHttpResponse<null>> {
    return this.http.authRequestVerificationCode();
  }

  async authSubmitVerificationCode(
    code: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.authSubmitVerificationCode(code);
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

  async userRegister(
    user: Partial<CentralUser> & { password: string; captchaToken: string },
  ): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.http.userRegister(user);
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.http.userMe();
  }

  async userUpdateMe(
    user: Partial<CentralUser>,
  ): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.http.userUpdateMe(user);
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
  > {
    return this.http.userMyDevices();
  }

  async userMyStreams(): Promise<
    CentralHttpResponse<{ streams: CentralStream[] }>
  > {
    return this.http.userMyStreams();
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
  > {
    return this.http.userMyServices();
  }

  async userMyGroups(): Promise<
    CentralHttpResponse<{ groups: CentralGroup[] }>
  > {
    return this.http.userMyGroups();
  }

  userOnUpdate(callback: (user: Partial<CentralUser>) => void): SocketEventOff {
    return this.socket.userOnUpdate(callback);
  }

  async deviceRegister(
    device: Partial<CentralDevice> & { key: string },
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.http.deviceRegister(device);
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.http.deviceMe();
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.http.deviceMyServices();
  }

  async deviceKeygen(
    serial: string,
    forceNew: boolean,
  ): Promise<CentralHttpResponse<{ serial: string; key: string }>> {
    return this.http.deviceKeygen(serial, forceNew);
  }

  async deviceRequestOwnership(
    serial: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.deviceRequestOwnership(serial);
  }

  async deviceSubmitOwnershipCode(
    serial: string,
    code: string,
    takeOwnership = false,
  ): Promise<CentralHttpResponse<{ device: CentralDevice } | null>> {
    return this.http.deviceSubmitOwnershipCode(serial, code, takeOwnership);
  }

  async deviceUpdateMe(
    device: Partial<CentralDevice>,
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.http.deviceUpdateMe(device);
  }

  async deviceUpdate(
    device: Partial<CentralDevice>,
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.http.deviceUpdate(device);
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateStatus(status);
  }

  async deviceRefreshClient(id: string): Promise<CentralHttpResponse<null>> {
    return this.http.deviceRefreshClient(id);
  }

  deviceOnUpdate(
    callback: (device: Partial<CentralDevice>) => void,
  ): SocketEventOff {
    return this.socket.deviceOnUpdate(callback);
  }

  deviceOnUpdateStatus(
    callback: (deviceStatus: Partial<CentralDeviceStatus>) => void,
  ): SocketEventOff {
    return this.socket.deviceOnUpdateStatus(callback);
  }

  deviceOnRequestOwnership(
    callback: (code: { code: string; expiration: number }) => void,
  ): SocketEventOff {
    return this.socket.deviceOnRequestOwnership(callback);
  }

  deviceOnRefreshClient(callback: () => void): SocketEventOff {
    return this.socket.deviceOnRefreshClient(callback);
  }

  async serviceRegister(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<{ service: CentralService }>> {
    return this.http.serviceRegister(service);
  }

  async serviceUpdate(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<{ service: CentralService }>> {
    return this.http.serviceUpdate(service);
  }

  async serviceUpdateStatus(
    status: CentralServiceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.serviceUpdateStatus(status);
  }

  async serviceToggleRunning(
    id: string,
    action: ToggleRunningAction,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.serviceToggleRunning(id, action);
  }

  async serviceUpdatePreview(
    serviceId: string,
    preview: string,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.serviceUpdatePreview(serviceId, preview);
  }

  async serviceUpdateVu(
    serviceId: string,
    volumes: number[],
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.serviceUpdateVu(serviceId, volumes);
  }

  async serviceSubscribePreview(
    serviceIds: string | string[],
  ): Promise<CentralSocketResponse<{ subscriptions: string[] }>> {
    return this.socket.serviceSubscribePreview(serviceIds);
  }

  async serviceUnsubscribePreview(
    serviceIds?: string | string[],
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.serviceUnsubscribePreview(serviceIds);
  }

  serviceOnUpdate(
    callback: (service: Partial<CentralService>) => void,
  ): SocketEventOff {
    return this.socket.serviceOnUpdate(callback);
  }

  serviceOnUpdateStatus(
    callback: (serviceStatus: Partial<CentralServiceStatus>) => void,
  ): SocketEventOff {
    return this.socket.serviceOnUpdateStatus(callback);
  }

  serviceOnUpdatePreview(
    callback: (preview: string, serviceId: string) => void,
  ): SocketEventOff {
    return this.socket.serviceOnUpdatePreview(callback);
  }

  serviceOnUpdateVu(
    callback: (volumes: number[], serviceId: string) => void,
  ): SocketEventOff {
    return this.socket.serviceOnUpdateVu(callback);
  }

  serviceOnToggleRunning(
    callback: (args: { id: string; action: ToggleRunningAction }) => void,
  ): SocketEventOff {
    return this.socket.serviceOnToggleRunning(callback);
  }

  async groupCreate(
    group: Partial<CentralGroup>,
  ): Promise<CentralHttpResponse<{ group: CentralGroup }>> {
    return this.http.groupCreate(group);
  }

  async groupUpdate(
    group: Partial<CentralGroup>,
  ): Promise<CentralHttpResponse<{ group: CentralGroup }>> {
    return this.http.groupUpdate(group);
  }

  async groupUpdateDevices(
    groupId: string,
    deviceIds: string[],
  ): Promise<CentralHttpResponse<null>> {
    return this.http.groupUpdateDevices(groupId, deviceIds);
  }

  async groupAddUser(
    groupId: string,
    email: string,
  ): Promise<CentralHttpResponse<{ userId: string }>> {
    return this.http.groupAddUser(groupId, email);
  }

  async groupRemoveUser(
    groupId: string,
    userId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.groupRemoveUser(groupId, userId);
  }

  async groupGetUserDevices(
    groupId: string,
    userId: string,
  ): Promise<
    CentralHttpResponse<{
      devices: { id: string; roleId: string }[];
    }>
  > {
    return this.http.groupGetUserDevices(groupId, userId);
  }

  async groupUpdateUserDevices(
    groupId: string,
    userId: string,
    devices: { id: string; roleId: string }[],
  ): Promise<CentralHttpResponse<null>> {
    return this.http.groupUpdateUserDevices(groupId, userId, devices);
  }

  async groupDelete(groupId: string): Promise<CentralHttpResponse<null>> {
    return this.http.groupDelete(groupId);
  }

  groupOnUpdate(
    callback: (group: Partial<CentralGroup>) => void,
  ): SocketEventOff {
    return this.socket.groupOnUpdate(callback);
  }
}
