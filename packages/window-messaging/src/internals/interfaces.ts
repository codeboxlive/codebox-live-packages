export interface IWindowMessage<T extends object | undefined> {
  windowId: string;
  messageType: string;
  messageBody?: T;
}

export function isWindowMessage<T extends object | undefined>(
  value: any
): value is IWindowMessage<T> {
  const conditions: boolean[] = [
    typeof value?.windowId === "string",
    typeof value?.messageType === "string",
    typeof value?.messageBody === "object" || value?.messageBody === undefined,
  ];
  return conditions.every((condition) => condition === true);
}

export interface IWindowRequest<T extends object | undefined>
  extends IWindowMessage<T> {
  messageId: string;
}

export function isWindowRequest<T extends object>(
  value: any
): value is IWindowRequest<T> {
  const conditions: boolean[] = [
    isWindowMessage<T>(value),
    typeof value?.messageId === "string",
  ];
  return conditions.every((condition) => condition === true);
}
