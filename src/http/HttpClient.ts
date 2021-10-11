import axios, { Axios, AxiosResponse } from 'axios';

import {
  AuthInfo,
  CentralDevice,
  CentralService,
  CentralUser,
} from '../typings';
import { CentralHttpResponse, HttpClientOptions } from './typings';

export default class HttpClient {
  private port: number;

  private host: string;

  private prefix: string;

  private https: boolean;

  private axios: Axios;

  private _authenticated: boolean;

  constructor(options: HttpClientOptions) {
    this.port = options.port;
    this.host = options.host || 'localhost';
    this.prefix = options.prefix || '';
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
        return { success: true, data: r.data.data, message: r.data.message };
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
        return { success: true, data: r.data.data, message: r.data.message };
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
      .then(r => ({ success: true, message: r.data.message }))
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
      .then(r => ({
        success: true,
        devices: r.data.data.devices,
        message: r.data.message,
      }))
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
      .then(r => ({
        success: true,
        services: r.data.data.services,
        message: r.data.message,
      }))
      .catch(e => e);
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ device: CentralDevice }>>
      >('/device/me')
      .then(r => ({
        success: true,
        device: r.data.data.device,
        message: r.data.message,
      }))
      .catch(e => e);
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<CentralHttpResponse<{ services: CentralService[] }>>
      >('/device/me/services')
      .then(r => ({
        success: true,
        services: r.data.data.services,
        message: r.data.message,
      }))
      .catch(e => e);
  }

  async serviceLink(
    sourceId: string,
    targetId: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .put<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        `/service/${sourceId}/linked-service`,
        { targetId },
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }

  async serviceUpdateConfig(
    id: string,
    config: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .put<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        `/service/${id}/config`,
        { config },
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }
}
