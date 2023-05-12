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
  CentralDeviceAuditReport,
  CentralDeviceStatistics,
  IperfResult,
  IperfNormalizedResult,
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

  async deviceRequestIperf(
    device: Partial<CentralDevice>,
    serialRemote?: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.deviceRequestIperf(device, serialRemote);
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

  async deviceUpdateStatistics(
    deviceId: string,
    statistics: CentralDeviceStatistics,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateStatistics(deviceId, statistics);
  }

  async deviceUpdateIperf(
    deviceId: string,
    iperfNormalizedResponse: IperfNormalizedResult,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateIperf(deviceId, iperfNormalizedResponse);
  }

  async deviceSubscribeStatistics(
    deviceIds: string | string[],
  ): Promise<CentralSocketResponse<{ subscriptions: string[] }>> {
    return this.socket.deviceSubscribeStatistics(deviceIds);
  }

  async deviceUnsubscribeStatistics(
    deviceIds?: string | string[],
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUnsubscribeStatistics(deviceIds);
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.socket.deviceUpdateStatus(status);
  }

  async deviceRefreshClient(id: string): Promise<CentralHttpResponse<null>> {
    return this.http.deviceRefreshClient(id);
  }

  async deviceResetPassword(
    id: string,
  ): Promise<CentralHttpResponse<{ newPassword: string }>> {
    return this.http.deviceResetPassword(id);
  }

  async deviceTransferOwnership(
    id: string,
    recipientEmail: string,
  ): Promise<CentralHttpResponse<{ recipient: Partial<CentralUser> }>> {
    return this.http.deviceTransferOwnership(id, recipientEmail);
  }

  deviceOnUpdate(
    callback: (device: Partial<CentralDevice>) => void,
  ): SocketEventOff {
    return this.socket.deviceOnUpdate(callback);
  }

  deviceOnUpdateStatistics(
    callback: (statistics: CentralDeviceStatistics, deviceId: string) => void,
  ): SocketEventOff {
    return this.socket.deviceOnUpdateStatistics(callback);
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

  deviceOnRequestIperf(
    callback: (iperf: { server: boolean; ipAdress?: string }) => void,
  ): SocketEventOff {
    return this.socket.deviceOnRequestIperf(callback);
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
    targetServiceId?: string,
  ): Promise<CentralHttpResponse<{ service: CentralService }>> {
    return this.http.serviceUpdate(service, targetServiceId);
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

  deviceOnUpdateIperf(
    callback: (iperfNormalizedResponse: IperfNormalizedResult) => void,
  ): SocketEventOff {
    return this.socket.deviceOnUpdateIperf(callback);
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

  async groupAddUsers(
    groupId: string,
    emails: string[],
    roleId?: string,
  ): Promise<CentralHttpResponse<{ addedUsers: Partial<CentralUser>[] }>> {
    return this.http.groupAddUsers(groupId, emails, roleId);
  }

  async groupRemoveUser(
    groupId: string,
    userId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.groupRemoveUser(groupId, userId);
  }

  async groupUpdateUserRole(
    groupId: string,
    userId: string,
    roleId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.http.groupUpdateUserRole(groupId, userId, roleId);
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

  async deviceAuditGetDeviceReports(
    options: {
      page: number;
      reportsPerPage: number;
      filter?: string;
    },
    signal?: AbortSignal,
  ): Promise<
    CentralHttpResponse<{
      deviceAuditReports: CentralDeviceAuditReport[];
      totalCount: number;
    }>
  > {
    return this.http.deviceAuditGetDeviceReports(options, signal).then(r => ({
      ...r,
      data: {
        ...r.data,
        deviceAuditReports: r.data?.deviceAuditReports?.map(rr => ({
          ...rr,
          when: new Date(rr.when),
        })),
      },
    }));
  }
}
