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
import { CentralSocketResponse } from './socket/typings';

export default class CentralApi {
  private http: HttpClient;

  private socket: SocketClient;

  constructor(
    options: CentralApiOptions = {
      port: 4440,
      host: 'localhost',
      prefix: '/v1',
      https: false,
    },
  ) {
    const { port, host, prefix, https } = options;
    this.http = new HttpClient({ port, host, prefix, https });
    this.socket = new SocketClient({
      port,
      host,
      path: `${prefix}/socket.io`,
      https,
    });
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
      this.socket.setAuthToken(r.data.token);
    }
    return r;
  }

  async authRefreshToken(
    refreshToken: string,
  ): Promise<CentralHttpResponse<AuthInfo>> {
    const r = await this.http.authRefreshToken(refreshToken);
    if (r.success) {
      this.socket.setAuthToken(r.data.token);
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

  deviceOnUpdateConfig(
    callback: (info: { serviceName: string; config: string }) => void,
  ): void {
    return this.socket.deviceOnUpdateConfig(callback);
  }
}
