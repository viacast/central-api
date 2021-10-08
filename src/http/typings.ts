export interface HttpClientOptions {
  port: number;
  host?: string;
  prefix?: string;
  https?: boolean;
}

interface HttpResponse {
  status: number;
  statusText: string;
}

export interface CentralHttpResponse<DataType> {
  success: boolean;
  message?: string;
  data?: DataType;
  response?: HttpResponse;
}
