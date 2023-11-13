import { WindowGateway } from "./WindowGateway";
import {
  isWindow,
  isWindowGatewayResponse,
  isWindowRequest,
  SystemHubArea,
} from "./internals";
import { IGatewayResponse, RequestHandlers } from "./interfaces";
import { v4 as uuid } from "uuid";
import EventEmitter from "events";
import { HubArea } from "./HubArea";

export interface IRegisterWindowGatewayEvent {
  gateway: WindowGateway;
}

export interface IWindowGatewayHubEvents {
  onRegisterGateway: IRegisterWindowGatewayEvent;
}

/**
 * Central hub overseeing all window gateways.
 */
export class WindowGatewayHub extends EventEmitter {
  private readonly hubKey: string;
  private readonly localWindowId = uuid();
  private allowedMessageOrigins: string[] = [];
  private registeredGateways = new Map<string, WindowGateway>();
  private systemHubArea = new SystemHubArea();
  private hubAreas: HubArea[];

  /**
   * @param hubKey unique key for key.
   * @param allowedMessageOrigins allowed message origins to communicate with
   * @param additionalHubs list of hub areas.
   */
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
   * MARK: getters
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

  /**
   * Register a new gateway to communicate with.
   * @param window the Window instance to open communication with.
   * @param knownGatewayId Optional. window gateway UUID if known.
   * @returns window gateway object.
   */
  public async registerGateway(
    window: Window,
    knownGatewayId?: string
  ): Promise<WindowGateway> {
    const windowId = knownGatewayId ?? uuid();
    const gateway = new WindowGateway(
      this.hubKey,
      windowId,
      this.localWindowId,
      window
    );
    this.registeredGateways.set(windowId, gateway);
    this.emit("onRegisterGateway", {
      gateway,
    });
    // Send confirmation so that other window knows that the registration occurred
    await this.systemHubArea.sendRequestWith(gateway).initialize();
    return gateway;
  }

  /**
   * Unregister gateway for window communication.
   * @param id the Window instance to open communication with.
   */
  public unregisterGateway(id: string) {
    // TODO: send message to window that it was unregistered
    this.registeredGateways.delete(id);
  }

  /**
   * Registers new event listener.
   * @param event Name the event to add.
   * @param listener Function to call when this event is triggered.
   */
  public addEventListener<
    K extends keyof IWindowGatewayHubEvents = keyof IWindowGatewayHubEvents
  >(event: K, listener: (evt: IWindowGatewayHubEvents[K]) => void): this {
    this.on(event, listener);
    return this;
  }

  /**
   * Un-registers existing event listener.
   * @param event Name of event to remove.
   * @param listener Function previously registered using `addEventListener`.
   */
  public removeEventListener<
    K extends keyof IWindowGatewayHubEvents = keyof IWindowGatewayHubEvents
  >(event: K, listener: (evt: IWindowGatewayHubEvents[K]) => void): this {
    this.off(event, listener);
    return this;
  }

  /**
   * Stop listening for changes.
   */
  public dispose() {
    // TODO: send message to window that it was unregistered
    window.removeEventListener("message", this.onIncomingMessage.bind(this));
  }

  /**
   * MARK: private methods
   */

  /**
   * Callback method for processing an incoming message from another window gateway.
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
        const decoded: any = JSON.parse(data);
        if (isWindowRequest(decoded)) {
          // If message is from a different gateway hub, ignore the message
          if (decoded.hubKey !== this.hubKey) return;
          // Check if window already has a registered gateway
          let gateway = this.registeredGateways.get(decoded.windowId);
          if (!gateway) {
            // Register
            gateway = await this.registerGateway(source, decoded.windowId);
          }
          // Handle non-system message/request
          if (isWindowGatewayResponse(decoded)) {
            // The message is an incoming request to resolve a pending request
            gateway.onReceivedWindowMessage(decoded);
          } else {
            // The message sender is expecting a response
            let responseMessage: IGatewayResponse<object | void>;
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
            gateway.sendRequestResponse(responseMessage);
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
