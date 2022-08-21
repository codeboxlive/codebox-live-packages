import { WindowMessenger } from "./internals/WindowMessenger";
import { isWindowMessage, isWindowRequest } from "./internals/interfaces";
import { IWindowMessageResponse } from "./interfaces";

type RequestHandler<
  MessageData extends object | undefined,
  ResponseType extends object | undefined
> = (data: MessageData) => Promise<ResponseType>;
type MessageHandler<MessageData extends object | undefined> = (
  data: MessageData
) => void;

export class WindowMessagingHub {
  private static isInitialized = false;
  private static allowedMessageOrigins: string[] = [];
  private static requestHandlers = new Map<string, RequestHandler<any, any>>();
  private static messageHandlers = new Map<string, MessageHandler<any>>();
  private static registeredWindows = new Map<string, WindowMessenger>();

  public static initialize(
    allowedMessageOrigins: string[],
    requestHandlers?: Map<string, RequestHandler<any, any>>,
    messageHandlers?: Map<string, MessageHandler<any>>
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
    otherWindow: Window
  ): Promise<WindowMessenger> {
    const windowMessager = new WindowMessenger(otherWindow);
    const id = windowMessager.id;
    this.registeredWindows.set(id, windowMessager);
    // TODO: wait until child window has sent first message before returning
    return Promise.resolve(windowMessager);
  }

  public static unregisterWindowMessenger(id: string) {
    const registeredWindow = this.registeredWindows.get(id);
    registeredWindow?.dispose();
    this.registeredWindows.delete(id);
  }

  private static listenForIncomingMessages() {
    if (this.isInitialized) return;
    window.addEventListener("message", this.onIncomingMessage.bind(this));
  }

  private static async onIncomingMessage(ev: MessageEvent<any>) {
    if (!WindowMessagingHub.allowedMessageOrigins.includes(ev.origin)) {
      console.error(
        "WindowMessagingHub: message received from untrusted message origin"
      );
      return;
    }
    const source = ev.source;

    const data = ev.data;
    // Verify that source is a window
    if (source instanceof Window) {
      try {
        const decoded = JSON.parse(data);
        if (isWindowMessage(decoded)) {
          let windowMessenger = this.registeredWindows.get(decoded.windowId);
          if (!windowMessenger) {
            // Register
            windowMessenger = await this.registerWindowMessenger(source);
          }
          if (isWindowRequest(decoded)) {
            // The message sender is expecting a response
            let responseMessage: IWindowMessageResponse<any>;
            const requestHandler = this.requestHandlers.get(
              decoded.messageType
            );
            if (requestHandler) {
              // Handle the request
              const requestResponseData = await requestHandler(
                decoded.messageBody
              );
              responseMessage = {
                messageType: decoded.messageType,
                messageId: decoded.messageId,
                response: requestResponseData,
              };
            } else {
              // Return an error signaling the type is not valid
              responseMessage = {
                messageType: decoded.messageType,
                messageId: decoded.messageId,
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
        if (err instanceof Error) {
          console.error(err);
        }
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
