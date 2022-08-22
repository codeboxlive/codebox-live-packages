import { CODEBOX_HUB_KEY } from "@codeboxlive/hub-interfaces";
import {
  WindowMessagingHub,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { ALL_HUB_AREAS, UNKNOWN_ERROR } from "../constants";

const AUTHORIZED_ORIGINS: string[] = [
  "https://live-share-sandbox.vercel.app",
  "http://localhost:3000",
];

export class CodeboxLiveMessaging {
  /**
   * MARK: Static variables
   */

  private static readonly messagingHub: WindowMessagingHub =
    new WindowMessagingHub(CODEBOX_HUB_KEY, AUTHORIZED_ORIGINS, ALL_HUB_AREAS);
  private static _parentMessenger?: WindowMessenger;

  /**
   * MARK: static getters and setters
   */

  public static get shouldInitialize(): boolean {
    return window.self !== window.top;
  }

  public static get isInitialized(): boolean {
    return !!this._parentMessenger;
  }

  public static get parentMessenger(): WindowMessenger | undefined {
    return this._parentMessenger;
  }

  /**
   * MARK: static public methods
   */

  public static async initializeIfNeeded(): Promise<void> {
    if (!this.shouldInitialize) {
      throw new Error(
        "CodeboxLiveClient: cannot initialize unless within an iFrame"
      );
    }
    if (!this.isInitialized) {
      try {
        const messenger = await this.messagingHub.registerWindowMessenger(
          window.parent
        );
        this._parentMessenger = messenger;
      } catch (error: any) {
        throw error instanceof Error ? error : UNKNOWN_ERROR;
      }
    }
    return;
  }

  /**
   * MARK: static private methods
   */
}
