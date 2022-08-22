import { ProjectsMessagingHub } from "../window-messaging";
import {
  IFluidRequests,
  FLUID_AREA_PATH,
} from "@codeboxlive/hub-interfaces";
import { HubArea, WindowMessenger } from "@codeboxlive/window-messaging";
import { FLUID_REQUEST_HANDLERS } from "./internal";

export class FluidRequests extends HubArea<IFluidRequests> {
  constructor(requestHandlers: IFluidRequests) {
    super(FLUID_AREA_PATH, requestHandlers);
  }

  public override sendRequestWith(
    messenger: WindowMessenger,
    bindThis = this
  ): IFluidRequests {
    return FLUID_REQUEST_HANDLERS;
  }
}
