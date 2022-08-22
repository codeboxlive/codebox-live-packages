import { IFluidRequests } from "@codeboxlive/hub-interfaces";
import { FluidRequests } from "./fluid";
import { ProjectsMessagingHub } from "./window-messaging";

export class ProjectsHubClient {
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
    return ProjectsMessagingHub.isInitialized;
  }

  /**
   * MARK: static public methods
   */

  /**
   * Initialize the CodeboxLiveClient for use with parent hub
   */
  public async initialize(fluidRequestHandlers: IFluidRequests): Promise<void> {
    const fluidDetails = new FluidRequests(fluidRequestHandlers);
    const hubAreas = [fluidDetails];
    return ProjectsMessagingHub.initializeIfNeeded(hubAreas);
  }

  /**
   * MARK: static private methods
   */
}
