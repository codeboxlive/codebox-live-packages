import { CODEBOX_HUB_KEY } from "@codeboxlive/hub-interfaces";
import { WindowGatewayHub, WindowGateway } from "@codeboxlive/window-gateway";
import { ALL_HUB_AREAS, UNKNOWN_ERROR } from "../constants";

const AUTHORIZED_ORIGINS: string[] = [
  "https://live-share-sandbox.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

export class CodeboxLiveGateway {
  /**
   * MARK: Static variables
   */

  private static messagingHub?: WindowGatewayHub;
  private static _parentGateway?: WindowGateway;

  /**
   * MARK: static getters and setters
   */

  public static get shouldInitialize(): boolean {
    return window.self !== window.top;
  }

  public static get isInitialized(): boolean {
    return !!this._parentGateway;
  }

  public static get parentGateway(): WindowGateway | undefined {
    return this._parentGateway;
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
      this.messagingHub = new WindowGatewayHub(
        CODEBOX_HUB_KEY,
        AUTHORIZED_ORIGINS,
        ALL_HUB_AREAS
      );
      try {
        const gateway = await this.messagingHub.registerGateway(window.parent);
        this._parentGateway = gateway;
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
