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

export enum ServerSocketEvent {
  DEVICE_UPDATED = 'device-updated',
  DEVICE_REFRESH_CLIENT = 'device-refresh-client',
  DEVICE_STATISTICS_UPDATED = 'device-statistics-updated',
  DEVICE_STATUS_UPDATED = 'device-status-updated',
  DEVICE_SEND_STATS = 'device-send-stats',
  SERVICE_UPDATED = 'service-updated',
  SERVICE_STATUS_UPDATED = 'service-status-updated',
  SERVICE_VU_UPDATED = 'service-vu-updated',
  SERVICE_PREVIEW_UPDATED = 'service-preview-updated',
  GROUP_UPDATED = 'group-updated',
  DEVICE_REQUEST_OWNERSHIP = 'device-request-ownership',
  SERVICE_TOGGLE_RUNNING = 'service-toggle-running',
  USER_UPDATED = 'user-updated',
}

export enum DeviceSocketEvent {
  DEVICE_UPDATE_STATUS = 'device-update-status',
  DEVICE_UPDATE_STATISTICS = 'device-update-statistics',
  SERVICE_UPDATE_STATUS = 'service-update-status',
  SERVICE_UPDATE_PREVIEW = 'service-update-preview',
  SERVICE_UPDATE_VU = 'service-update-vu',
}

export enum UserSocketEvent {
  DEVICE_SUBSCRIBE_STATISTICS = 'device-subscribe-statistics',
  DEVICE_UNSUBSCRIBE_STATISTICS = 'device-unsubscribe-statistics',
  SERVICE_SUBSCRIBE_PREVIEW = 'service-subscribe-preview',
  SERVICE_UNSUBSCRIBE_PREVIEW = 'service-unsubscribe-preview',
}
