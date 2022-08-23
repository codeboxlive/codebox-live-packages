import { IFluidRequests } from "@codeboxlive/hub-interfaces";
import { FluidRequests } from "./fluid";
import { ProjectsGatewayHub } from "./window-gateway";

export class UncleGatewayHub {
  /**
   * MARK: Static variables
   */

  private static fluid?: FluidRequests;

  /**
   * MARK: static getters and setters
   */

  /**
   * Client is initialized with parent window
   */
  public static get isInitialized(): boolean {
    return ProjectsGatewayHub.isInitialized;
  }

  /**
   * MARK: static public methods
   */

  /**
   * Initialize the CodeboxLiveClient for use with parent hub
   */
  public static async initialize(
    fluidRequestHandlers: IFluidRequests
  ): Promise<void> {
    if (!this.fluid) {
      this.fluid = new FluidRequests(fluidRequestHandlers);
    } else {
      this.fluid.requestHandlers = fluidRequestHandlers;
    }
    const hubAreas = [this.fluid!];
    return ProjectsGatewayHub.initializeIfNeeded(hubAreas);
  }

  /**
   * MARK: static private methods
   */
}
