import axios, { Axios, AxiosResponse } from 'axios';

import {
  AuthInfo,
  CentralDevice,
  CentralHttpResponse,
  CentralService,
  CentralUser,
  HttpClientOptions,
} from './typings';

export default class HttpClient {
  private port: number;

  private host: string;

  private prefix: string;

  private axios: Axios;

  private _authenticated: boolean;

  constructor(options: HttpClientOptions) {
    this.port = options.port;
    this.host = options.host || 'localhost';
    this.prefix = options.prefix || '';
    this.setup();
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  private setup(): void {
    const url = `http://${this.host}:${this.port}${this.prefix}`;
    this.axios = axios.create({
      baseURL: url,
      headers: { 'Content-Type': 'application/json' },
    });
    this.axios.interceptors.response.use(
      config => config,
      error => {
        const { status, statusText, data } = error.response || {
          status: 500,
          statusText: error.errno,
        };
        return Promise.reject({
          success: false,
          response: { status, statusText, data },
        });
      },
    );
  }

  async authLogin(
    key: string,
    password: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    return this.axios
      .post<unknown, AxiosResponse<CentralHttpResponse<AuthInfo>>>(
        '/auth/login',
        { key, password },
      )
      .then(r => {
        this.axios.defaults.headers.Authorization = `Bearer ${r.data.data.token}`;
        this._authenticated = true;
        return { success: true, data: r.data.data };
      })
      .catch(e => e);
  }

  async authRefreshToken(
    refreshToken: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    return this.axios
      .post<unknown, AxiosResponse<CentralHttpResponse<AuthInfo>>>(
        '/auth/refresh-token',
        { refreshToken },
      )
      .then(r => {
        this.axios.defaults.headers.Authorization = `Bearer ${r.data.data.token}`;
        this._authenticated = true;
        return { success: true, data: r.data.data };
      })
      .catch(e => e);
  }

  async authChangePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .post<unknown, AxiosResponse<CentralHttpResponse<AuthInfo>>>(
        '/auth/change-password',
        { oldPassword, newPassword },
      )
      .then(() => ({ success: true }))
      .catch(e => e);
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios
      .get<unknown, AxiosResponse<CentralHttpResponse<{ user: CentralUser }>>>(
        '/user/me',
      )
      .then(r => ({ success: true, user: r.data.data.user }))
      .catch(e => e);
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDevice[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ devices: CentralDevice[] }>>
      >('/user/me/devices')
      .then(r => ({ success: true, devices: r.data.data.devices }))
      .catch(e => e);
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ services: CentralService[] }>>
      >('/user/me/services')
      .then(r => ({ success: true, services: r.data.data.services }))
      .catch(e => e);
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ device: CentralDevice }>>
      >('/device/me')
      .then(r => ({ success: true, device: r.data.data.device }))
      .catch(e => e);
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ services: CentralService[] }>>
      >('/user/me/services')
      .then(r => ({ success: true, services: r.data.data.services }))
      .catch(e => e);
  }

  async serviceLink(
    sourceId: string,
    targetId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .get<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        `/service/${sourceId}/link/${targetId}`,
      )
      .then(r => ({ success: true }))
      .catch(e => e);
  }
}
