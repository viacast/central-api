import io, { Socket } from 'socket.io-client';

import { CentralDevice } from '../typings';
import { promisify } from '../utils';

import {
  CentralSocketResponse,
  SocketClientOptions,
  CentralServiceOperationModeType,
} from './typings';

enum SocketEventsToDevice {
  UPDATE_CONFIG = 'device-service-update-config',
}

enum SocketEventsFromDevice {
  GET_INFO = 'device-get-info',
  UPDATE_STATUS = 'device-update-status',
  UPDATE_SERVICE_OPERATION_MODES = 'device-update-service-operation-modes',
}

export default class SocketClient {
  private port: number;

  private host: string;

  private path: string;

  private timeout: number;

  private https: boolean;

  private authToken: string;

  private io: Socket;

  private eventHandlers: { event: string; handler: (data: unknown) => void }[];

  constructor(options: SocketClientOptions) {
    this.port = options.port;
    this.host = options.host;
    this.path = options.path;
    this.timeout = options.timeout || 3000;
    this.https = options.https || false;
    this.authToken = options.authToken;
    this.eventHandlers = [];
  }

  private asyncEmit<ResponseType>(
    event: string,
    data?: unknown,
  ): Promise<CentralSocketResponse<ResponseType>> {
    const { promise, resolve, reject } =
      promisify<CentralSocketResponse<ResponseType>>();
    if (!this.connected) {
      reject(new Error('socket not connected'));
    } else {
      this.io.emit(event, data, resolve);
    }
    return promise;
  }

  private on(event: string, handler: (data: unknown) => void): void {
    this.eventHandlers.push({ event, handler });
  }

  get connected(): boolean {
    return this.io?.connected || false;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  connect(onConnect: () => void, onConnectError: (error: Error) => void): void {
    this.io?.disconnect();
    const url = `${this.https ? 'https' : 'http'}://${this.host}:${this.port}`;
    this.io = io(url, {
      path: this.path,
      timeout: this.timeout,
      transports: ['websocket'],
      auth: {
        token: this.authToken,
      },
    });
    this.io.on('connect', () => {
      this.eventHandlers.forEach(({ event, handler }) =>
        this.io.on(event, handler),
      );
      onConnect();
    });
    this.io.on('connect_error', onConnectError);
  }

  async deviceGetInfo(): Promise<CentralSocketResponse<CentralDevice>> {
    return this.asyncEmit<CentralDevice>(SocketEventsFromDevice.GET_INFO);
  }

  async deviceUpdateStatus(
    status: Record<string, unknown>,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEventsFromDevice.UPDATE_STATUS, status);
  }

  async deviceUpdateServiceOperationModes(
    operationModes: CentralServiceOperationModeType[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(
      SocketEventsFromDevice.UPDATE_SERVICE_OPERATION_MODES,
      operationModes,
    );
  }

  deviceOnUpdateConfig(
    callback: (info: { serviceName: string; config: string }) => void,
  ): void {
    this.on(SocketEventsToDevice.UPDATE_CONFIG, callback);
  }
}
