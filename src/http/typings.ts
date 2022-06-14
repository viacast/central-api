export interface HttpClientOptions {
  port: number;
  host?: string;
  prefix?: string;
  timeout?: number;
  locale?: string;
  https?: boolean;
}

interface HttpResponse {
  status: number;
  statusText: string;
  data: Record<string, unknown>;
}

export interface CentralHttpResponse<DataType> {
  success: boolean;
  message?: string;
  data?: DataType;
  response?: HttpResponse;
}
