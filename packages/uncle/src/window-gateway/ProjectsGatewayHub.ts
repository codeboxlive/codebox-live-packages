import { CODEBOX_HUB_KEY } from "@codeboxlive/hub-interfaces";
import {
  HubArea,
  IRegisterWindowGatewayEvent,
  WindowGatewayHub,
  WindowGateway,
} from "@codeboxlive/window-gateway";

const allSandpackUrls: string[] = [];
for (let a = 0; a < 10; a++) {
  for (let b = 0; b < 10; b++) {
    for (let c = 0; c < 10; c++) {
      allSandpackUrls.push(`https://${a}-${b}-${c}-sandpack.codesandbox.io`);
    }
  }
}
const AUTHORIZED_ORIGINS: string[] = [
  "https://live-share-sandbox.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  ...allSandpackUrls,
];

export class ProjectsGatewayHub {
  /**
   * MARK: Static variables
   */

  private static gatewayHub?: WindowGatewayHub;
  private static _isInitialized = false;
  private static _gateways = new Map<string, WindowGateway>();

  /**
   * MARK: static getters and setters
   */

  public static get shouldInitialize(): boolean {
    return window.self === window.top;
  }

  public static get isInitialized(): boolean {
    return this._isInitialized;
  }

  public static get gateways(): WindowGateway[] {
    return [...this._gateways.values()];
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
      this.gatewayHub = new WindowGatewayHub(
        CODEBOX_HUB_KEY,
        AUTHORIZED_ORIGINS,
        hubAreas
      );
      const onRegisterGatewayHandler = (evt: IRegisterWindowGatewayEvent) => {
        this._gateways.set(evt.gateway.id, evt.gateway);
      };
      this.gatewayHub!.addEventListener(
        "onRegisterGateway",
        onRegisterGatewayHandler.bind(this)
      );
    }
    return;
  }

  /**
   * MARK: static private methods
   */
}
