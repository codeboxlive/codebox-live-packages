import { IFluidRequests, FLUID_AREA_PATH } from "@codeboxlive/hub-interfaces";
import { HubArea, WindowGateway } from "@codeboxlive/window-gateway";
import { FLUID_REQUEST_HANDLERS } from "./internal";

export class FluidRequests extends HubArea<IFluidRequests> {
  constructor(requestHandlers: IFluidRequests) {
    super(FLUID_AREA_PATH, requestHandlers);
  }

  public override sendRequestWith(
    gateway: WindowGateway,
    bindThis = this
  ): IFluidRequests {
    return FLUID_REQUEST_HANDLERS;
  }
}
