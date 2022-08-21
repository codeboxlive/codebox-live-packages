import { WindowMessenger } from "./WindowMessenger";
import {
  isWindow,
  isWindowMessage,
  isWindowMessageResponse,
  isWindowRequest,
} from "./internals";
import { IWindowMessageResponse } from "./interfaces";
import { MessageHandler, RequestHandler } from "./types";
import { v4 as uuid } from "uuid";
import EventEmitter from "events";

export interface IRegisterWindowMessengerEvent {
  windowMessenger: WindowMessenger;
}

export interface MediaPlayerSynchronizerEvents {
  registerWindowMessenger: IRegisterWindowMessengerEvent;
}

export class WindowMessagingHub extends EventEmitter {
  private localWindowId = uuid();
  private allowedMessageOrigins: string[] = [];
  private requestHandlers = new Map<
    string,
    RequestHandler<object | undefined, object | null>
  >();
  private messageHandlers = new Map<
    string,
    MessageHandler<object | undefined>
  >();
  private registeredWindows = new Map<string, WindowMessenger>();

  constructor(
    allowedMessageOrigins: string[],
    requestHandlers?: Map<
      string,
      RequestHandler<object | undefined, object | null>
    >,
    messageHandlers?: Map<string, MessageHandler<object | undefined>>
  ) {
    super();
    this.allowedMessageOrigins = allowedMessageOrigins;
    if (requestHandlers) {
      this.requestHandlers = requestHandlers;
    }
    if (messageHandlers) {
      this.messageHandlers = messageHandlers;
    }

    this.listenForIncomingMessages();
  }

  /**
   * MARK: public methods
   */

  public registerWindowMessenger(
    otherWindow: Window,
    knownWindowId?: string
  ): Promise<WindowMessenger> {
    const windowId = knownWindowId ?? uuid();
    const windowMessenger = new WindowMessenger(
      windowId,
      this.localWindowId,
      otherWindow
    );
    this.registeredWindows.set(windowId, windowMessenger);
    this.emit("registerWindowMessenger", {
      windowMessenger,
    });
    // TODO: wait until child window has sent first message before returning
    return Promise.resolve(windowMessenger);
  }

  public unregisterWindowMessenger(id: string) {
    this.registeredWindows.delete(id);
  }

  /**
   * Registers new event listener.
   * @param event Name the event to add.
   * @param listener Function to call when this event is triggered.
   */
  public addEventListener<
    K extends keyof MediaPlayerSynchronizerEvents = keyof MediaPlayerSynchronizerEvents
  >(event: K, listener: (evt: MediaPlayerSynchronizerEvents[K]) => void): this {
    this.on(event, listener);
    return this;
  }

  /**
   * Un-registers existing event listener.
   * @param event Name of event to remove.
   * @param listener Function previously registered using `addEventListener`.
   */
  public removeEventListener<
    K extends keyof MediaPlayerSynchronizerEvents = keyof MediaPlayerSynchronizerEvents
  >(event: K, listener: (evt: MediaPlayerSynchronizerEvents[K]) => void): this {
    this.off(event, listener);
    return this;
  }

  /**
   * MARK: private methods
   */

  private listenForIncomingMessages() {
    window.addEventListener("message", this.onIncomingMessage.bind(this));
  }

  private async onIncomingMessage(ev: MessageEvent<any>) {
    // if (ev.origin === window.origin) return;
    if (!this.allowedMessageOrigins.includes(ev.origin)) {
      console.warn(
        new Error(
          `WindowMessagingHub: received message from untrusted origin of ${ev.origin}`
        )
      );
      return;
    }
    const source = ev.source;

    const data = ev.data;
    // Verify that source is a window
    if (isWindow(source)) {
      try {
        const decoded = JSON.parse(data);

        if (isWindowMessage(decoded)) {
          let windowMessenger = this.registeredWindows.get(decoded.windowId);
          if (!windowMessenger) {
            // Register
            windowMessenger = await this.registerWindowMessenger(
              source,
              decoded.windowId
            );
          }
          if (isWindowMessageResponse(decoded)) {
            windowMessenger.onReceivedWindowMessage(decoded);
          } else if (isWindowRequest(decoded)) {
            // The message sender is expecting a response
            let responseMessage: IWindowMessageResponse<object | null>;
            const requestHandler = this.requestHandlers.get(
              decoded.messageType
            );
            if (requestHandler) {
              try {
                // Handle the request
                const requestResponseData = await requestHandler(
                  decoded.messageBody
                );
                responseMessage = {
                  messageType: decoded.messageType,
                  messageId: decoded.messageId,
                  response: requestResponseData ?? null,
                };
              } catch (err: any) {
                responseMessage = {
                  messageType: decoded.messageType,
                  messageId: decoded.messageId,
                  response: null,
                  errorMessage: err.message ?? "An unknown error occurred",
                };
              }
            } else {
              // Return an error signaling the type is not valid
              responseMessage = {
                messageType: decoded.messageType,
                messageId: decoded.messageId,
                response: null,
                errorMessage: "Unable to find a response",
              };
            }
            windowMessenger.sendRequestResponse(responseMessage);
          } else {
            // The message sender is not expecting a response, process message
            const messageHandler = this.messageHandlers.get(
              decoded.messageType
            );
            if (messageHandler) {
              messageHandler(decoded.messageBody);
            } else {
              console.error(
                new Error(
                  `WindowMessagingHub: no message handler registered of type ${data.messageType}`
                )
              );
            }
          }
        }
      } catch (err: any) {
        // Message is not valid JSON...likely message from different source
      }
    } else {
      console.error(
        new Error(
          "WindowMessagingHub: cannot process message for source that is not instanceof Window"
        )
      );
    }
  }
}
