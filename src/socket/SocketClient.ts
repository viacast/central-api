import {
  CentralDeviceStatus,
  CentralService,
  CentralServiceStatus,
} from 'index';
import io, { Socket } from 'socket.io-client';

import { CentralDevice, CentralServiceOperationMode } from '../typings';
import { promisify } from '../utils';

import { CentralSocketResponse, SocketClientOptions } from './typings';

export enum DeviceSocketEvents {
  GET_INFO = 'device-get-info',
  UPDATE_STATUS = 'device-update-status',
  UPDATE_SERVICE_OPERATION_MODES = 'device-update-service-operation-modes',
  UPDATE_SERVICE_STATUS = 'device-update-service-status',
  UPDATE_CONFIG = 'device-service-update-config',
  DEVICE_UPDATED = 'device-updated',
  SERVICE_UPDATED = 'device-service-updated',
  STATUS_UPDATED = 'device-status-updated',
  SERVICE_STATUS_UPDATED = 'device-service-status-updated',
}

export default class SocketClient {
  private port: number;

  private host: string;

  private path: string;

  private timeout: number;

  private locale: string;

  private https: boolean;

  private token: string;

  private io: Socket;

  private eventHandlers: { event: string; handler: (data: unknown) => void }[];

  constructor(options: SocketClientOptions) {
    this.port = options.port;
    this.host = options.host;
    this.path = options.path;
    this.timeout = options.timeout || 3000;
    this.locale = options.locale || 'en';
    this.https = options.https || false;
    this.token = options.token;
    this.eventHandlers = [];
  }

  setLocale(locale: string): void {
    this.locale = locale;
    if (this.connected) {
      this.asyncEmit('update-locale', { locale: this.locale });
    }
  }

  setToken(token: string): void {
    this.token = token;
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

  connect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    this.io?.disconnect();
    const url = `${this.https ? 'https' : 'http'}://${this.host}:${this.port}`;
    this.io = io(url, {
      path: this.path,
      timeout: this.timeout,
      transports: ['websocket'],
      auth: {
        token: this.token,
        locale: this.locale,
      },
    });
    this.io.on('connect', () => {
      this.eventHandlers.forEach(({ event, handler }) =>
        this.io.on(event, handler),
      );
      this.eventHandlers = [];
      onConnect?.();
    });
    this.io.on('connect_error', onConnectError);
  }

  tryConnect(
    onConnect?: () => void,
    onConnectError?: (error: Error) => void,
  ): void {
    if (!this.connected) {
      this.connect(onConnect, onConnectError);
    }
  }

  async deviceGetInfo(): Promise<CentralSocketResponse<CentralDevice>> {
    return this.asyncEmit<CentralDevice>(DeviceSocketEvents.GET_INFO);
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(DeviceSocketEvents.UPDATE_STATUS, {
      status,
    });
  }

  async deviceUpdateServiceStatus(
    status: CentralServiceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(DeviceSocketEvents.UPDATE_SERVICE_STATUS, {
      status,
    });
  }

  async deviceUpdateServiceOperationModes(
    operationModes: CentralServiceOperationMode[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(
      DeviceSocketEvents.UPDATE_SERVICE_OPERATION_MODES,
      { operationModes },
    );
  }

  deviceOnStatusUpdated(callback: (status: CentralDeviceStatus) => void): void {
    this.on(DeviceSocketEvents.STATUS_UPDATED, callback);
  }

  deviceOnServiceStatusUpdated(
    callback: (status: CentralServiceStatus) => void,
  ): void {
    this.on(DeviceSocketEvents.SERVICE_STATUS_UPDATED, callback);
  }

  deviceOnUpdate(callback: (device: Partial<CentralDevice>) => void): void {
    this.on(DeviceSocketEvents.DEVICE_UPDATED, callback);
  }

  deviceOnUpdateConfig(
    callback: (info: { serviceName: string; config: string }) => void,
  ): void {
    this.on(DeviceSocketEvents.UPDATE_CONFIG, callback);
  }

  serviceOnUpdate(callback: (service: Partial<CentralService>) => void): void {
    this.on(DeviceSocketEvents.SERVICE_UPDATED, callback);
  }
}
