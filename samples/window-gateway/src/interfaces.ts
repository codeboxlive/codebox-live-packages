import { RequestHandlers } from "@codeboxlive/window-gateway";

export interface ITestRequestBody {
  value: number;
}

export interface ITestResponse {
  value: number;
}

export interface ITestMessageBody {
  randomNumber: number;
}

// Interface of the HubArea requests
export interface ITestHubAreaRequests extends RequestHandlers {
  getTransformedValue(data: ITestRequestBody): Promise<ITestResponse>;
  sendRandomValue(data: ITestMessageBody): Promise<void>;
}
