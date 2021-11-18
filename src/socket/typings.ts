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

export enum SocketEvents {
  UPDATE_DEVICE_STATUS = 'update-device-status',
  DEVICE_UPDATED = 'device-updated',
  DEVICE_STATUS_UPDATED = 'device-status-updated',
  UPDATE_SERVICE_STATUS = 'update-service-status',
  SERVICE_UPDATED = 'service-updated',
  SERVICE_STATUS_UPDATED = 'service-status-updated',
  DEVICE_REQUEST_OWNERSHIP = 'device-request-ownership',
  SERVICE_TOGGLE_RUNNING = 'service-toggle-running',
}
