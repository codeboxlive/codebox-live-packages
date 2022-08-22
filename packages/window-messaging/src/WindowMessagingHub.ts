import { WindowMessenger } from "./WindowMessenger";
import {
  isWindow,
  isWindowMessageResponse,
  isWindowRequest,
  SystemHubArea,
} from "./internals";
import { IWindowMessageResponse, RequestHandlers } from "./interfaces";
import { v4 as uuid } from "uuid";
import EventEmitter from "events";
import { HubArea } from "./HubArea";

export interface IRegisterWindowMessengerEvent {
  windowMessenger: WindowMessenger;
}

export interface MediaPlayerSynchronizerEvents {
  registerWindowMessenger: IRegisterWindowMessengerEvent;
}

export class WindowMessagingHub extends EventEmitter {
  private readonly hubKey: string;
  private readonly localWindowId = uuid();
  private allowedMessageOrigins: string[] = [];
  private registeredWindows = new Map<string, WindowMessenger>();
  private systemHubArea = new SystemHubArea();
  private hubAreas: HubArea[];

  constructor(
    hubKey: string,
    allowedMessageOrigins: string[],
    additionalHubs: HubArea[] = []
  ) {
    super();
    this.hubKey = hubKey;
    this.hubAreas = [this.systemHubArea, ...additionalHubs];
    this.allowedMessageOrigins = allowedMessageOrigins;
    window.addEventListener("message", this.onIncomingMessage.bind(this));
  }

  /**
   * MARK: public getters
   */

  private get requestHandlers(): RequestHandlers {
    let mergedRequestHandlers: RequestHandlers = {};
    this.hubAreas.forEach((areaHub) => {
      mergedRequestHandlers = {
        ...mergedRequestHandlers,
        ...areaHub.requestHandlers,
      };
    });
    return mergedRequestHandlers;
  }

  /**
   * MARK: public methods
   */

  public async registerWindowMessenger(
    otherWindow: Window,
    knownWindowId?: string
  ): Promise<WindowMessenger> {
    const windowId = knownWindowId ?? uuid();
    const windowMessenger = new WindowMessenger(
      this.hubKey,
      windowId,
      this.localWindowId,
      otherWindow
    );
    this.registeredWindows.set(windowId, windowMessenger);
    this.emit("registerWindowMessenger", {
      windowMessenger,
    });
    // Send confirmation so that other window knows that the registration occurred
    await this.systemHubArea.sendRequestWith(windowMessenger).initialize();
    return windowMessenger;
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

  private async onIncomingMessage(ev: MessageEvent<any>) {
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
        if (isWindowRequest(decoded)) {
          // If message is from a different hub, ignore the message
          if (decoded.hubKey !== this.hubKey) return;
          // Check if window already has a registered messenger
          let windowMessenger = this.registeredWindows.get(decoded.windowId);
          if (!windowMessenger) {
            // Register
            windowMessenger = await this.registerWindowMessenger(
              source,
              decoded.windowId
            );
          }
          // Handle non-system message/request
          if (isWindowMessageResponse(decoded)) {
            // The message is an incoming request to resolve a pending request
            windowMessenger.onReceivedWindowMessage(decoded);
          } else {
            // The message sender is expecting a response
            let responseMessage: IWindowMessageResponse<object | void>;
            const requestHandler = this.requestHandlers[decoded.messageType];
            if (requestHandler) {
              try {
                // Handle the request
                const requestResponseData = await requestHandler(
                  decoded.messageBody
                );
                responseMessage = {
                  messageType: decoded.messageType,
                  messageId: decoded.messageId,
                  response: requestResponseData ?? undefined,
                };
              } catch (err: any) {
                responseMessage = {
                  messageType: decoded.messageType,
                  messageId: decoded.messageId,
                  response: undefined,
                  errorMessage: err.message ?? "An unknown error occurred",
                };
              }
            } else {
              // Return an error signaling the type is not valid
              responseMessage = {
                messageType: decoded.messageType,
                messageId: decoded.messageId,
                response: undefined,
                errorMessage: "Unable to find a response",
              };
            }
            windowMessenger.sendRequestResponse(responseMessage);
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
