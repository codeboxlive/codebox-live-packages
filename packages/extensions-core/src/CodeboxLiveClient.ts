import { CodeboxLiveMessaging } from "./window-messaging";
import { IFluidDetails } from "./fluid";
import { FluidDetails } from "./fluid/internals";

export class CodeboxLiveClient {
  /**
   * MARK: Static variables
   */

  /**
   * Fluid details for use by extensions-fluid package
   */
  private static readonly _fluidDetails: IFluidDetails = new FluidDetails();

  /**
   * MARK: static getters and setters
   */

  /**
   * Client is initialized with parent window
   */
  public static get isInitialized(): boolean {
    return CodeboxLiveMessaging.isInitialized;
  }

  /**
   * APIs related to Fluid. Used by `@codeboxlive/extensions-fluid` package
   */
  public static get fluid(): IFluidDetails {
    return this._fluidDetails;
  }

  /**
   * MARK: static public methods
   */

  /**
   * MARK: static private methods
   */
}
