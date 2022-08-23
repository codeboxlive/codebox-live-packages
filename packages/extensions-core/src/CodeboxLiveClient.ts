import { CodeboxLiveGateway } from "./window-gateway";
import { IFluidRequests } from "@codeboxlive/hub-interfaces";
import { FLUID_HUB_AREAS } from "./constants";

export class CodeboxLiveClient {
  /**
   * MARK: Static variables
   */

  /**
   * MARK: static getters and setters
   */

  /**
   * Client is initialized with parent window
   */
  public static get isInitialized(): boolean {
    return CodeboxLiveGateway.isInitialized;
  }

  /**
   * APIs related to Fluid. Used by `@codeboxlive/extensions-fluid` package
   */
  public static get fluid(): IFluidRequests {
    return FLUID_HUB_AREAS.getRequestsToParent();
  }

  /**
   * MARK: static public methods
   */

  /**
   * Initialize the CodeboxLiveClient for use with parent gateway
   */
  public static async initialize(): Promise<void> {
    return CodeboxLiveGateway.initializeIfNeeded();
  }

  /**
   * MARK: static private methods
   */
}
