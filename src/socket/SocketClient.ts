import Emittery = require('emittery');
import {
  CentralDeviceStatus,
  CentralService,
  CentralServiceStatus,
  ToggleRunningAction,
} from 'index';
import io, { Socket } from 'socket.io-client';

import { CentralDevice } from '../typings';
import { promisify } from '../utils';

import {
  CentralSocketResponse,
  SocketClientOptions,
  SocketEvent,
} from './typings';

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

  private on(event: string, handler: (data: unknown) => void): void {
    if (this.connected) {
      this.io.off(event);
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

  waitConnected(): Promise<void> {
    const { promise, resolve } = promisify<void>();
    if (this.connected) {
      resolve();
      return promise;
    }
    return this.emitter.once('connected');
  }

  async deviceUpdateStatus(
    status: CentralDeviceStatus,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.DEVICE_UPDATE_STATUS, {
      status,
    });
  }

  deviceOnUpdate(callback: (device: Partial<CentralDevice>) => void): void {
    this.on(
      SocketEvent.DEVICE_UPDATED,
      (r: { device: Partial<CentralDevice> }) => callback(r.device),
    );
  }

  deviceOnUpdateStatus(
    callback: (deviceStatus: Partial<CentralDeviceStatus>) => void,
  ): void {
    this.on(
      SocketEvent.DEVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralDeviceStatus> }) => callback(r.status),
    );
  }

  deviceOnRequestOwnership(
    callback: (code: { code: string; expiration: number }) => void,
  ): void {
    this.on(
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

  async streamUpdatePreview(
    streamId: string,
    preview: string,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.STREAM_UPDATE_PREVIEW, {
      streamId,
      preview,
    });
  }

  async streamUpdateVu(
    streamId: string,
    volumes: number[],
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.STREAM_UPDATE_VU, {
      streamId,
      volumes,
    });
  }

  async streamSubscribePreview(
    streamId: string,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.STREAM_SUBSCRIBE_PREVIEW, {
      streamId,
    });
  }

  async streamUnsubscribePreview(
    streamId?: string,
  ): Promise<CentralSocketResponse<null>> {
    return this.asyncEmit<null>(SocketEvent.STREAM_UNSUBSCRIBE_PREVIEW, {
      streamId,
    });
  }

  serviceOnUpdate(callback: (service: Partial<CentralService>) => void): void {
    this.on(
      SocketEvent.SERVICE_UPDATED,
      (r: { service: Partial<CentralService> }) => callback(r.service),
    );
  }

  serviceOnUpdateStatus(
    callback: (serviceStatus: Partial<CentralServiceStatus>) => void,
  ): void {
    this.on(
      SocketEvent.SERVICE_STATUS_UPDATED,
      (r: { status: Partial<CentralServiceStatus> }) => callback(r.status),
    );
  }

  streamOnUpdatePreview(
    callback: (preview: string, streamId: string) => void,
  ): void {
    this.on(
      SocketEvent.STREAM_PREVIEW_UPDATED,
      (r: { preview: string; streamId: string }) =>
        callback(r.preview, r.streamId),
    );
  }

  streamOnUpdateVu(
    callback: (volumes: number[], streamId: string) => void,
  ): void {
    this.on(
      SocketEvent.STREAM_VU_UPDATED,
      (r: { volumes: number[]; streamId: string }) =>
        callback(r.volumes, r.streamId),
    );
  }

  serviceOnToggleRunning(
    callback: (args: { id: string; action: ToggleRunningAction }) => void,
  ): void {
    this.on(SocketEvent.SERVICE_TOGGLE_RUNNING, callback);
  }
}
