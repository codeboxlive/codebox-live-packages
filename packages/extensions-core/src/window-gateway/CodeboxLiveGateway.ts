import { CODEBOX_HUB_KEY } from "@codeboxlive/hub-interfaces";
import { WindowGatewayHub, WindowGateway } from "@codeboxlive/window-gateway";
import { ALL_HUB_AREAS, ALL_ORIGINS, UNKNOWN_ERROR } from "../constants";

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
        ALL_ORIGINS,
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
