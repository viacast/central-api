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
  SERVICE_SUBSCRIBE_PREVIEW = 'service-subscribe-preview',
  SERVICE_UNSUBSCRIBE_PREVIEW = 'service-unsubscribe-preview',
  SERVICE_UPDATE_PREVIEW = 'service-update-preview',
  SERVICE_PREVIEW_UPDATED = 'service-preview-updated',
  SERVICE_UPDATE_VU = 'service-update-vu',
  SERVICE_VU_UPDATED = 'service-vu-updated',
  GROUP_UPDATED = 'group-updated',
  DEVICE_REQUEST_OWNERSHIP = 'device-request-ownership',
  SERVICE_TOGGLE_RUNNING = 'service-toggle-running',
  USER_UPDATED = 'user-updated',
}
