import Emittery = require('emittery');
import {
  CentralDeviceStatus,
  CentralService,
  CentralServiceStatus,
  ToggleRunningAction,
} from 'index';
import io, { Socket } from 'socket.io-client';

import { CentralDevice, CentralGroup, CentralUser } from '../typings';
import { promisify } from '../utils';

import {
  CentralSocketResponse,
  SocketClientOptions,
  SocketEvent,
} from './typings';

export type SocketEventOff = () => void;

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

  private emitter: Emittery;

  constructor(options: SocketClientOptions) {
    this.port = options.port;
    this.host = options.host || 'localhost';
    this.path = options.path || '/socket.io';
    this.timeout = options.timeout || 3000;
    this.locale = options.locale || 'en';
    this.https = options.https || false;
    this.token = options.token;
    this.eventHandlers = [];
    this.emitter = new Emittery();
  }

  setLocale(locale: string): void {
    this.locale = locale;
    if (this.connected) {
      // this.asyncEmit('update-locale', { locale: this.locale });
    }
  }

  setToken(token: string): void {
    this.token = token;
  }

  private asyncEmit<ResponseType>(
    event: SocketEvent,
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

  private on(
    event: string,
    handler: (data: unknown) => void,
    exclusive = true,
  ): SocketEventOff {
    if (this.connected) {
      if (exclusive) {
        this.io.off(event);
      }
      this.io.on(event, handler);
    }
    this.eventHandlers.push({ event, handler });
    return () => this.io.off(event, handler);
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
      this.emitter.emit('connected');
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

  waitConnected(howLong?: number): Promise<void> {
    const { promise, resolve, reject } = promisify<void>();
    if (this.connected) {
      resolve();
      return promise;
    }
    if (howLong === undefined) {
      return this.emitter.once('connected');
    }
    const timeout = setTimeout(() => {
      reject('timeout');
    }, howLong);
    this.emitter.once('connected').then(() => {
      clearTimeout(timeout);
      resolve();
    });
    return promise;
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.DEVICE_UPDATE_STATUS, {
      status,
    });
  }

  deviceOnUpdate(
    callback: (device: Partial<CentralDevice>) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.DEVICE_UPDATED,
      (r: { device: Partial<CentralDevice> }) => callback(r.device),
    );
  }

  deviceOnUpdateStatus(
    callback: (deviceStatus: Partial<CentralDeviceStatus>) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.DEVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralDeviceStatus> }) => callback(r.status),
    );
  }

  deviceOnRequestOwnership(
    callback: (code: { code: string; expiration: number }) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.DEVICE_REQUEST_OWNERSHIP,
      (r: { code: { code: string; expiration: number } }) => callback(r.code),
    );
  }

  async serviceUpdateStatus(
    status: CentralServiceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.SERVICE_UPDATE_STATUS, {
      status,
    });
  }

  async serviceUpdatePreview(
    serviceId: string,
    preview: string,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.SERVICE_UPDATE_PREVIEW, {
      serviceId,
      preview,
    });
  }

  async serviceUpdateVu(
    serviceId: string,
    volumes: number[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.SERVICE_UPDATE_VU, {
      serviceId,
      volumes,
    });
  }

  async serviceSubscribePreview(
    serviceIds: string | string[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.SERVICE_SUBSCRIBE_PREVIEW, {
      serviceIds,
    });
  }

  async serviceUnsubscribePreview(
    serviceIds?: string | string[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.SERVICE_UNSUBSCRIBE_PREVIEW, {
      serviceIds,
    });
  }

  serviceOnUpdate(
    callback: (service: Partial<CentralService>) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.SERVICE_UPDATED,
      (r: { service: Partial<CentralService> }) => callback(r.service),
    );
  }

  serviceOnUpdateStatus(
    callback: (serviceStatus: Partial<CentralServiceStatus>) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.SERVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralServiceStatus> }) => callback(r.status),
    );
  }

  serviceOnUpdatePreview(
    callback: (preview: string, serviceId: string) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.SERVICE_PREVIEW_UPDATED,
      (r: { preview: string; serviceId: string }) =>
        callback(r.preview, r.serviceId),
      false,
    );
  }

  serviceOnUpdateVu(
    callback: (volumes: number[], serviceId: string) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.SERVICE_VU_UPDATED,
      (r: { volumes: number[]; serviceId: string }) =>
        callback(r.volumes, r.serviceId),
      false,
    );
  }

  serviceOnToggleRunning(
    callback: (args: { id: string; action: ToggleRunningAction }) => void,
  ): SocketEventOff {
    return this.on(SocketEvent.SERVICE_TOGGLE_RUNNING, callback);
  }

  groupOnUpdate(
    callback: (group: Partial<CentralGroup>) => void,
  ): SocketEventOff {
    return this.on(
      SocketEvent.GROUP_UPDATED,
      (r: { group: Partial<CentralGroup> }) => callback(r.group),
    );
  }

  userOnUpdate(callback: (user: Partial<CentralUser>) => void): SocketEventOff {
    return this.on(
      SocketEvent.USER_UPDATED,
      (r: { user: Partial<CentralUser> }) => callback(r.user),
    );
  }
}
