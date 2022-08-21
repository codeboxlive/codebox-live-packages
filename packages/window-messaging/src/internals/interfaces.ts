export interface IWindowMessage<T extends object | undefined> {
  windowId: string;
  messageType: string;
  messageBody?: T;
}

export interface IWindowRequest<T extends object | undefined>
  extends IWindowMessage<T> {
  messageId: string;
}
