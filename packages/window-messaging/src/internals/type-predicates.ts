import { IWindowRequest } from "../interfaces";
import { IWindowMessageResponse } from "../interfaces";
import { HubArea } from "../HubArea";

export function isWindowRequest<T extends object>(
  value: any
): value is IWindowRequest<T> {
  const conditions: boolean[] = [
    typeof value?.windowId === "string",
    typeof value?.messageType === "string",
    typeof value?.messageBody === "object" || value?.messageBody === undefined,
    typeof value?.messageId === "string",
  ];
  return conditions.every((condition) => condition === true);
}

export function isWindowMessageResponse(
  value: any
): value is IWindowMessageResponse<object | void> {
  const conditions: boolean[] = [
    typeof value?.messageId === "string",
    typeof value?.messageType === "string",
    typeof value?.response === "object" || value?.response === undefined,
    typeof value?.errorMessage === "string" ||
      value?.errorMessage === undefined,
    value?.isResponse === true,
  ];
  return conditions.every((condition) => condition === true);
}

export function isWindow(value: any): value is Window {
  return value?.postMessage !== undefined;
}

export function isHubArea(value: any): value is HubArea {
  return value instanceof HubArea;
}
