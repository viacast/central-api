import {
  CentralDeviceStatus,
  CentralService,
  CentralServiceStatus,
} from 'index';
import io, { Socket } from 'socket.io-client';

import { CentralDevice, CentralServiceOperationMode } from '../typings';
import { promisify } from '../utils';

import { CentralSocketResponse, SocketClientOptions } from './typings';

export enum SocketEvents {
  UPDATE_DEVICE_STATUS = 'update-device-status',
  DEVICE_UPDATED = 'device-updated',
  DEVICE_STATUS_UPDATED = 'device-status-updated',
  UPDATE_SERVICE_STATUS = 'update-service-status',
  SERVICE_UPDATED = 'service-updated',
  SERVICE_STATUS_UPDATED = 'service-status-updated',
  DEVICE_REQUEST_OWNERSHIP = 'device-request-ownership',
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
    if (this.connected) {
      this.io.on(event, handler);
    }
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
      this.eventHandlers.forEach(({ event, handler }) => {
        this.io.off(event, handler);
        this.io.on(event, handler);
      });
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

  disconnect(): void {
    if (this.connected) {
      this.io.disconnect();
    }
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvents.UPDATE_DEVICE_STATUS, {
      status,
    });
  }

  async deviceUpdateServiceStatus(
    status: CentralServiceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvents.UPDATE_SERVICE_STATUS, {
      status,
    });
  }

  deviceOnUpdate(
    callback: (args: {
      device: Partial<CentralDevice>;
      updatedFields: Record<string, boolean>;
    }) => void,
  ): void {
    this.on(SocketEvents.DEVICE_UPDATED, callback);
  }

  deviceOnUpdateStatus(
    callback: (deviceStatus: Partial<CentralDeviceStatus>) => void,
  ): void {
    this.on(
      SocketEvents.DEVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralDeviceStatus> }) => callback(r.status),
    );
  }

  deviceOnRequestOwnership(
    callback: (code: { code: string; expiration: number }) => void,
  ): void {
    this.on(
      SocketEvents.DEVICE_REQUEST_OWNERSHIP,
      (r: { code: { code: string; expiration: number } }) => callback(r.code),
    );
  }

  serviceOnUpdate(
    callback: (args: {
      service: Partial<CentralService>;
      updatedFields: Record<string, boolean>;
    }) => void,
  ): void {
    this.on(SocketEvents.SERVICE_UPDATED, callback);
  }

  serviceOnUpdateStatus(
    callback: (serviceStatus: Partial<CentralServiceStatus>) => void,
  ): void {
    this.on(
      SocketEvents.SERVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralServiceStatus> }) => callback(r.status),
    );
  }
}
