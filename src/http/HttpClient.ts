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
      ({
        data: { success, message, data },
      }: AxiosResponse<CentralHttpResponse<unknown>>) => ({
        success,
        message,
        data,
      }),
      error => {
        const { status, statusText, data } = error.response || {
          status: 500,
          statusText: error.errno,
        };
        return {
          success: false,
          message: data?.message,
          response: { status, statusText, data },
        };
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
          message: data?.message,
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
      .post<unknown, CentralHttpResponse<AuthInfo>>('/auth/login', {
        key,
        password,
      })
      .then(r => {
        this.axios.defaults.headers.Authorization = `Bearer ${r.data.token}`;
        this._authenticated = true;
        return r;
      });
  }

  async authRequestVerificationCode(): Promise<CentralHttpResponse<null>> {
    return this.axios.get<unknown, CentralHttpResponse<null>>(
      '/auth/verification-code',
    );
  }

  async authSubmitVerificationCode(
    code: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post<unknown, CentralHttpResponse<null>>(
      '/auth/verification-code',
      {
        code,
      },
    );
  }

  async authRefreshToken(
    refreshToken: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    return this.axios
      .post<unknown, CentralHttpResponse<AuthInfo>>('/auth/refresh-token', {
        refreshToken,
      })
      .then(r => {
        this.axios.defaults.headers.Authorization = `Bearer ${r.data.token}`;
        this._authenticated = true;
        return r;
      });
  }

  async authChangePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post<unknown, CentralHttpResponse<null>>(
      '/auth/change-password',
      {
        oldPassword,
        newPassword,
      },
    );
  }

  async userRegister(
    user: Partial<CentralUser> & { password: string; captchaToken: string },
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post<unknown, CentralHttpResponse<null>>(
      '/user/register',
      { ...user },
    );
  }

  async userMe(): Promise<CentralHttpResponse<{ user: CentralUser }>> {
    return this.axios.get<unknown, CentralHttpResponse<{ user: CentralUser }>>(
      '/user/me',
    );
  }

  async userMyDevices(): Promise<
    CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
  > {
    return this.axios.get<
      unknown,
      CentralHttpResponse<{ devices: CentralDeviceWithStatus[] }>
    >('/user/me/devices');
  }

  async userMyServices(): Promise<
    CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
  > {
    return this.axios.get<
      unknown,
      CentralHttpResponse<{ services: CentralServiceWithStatus[] }>
    >('/user/me/services');
  }

  async deviceRegister(
    device: Partial<CentralDevice> & { key: string },
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post<unknown, CentralHttpResponse<null>>(
      '/device/register',
      {
        ...device,
      },
    );
  }

  async deviceMe(): Promise<CentralHttpResponse<{ device: CentralDevice }>> {
    return this.axios.get<
      unknown,
      CentralHttpResponse<{ device: CentralDevice }>
    >('/device/me');
  }

  async deviceMyServices(): Promise<
    CentralHttpResponse<{ services: CentralService[] }>
  > {
    return this.axios.get<
      unknown,
      CentralHttpResponse<{ services: CentralService[] }>
    >('/device/me/services');
  }

  async deviceKeygen(
    serial: string,
    forceNew: boolean,
  ): Promise<CentralHttpResponse<{ serial: string; key: string }>> {
    return this.axios.post<
      unknown,
      CentralHttpResponse<{ serial: string; key: string }>
    >('/device/keygen', { serial, forceNew });
  }

  async deviceRequestOwnership(
    serial: string,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.post<unknown, CentralHttpResponse<null>>(
      '/device/request-ownership',
      { serial },
    );
  }

  async deviceSubmitOwnershipCode(
    serial: string,
    code: string,
    takeOwnership: boolean,
  ): Promise<CentralHttpResponse<{ device: CentralDevice } | null>> {
    return this.axios.post<
      unknown,
      CentralHttpResponse<{ device: CentralDevice } | null>
    >('/device/submit-ownership-code', { serial, code, takeOwnership });
  }

  async serviceUpdate(
    service: Partial<CentralService>,
  ): Promise<CentralHttpResponse<null>> {
    return this.axios.patch<unknown, CentralHttpResponse<null>>(
      `/service/${service.id}`,
      {
        service,
      },
    );
  }
}
