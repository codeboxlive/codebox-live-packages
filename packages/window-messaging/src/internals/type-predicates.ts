import { IWindowMessage, IWindowRequest } from "./interfaces";
import { IWindowMessageResponse } from "../interfaces";

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

export function isWindowRequest<T extends object>(
  value: any
): value is IWindowRequest<T> {
  const conditions: boolean[] = [
    isWindowMessage<T>(value),
    typeof value?.messageId === "string",
  ];
  return conditions.every((condition) => condition === true);
}

export function isWindowMessageResponse(
  value: any
): value is IWindowMessageResponse<object | null> {
  const conditions: boolean[] = [
    typeof value?.messageId === "string",
    typeof value?.messageType === "string",
    typeof value?.response === "object" || value?.response === null,
    typeof value?.errorMessage === "string" ||
      value?.errorMessage === undefined,
  ];
  return conditions.every((condition) => condition === true);
}

export function isWindow(value: any): value is Window {
  return value?.postMessage !== undefined;
}
