import { v4 as uuidv4 } from "uuid";
import { isWindowMessageResponse, IWindowMessageResponse } from "../interfaces";
import { IWindowMessage, IWindowRequest } from "./interfaces";

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
  private readonly otherWindow: Window;
  private readonly pendingRequests = new Map<
    string,
    MessageRequestCallbacks<any>
  >();

  constructor(otherWindow: Window) {
    this._id = uuidv4();
    this.otherWindow = otherWindow;
    this.otherWindow.addEventListener(
      "message",
      this.onReceivedWindowMessage.bind(this)
    );
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

  private onReceivedWindowMessage(event: MessageEvent<any>) {
    console.log(event);
    const data = event.data;
    try {
      const decoded = JSON.parse(data);
      if (isWindowMessageResponse(decoded)) {
        const pendingRequest = this.pendingRequests.get(decoded.messageId);
        if (pendingRequest) {
          try {
            if (decoded.errorMessage) {
              // Handle error
              pendingRequest.rejectCallback(
                new Error(decoded.errorMessage ?? "An unknown error occurred")
              );
            } else {
              // Handle success
              console.log(
                "WindowMessagingApi: Received successful response",
                decoded.response
              );
              pendingRequest.resolveCallback(decoded!.response);
            }
          } catch {
            (error: Error) => {
              // Type binding error
              pendingRequest.rejectCallback(error);
            };
          }
          this.pendingRequests.delete(decoded.messageId);
        }
      }
    } catch {
      (err: Error) => {
        console.error(err);
      };
    }
  }

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
      const messageId = uuidv4();
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

  public sendRequestResponse(
    response: IWindowMessageResponse<object | undefined>
  ) {
    this.sendMessageToWindow({
      windowId: this.id,
      ...response,
    });
  }

  public dispose() {
    this.otherWindow.removeEventListener(
      "message",
      this.onReceivedWindowMessage.bind(this)
    );
  }
}
