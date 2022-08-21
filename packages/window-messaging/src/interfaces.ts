export interface IWindowMessageResponse<T extends object | null> {
  messageId: string;
  messageType: string;
  response?: T;
  errorMessage?: string;
}
