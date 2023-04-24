import axios, { Axios, AxiosResponse } from 'axios';
import {
  CentralDeviceWithStatus,
  CentralServiceWithStatus,
  ToggleRunningAction,
} from 'index';

import {
  AuthInfo,
  CentralDevice,
  CentralDeviceAuditReport,
  CentralGroup,
  CentralService,
  CentralStream,
  CentralUser,
} from '../typings';
import { CentralHttpResponse, HttpClientOptions } from './typings';

export default class HttpClient {
  private port: number;

  private host: string;

  private prefix: string;

  private timeout: number;

  private locale: string;

  private https: boolean;

  private axios: Axios;

  private _authenticated: boolean;

  constructor(options: HttpClientOptions) {
    this.port = options.port;
    this.host = options.host || 'localhost';
    this.prefix = options.prefix || '';
    this.timeout = options.timeout || 3000;
    this.locale = options.locale || 'en';
    this.https = options.https || false;
    this.setup();
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  private setup(): void {
    const url = `${this.https ? 'https' : 'http'}://${this.host}:${this.port}${
      this.prefix
    }`;
    this.axios = axios.create({
      timeout: this.timeout,
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.locale,
      },
    });
    this.axios.interceptors.response.use(
      ({
        data: { success, message, data },
      }: AxiosResponse<CentralHttpResponse<unknown>>) => ({
        success,
        message,
        data,
      }),
      error => {
        const { status, statusText, data } = error.response || {
          status: 408,
          statusText: 'request timeout',
          data: { message: 'requestTimeout' },
        };
        return {
          success: false,
          message: data?.message,
          response: { status, statusText, data },
        };
      },
    );
  }

  onUnauthorized(
    handler: (response: CentralHttpResponse<unknown>) => void,
  ): number {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.axios.interceptors.response.use((config: any) => {
      if (!config.success && config.response.status === 401) {
        handler(config);
      }
      return config;
    });
  }

  ejectOnUnauthorized(useHandle: number): void {
    this.axios.interceptors.response.eject(useHandle);
  }

  setLocale(locale: string): void {
    this.axios.defaults.headers['Accept-Language'] = locale;
  }

  setToken(token: string): void {
    this.axios.defaults.headers.Authorization = `Bearer ${token}`;
  }

  async authLogin(
    key: string,
    password: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    return this.axios
      .post<unknown, CentralHttpResponse<AuthInfo>>('/auth/login', {
        key,
        password,
      })
      .then(r => {
        if (r.success) {
          this.axios.defaults.headers.Authorization = `Bearer ${r.data.token}`;
          this._authenticated = true;
        }
        return r;
      });
  }

  async authRequestVerificationCode(): Promise<CentralHttpResponse<null>> {
    return this.axios.get('/auth/verification-code');
  }

  async authSubmitVerificationCode(
    code: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post('/auth/verification-code', {
      code,
    });
  }

  async authRefreshToken(
    refreshToken: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    return this.axios
      .post<unknown, CentralHttpResponse<AuthInfo>>('/auth/refresh-token', {
        refreshToken,
      })
      .then(r => {
        if (r.success) {
          this.axios.defaults.headers.Authorization = `Bearer ${r.data.token}`;
          this._authenticated = true;
        }
        return r;
      });
  }

  async authChangePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  async userRegister(
    user: Partial<CentralUser> & { password: string; captchaToken: string },
  ): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios.post('/user/register', { ...user });
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios.get('/user/me');
  }

  async userUpdateMe(
    user: Partial<CentralUser>,
  ): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios.patch('/user/me', { ...user });
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
  > {
    return this.axios.get('/user/me/devices');
  }

  async userMyStreams(): Promise<
    CentralHttpResponse<{ streams: CentralStream[] }>
  > {
    return this.axios.get('/user/me/streams');
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
  > {
    return this.axios.get('/user/me/services');
  }

  async userMyGroups(): Promise<
    CentralHttpResponse<{ groups: CentralGroup[] }>
  > {
    return this.axios.get('/user/me/groups');
  }

  async deviceRegister(
    device: Partial<CentralDevice> & { key: string },
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios.post('/device/register', {
      ...device,
    });
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios.get('/device/me');
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.axios.get('/device/me/services');
  }

  async deviceUpdateMe(
    device: Partial<CentralDevice>,
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios.patch(`/device/me`, {
      ...device,
    });
  }

  async deviceUpdate(
    device: Partial<CentralDevice>,
  ): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios.patch(`/device/${device.id}`, {
      ...device,
    });
  }

  async deviceKeygen(
    serial: string,
    forceNew: boolean,
  ): Promise<CentralHttpResponse<{ serial: string; key: string }>> {
    return this.axios.post('/device/keygen', { serial, forceNew });
  }

  async deviceRequestOwnership(
    serial: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post('/device/request-ownership', { serial });
  }

  async deviceSubmitOwnershipCode(
    serial: string,
    code: string,
    takeOwnership: boolean,
  ): Promise<CentralHttpResponse<{ device: CentralDevice } | null>> {
    return this.axios.post('/device/submit-ownership-code', {
      serial,
      code,
      takeOwnership,
    });
  }

  async deviceRefreshClient(id: string): Promise<CentralHttpResponse<null>> {
    return this.axios.patch(`/device/${id}/refresh-client`);
  }

  async deviceResetPassword(
    id: string,
  ): Promise<CentralHttpResponse<{ newPassword: string }>> {
    return this.axios.patch(`/device/${id}/reset-password`);
  }

  async deviceDelete(id: string): Promise<CentralHttpResponse<null>> {
    return this.axios.delete(`/device/${id}`);
  }

  async deviceTransferOwnership(
    id: string,
    recipientEmail: string,
  ): Promise<CentralHttpResponse<{ recipient: Partial<CentralUser> }>> {
    return this.axios.patch(`/device/${id}/transfer-ownership`, {
      recipientEmail,
    });
  }

  async serviceRegister(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<{ service: CentralService }>> {
    return this.axios.post(`/service/register`, {
      ...service,
    });
  }

  async serviceUpdate(
    service: Partial<CentralService>,
    targetServiceId?: string,
  ): Promise<CentralHttpResponse<{ service: CentralService }>> {
    return this.axios.patch(`/service/${service.id}`, {
      ...service,
      targetServiceId,
    });
  }

  async serviceToggleRunning(
    id: string,
    action: ToggleRunningAction,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.patch(`/service/${id}/running`, { action });
  }

  async groupCreate(
    group: Partial<CentralGroup>,
  ): Promise<CentralHttpResponse<{ group: CentralGroup }>> {
    return this.axios.post(`/group/create`, { ...group });
  }

  async groupUpdate(
    group: Partial<CentralGroup>,
  ): Promise<CentralHttpResponse<{ group: CentralGroup }>> {
    return this.axios.patch(`/group/${group.id}`, { ...group });
  }

  async groupUpdateDevices(
    groupId: string,
    deviceIds: string[],
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.patch(`/group/${groupId}/devices`, { deviceIds });
  }

  async groupAddUsers(
    groupId: string,
    emails: string[],
    roleId?: string,
  ): Promise<CentralHttpResponse<{ addedUsers: Partial<CentralUser>[] }>> {
    return this.axios.post(`/group/${groupId}/user`, {
      emails,
      roleId: roleId || undefined,
    });
  }

  async groupRemoveUser(
    groupId: string,
    userId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.delete(`/group/${groupId}/user/${userId}`);
  }

  async groupUpdateUserRole(
    groupId: string,
    userId: string,
    roleId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.patch(`/group/${groupId}/user/${userId}`, { roleId });
  }

  async groupGetUserDevices(
    groupId: string,
    userId: string,
  ): Promise<
    CentralHttpResponse<{
      devices: { id: string; roleId: string }[];
    }>
  > {
    return this.axios.get(`/group/${groupId}/user/${userId}/devices`);
  }

  async groupUpdateUserDevices(
    groupId: string,
    userId: string,
    devices: { id: string; roleId: string }[],
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.patch(`/group/${groupId}/user/${userId}/devices`, {
      devices,
    });
  }

  async groupDelete(groupId: string): Promise<CentralHttpResponse<null>> {
    return this.axios.delete(`/group/${groupId}`);
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
    return this.axios.get(`/device-audit-report`, {
      params: options,
      signal,
    });
  }
}
