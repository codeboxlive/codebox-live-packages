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

export class WindowMessagingHub {
  private static localWindowId = uuid();
  private static isInitialized = false;
  private static allowedMessageOrigins: string[] = [];
  private static requestHandlers = new Map<
    string,
    RequestHandler<object | undefined, object | null>
  >();
  private static messageHandlers = new Map<
    string,
    MessageHandler<object | undefined>
  >();
  private static registeredWindows = new Map<string, WindowMessenger>();

  public static initialize(
    allowedMessageOrigins: string[],
    requestHandlers?: Map<
      string,
      RequestHandler<object | undefined, object | null>
    >,
    messageHandlers?: Map<string, MessageHandler<object | undefined>>
  ) {
    if (this.isInitialized) return;
    if (requestHandlers) {
      this.requestHandlers = requestHandlers;
    }
    if (messageHandlers) {
      this.messageHandlers = messageHandlers;
    }
    this.allowedMessageOrigins = allowedMessageOrigins;
    this.listenForIncomingMessages();
    this.isInitialized = true;
  }

  public static registerWindowMessenger(
    otherWindow: Window,
    knownWindowId?: string
  ): Promise<WindowMessenger> {
    const windowId = knownWindowId ?? uuid();
    const windowMessager = new WindowMessenger(
      windowId,
      this.localWindowId,
      otherWindow
    );
    this.registeredWindows.set(windowId, windowMessager);
    // TODO: wait until child window has sent first message before returning
    return Promise.resolve(windowMessager);
  }

  public static unregisterWindowMessenger(id: string) {
    this.registeredWindows.delete(id);
  }

  private static listenForIncomingMessages() {
    if (this.isInitialized) return;
    window.addEventListener("message", this.onIncomingMessage.bind(this));
  }

  private static async onIncomingMessage(ev: MessageEvent<any>) {
    // if (ev.origin === window.origin) return;
    if (!WindowMessagingHub.allowedMessageOrigins.includes(ev.origin)) {
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
