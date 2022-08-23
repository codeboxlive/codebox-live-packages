export interface IGatewayResponse<T extends object | void> {
  messageId: string;
  messageType: string;
  response?: T;
  errorMessage?: string;
}
export interface IGatewayRequest<T extends object | undefined> {
  messageId: string;
  hubKey: string;
  windowId: string;
  messageType: string;
  messageBody?: T;
  isResponse?: boolean;
}
export type RequestHandler<
  MessageData extends object | undefined,
  ResponseType extends object | void
> = (body: MessageData) => Promise<ResponseType>;

export interface RequestHandlers {
  [key: string]: RequestHandler<any, any>;
}
