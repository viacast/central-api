import { CentralServiceType } from '../typings';

export interface SocketClientOptions {
  port: number;
  host?: string;
  path?: string;
  timeout?: number;
  locale?: string;
  https?: boolean;
  authToken?: string;
}

export interface CentralSocketResponse<DataType> {
  success: boolean;
  message?: string;
  data?: DataType;
}

export interface CentralServiceOperationModeType {
  operationMode: string;
  displayName: string;
  type: CentralServiceType;
  configLayout: string;
}
