import { CODEBOX_HUB_KEY } from "@codeboxlive/hub-interfaces";
import {
  HubArea,
  IRegisterWindowMessengerEvent,
  WindowMessagingHub,
  WindowMessenger,
} from "@codeboxlive/window-messaging";

const AUTHORIZED_ORIGINS: string[] = [
  "https://live-share-sandbox.vercel.app",
  "https://1-2-2-sandpack.codesandbox.io",
  "http://localhost:3000",
];

export class ProjectsMessagingHub {
  /**
   * MARK: Static variables
   */

  private static messagingHub?: WindowMessagingHub;
  private static _isInitialized = false;
  private static _windowMessengers = new Map<string, WindowMessenger>();

  /**
   * MARK: static getters and setters
   */

  public static get shouldInitialize(): boolean {
    return window.self === window.top;
  }

  public static get isInitialized(): boolean {
    return this._isInitialized;
  }

  public static get windowMessengers(): WindowMessenger[] {
    return [...this._windowMessengers.values()];
  }

  /**
   * MARK: static public methods
   */

  public static async initializeIfNeeded(hubAreas: HubArea[]): Promise<void> {
    if (!this.shouldInitialize) {
      throw new Error(
        "CodeboxLiveClient: cannot initialize unless within an iFrame"
      );
    }
    if (!this.isInitialized) {
      this.messagingHub = new WindowMessagingHub(
        CODEBOX_HUB_KEY,
        AUTHORIZED_ORIGINS,
        hubAreas
      );
      const onRegisterWindowMessenger = (
        evt: IRegisterWindowMessengerEvent
      ) => {
        this._windowMessengers.set(evt.windowMessenger.id, evt.windowMessenger);
      };
      this.messagingHub!.addEventListener(
        "registerWindowMessenger",
        onRegisterWindowMessenger.bind(this)
      );
    }
    return;
  }

  /**
   * MARK: static private methods
   */
}
