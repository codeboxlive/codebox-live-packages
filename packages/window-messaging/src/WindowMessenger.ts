import { v4 as uuid } from "uuid";
import { IWindowMessageResponse } from "./interfaces";
import { IWindowMessage, IWindowRequest } from "./internals/interfaces";

export class MessageRequestCallbacks<T> {
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

export class WindowMessenger {
  private readonly _id: string;
  private readonly _localWindowId: string;
  private readonly otherWindow: Window;
  private readonly pendingRequests = new Map<
    string,
    MessageRequestCallbacks<any>
  >();

  constructor(id: string, localWindowId: string, otherWindow: Window) {
    this._id = id;
    this._localWindowId = localWindowId;
    this.otherWindow = otherWindow;
  }

  /**
   * SECTION: getters and setters
   */

  public get id(): string {
    return this._id;
  }

  /**
   * SECTION: private methods
   */

  private sendMessageToWindow(
    message:
      | IWindowMessage<object | undefined>
      | IWindowRequest<object | undefined>
  ) {
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

  /**
   * SECTION: public methods
   */

  public sendRequest<X>(messageType: string, messageBody?: object): Promise<X> {
    return new Promise((resolve, reject) => {
      const messageId = uuid();
      this.pendingRequests.set(
        messageId,
        new MessageRequestCallbacks<X>(resolve, reject)
      );
      this.sendMessageToWindow({
        windowId: this.id,
        messageId,
        messageType,
        messageBody,
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public sendMessage(messageType: string, messageBody?: object) {
    this.sendMessageToWindow({
      windowId: this.id,
      messageType,
      messageBody,
    });
  }

  public sendRequestResponse(response: IWindowMessageResponse<object | null>) {
    this.sendMessageToWindow({
      windowId: this._id,
      ...response,
    });
  }

  public onReceivedWindowMessage(
    response: IWindowMessageResponse<object | null>
  ) {
    const pendingRequest = this.pendingRequests.get(response.messageId);
    console.log(pendingRequest);
    if (pendingRequest) {
      try {
        if (response.errorMessage) {
          // Handle error
          pendingRequest.rejectCallback(
            new Error(response.errorMessage ?? "An unknown error occurred")
          );
        } else {
          // Handle success
          console.log(
            "WindowMessagingApi: Received successful response",
            response.response
          );
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
}
