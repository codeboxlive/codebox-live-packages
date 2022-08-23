import { v4 as uuid } from "uuid";
import { IGatewayResponse, IGatewayRequest } from "./interfaces";

class GatewayRequestCallbacks<T> {
  public readonly resolveCallback: (arg0: T) => void;
  public readonly rejectCallback: (error: Error) => void;

  constructor(
    resolveCallback: (arg0: T) => void,
    rejectCallback: (error: Error) => void
  ) {
    this.resolveCallback = resolveCallback;
    this.rejectCallback = rejectCallback;
  }
}

export class WindowGateway {
  private readonly hubKey: string;
  private readonly _id: string;
  private readonly localWindowId: string;
  private readonly otherWindow: Window;
  private readonly pendingRequests = new Map<
    string,
    GatewayRequestCallbacks<any>
  >();

  constructor(
    hubKey: string,
    id: string,
    localWindowId: string,
    otherWindow: Window
  ) {
    this.hubKey = hubKey;
    this._id = id;
    this.localWindowId = localWindowId;
    this.otherWindow = otherWindow;
  }

  /**
   * SECTION: getters and setters
   */

  public get id(): string {
    return this._id;
  }

  /**
   * SECTION: public methods
   */

  /**
   * Send request to frame
   * @template TResponse response type, either an object or void
   *
   * @param messageType string type for message so frame can determine how to handle.
   * @param messageBody Optional. Object to send to parent with information about request.
   * @returns promise with expected object response
   */
  public sendRequest<TResponse extends object | void>(
    messageType: string,
    messageBody?: object
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const messageId = uuid();
      this.pendingRequests.set(
        messageId,
        new GatewayRequestCallbacks<TResponse>(resolve, reject)
      );
      this.sendMessageToWindow({
        hubKey: this.hubKey,
        windowId: this.id,
        messageId,
        messageType,
        messageBody,
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Send response to request back to frame that made request
   *
   * @param response response information.
   */
  public sendRequestResponse(response: IGatewayResponse<object | void>) {
    this.sendMessageToWindow({
      hubKey: this.hubKey,
      windowId: this._id,
      ...response,
      isResponse: true,
    });
  }

  /**
   * Response received from frame for a pending request
   *
   * @param response response information.
   */
  public onReceivedWindowMessage(response: IGatewayResponse<object | void>) {
    const pendingRequest = this.pendingRequests.get(response.messageId);
    if (pendingRequest) {
      try {
        if (response.errorMessage) {
          // Handle error
          pendingRequest.rejectCallback(
            new Error(response.errorMessage ?? "An unknown error occurred")
          );
        } else {
          // Handle success
          pendingRequest.resolveCallback(response!.response);
        }
      } catch {
        (error: Error) => {
          // Type binding error
          pendingRequest.rejectCallback(error);
        };
      }
      this.pendingRequests.delete(response.messageId);
    }
  }

  /**
   * SECTION: private methods
   */

  private sendMessageToWindow(message: IGatewayRequest<object | undefined>) {
    return new Promise<void>((resolve, reject) => {
      if (this.otherWindow === window) {
        reject(
          new Error("Cannot send message between two windows that are the same")
        );
      }
      this.otherWindow.postMessage(JSON.stringify(message), "*");
      resolve();
    });
  }
}
