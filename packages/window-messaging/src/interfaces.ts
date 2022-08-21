export interface IWindowMessageResponse<T extends object | undefined> {
  messageId: string;
  messageType: string;
  response?: T;
  errorMessage?: string;
}

export function isWindowMessageResponse(
  value: any
): value is IWindowMessageResponse<object | undefined> {
  const conditions: boolean[] = [
    typeof value?.messageId === "string",
    typeof value?.messageType === "string",
    typeof value?.response === "object" || value?.response === undefined,
    typeof value?.errorMessage === "string" ||
      value?.errorMessage === undefined,
  ];
  return conditions.every((condition) => condition === true);
}
