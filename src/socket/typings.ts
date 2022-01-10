export interface SocketClientOptions {
  port: number;
  host?: string;
  path?: string;
  timeout?: number;
  locale?: string;
  https?: boolean;
  token?: string;
}

export interface CentralSocketResponse<DataType> {
  success: boolean;
  message?: string;
  data?: DataType;
}

export enum SocketEvent {
  DEVICE_UPDATE_STATUS = 'device-update-status',
  DEVICE_UPDATED = 'device-updated',
  DEVICE_STATUS_UPDATED = 'device-status-updated',
  SERVICE_UPDATE_STATUS = 'service-update-status',
  SERVICE_UPDATED = 'service-updated',
  SERVICE_STATUS_UPDATED = 'service-status-updated',
  STREAM_SUBSCRIBE_PREVIEW = 'stream-subscribe-preview',
  STREAM_UNSUBSCRIBE_PREVIEW = 'stream-unsubscribe-preview',
  STREAM_UPDATE_PREVIEW = 'stream-update-preview',
  STREAM_PREVIEW_UPDATED = 'stream-preview-updated',
  STREAM_UPDATE_VU = 'stream-update-vu',
  STREAM_VU_UPDATED = 'stream-vu-updated',
  DEVICE_REQUEST_OWNERSHIP = 'device-request-ownership',
  SERVICE_TOGGLE_RUNNING = 'service-toggle-running',
}
