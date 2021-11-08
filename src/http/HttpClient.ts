import axios, { Axios, AxiosResponse } from 'axios';
import { CentralDeviceWithStatus, CentralServiceWithStatus } from 'index';

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

  onUnauthorized(handler: () => void): number {
    return this.axios.interceptors.response.use(
      config => config,
      error => {
        const { status, statusText, data } = error.response || {
          status: 500,
          statusText: error.errno,
        };
        if (status === 401) {
          handler();
        }
        return Promise.reject({
          success: false,
          response: { status, statusText, data },
        });
      },
    );
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

  async authRequestVerificationCode(): Promise<CentralHttpResponse<null>> {
    return this.axios
      .get<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        '/auth/verification-code',
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }

  async authSubmitVerificationCode(
    code: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .post<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        '/auth/verification-code',
        { code },
      )
      .then(r => ({ success: true, message: r.data.message }))
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
      .post<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        '/auth/change-password',
        { oldPassword, newPassword },
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }

  async userRegister(
    user: Partial<CentralUser> & { password: string; captchaToken: string },
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .post<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        '/user/register',
        { ...user },
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios
      .get<unknown, AxiosResponse<CentralHttpResponse<{ user: CentralUser }>>>(
        '/user/me',
      )
      .then(r => ({ success: true, data: { user: r.data.data.user } }))
      .catch(e => e);
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<
          CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
        >
      >('/user/me/devices')
      .then(r => ({
        success: true,
        message: r.data.message,
        data: { devices: r.data.data.devices },
      }))
      .catch(e => e);
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
  > {
    return this.axios
      .get<
        unknown,
        AxiosResponse<
          CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
        >
      >('/user/me/services')
      .then(r => ({
        success: true,
        message: r.data.message,
        data: { services: r.data.data.services },
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
        message: r.data.message,
        data: { device: r.data.data.device },
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
        message: r.data.message,
        data: { services: r.data.data.services },
      }))
      .catch(e => e);
  }

  async serviceUpdate(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios
      .patch<unknown, AxiosResponse<CentralHttpResponse<null>>>(
        `/service/${service.id}`,
        { service },
      )
      .then(r => ({ success: true, message: r.data.message }))
      .catch(e => e);
  }
}
