import { CodeboxLiveMessaging } from "../window-messaging";
import {
  IFluidTenantInfo,
  IFluidTokenRequestBody,
  IFluidTokenInfo,
  IFluidContainerInfo,
  ISetFluidContainerIdRequestBody,
  INtpTimeInfo,
  IUserRolesInfo,
  IUserRolesMessageBody,
  IRegisterClientIdInfo,
  IFluidRequests,
  FLUID_AREA_PATH,
} from "@codeboxlive/hub-interfaces";
import { HubArea, WindowMessenger } from "@codeboxlive/window-messaging";
import { FLUID_REQUEST_HANDLERS, NOT_INITIALIZED_HANDLER } from "./internal";

export class FluidRequests extends HubArea<IFluidRequests> {
  constructor() {
    super(FLUID_AREA_PATH, FLUID_REQUEST_HANDLERS);
  }

  public override sendRequestWith(
    messenger: WindowMessenger,
    bindThis = this
  ): IFluidRequests {
    return {
      async getTenantInfo(): Promise<IFluidTenantInfo> {
        return bindThis.sendRequest(messenger, this.getTenantInfo);
      },
      async getFluidToken(
        body: IFluidTokenRequestBody
      ): Promise<IFluidTokenInfo> {
        return bindThis.sendRequest(messenger, this.getFluidToken, body);
      },
      async getFluidContainerId(): Promise<IFluidContainerInfo> {
        return bindThis.sendRequest(messenger, this.getFluidContainerId);
      },
      async setFluidContainerId(
        body: ISetFluidContainerIdRequestBody
      ): Promise<IFluidContainerInfo> {
        return bindThis.sendRequest(messenger, this.setFluidContainerId, body);
      },
      async getNtpTime(): Promise<INtpTimeInfo> {
        return bindThis.sendRequest(messenger, this.getNtpTime);
      },
      async registerClientId(
        body: IUserRolesMessageBody
      ): Promise<IRegisterClientIdInfo> {
        return bindThis.sendRequest(messenger, this.registerClientId, body);
      },
      async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
        return bindThis.sendRequest(messenger, this.getUserRoles, body);
      },
    };
  }

  public getRequestsToParent(): IFluidRequests {
    if (!CodeboxLiveMessaging.isInitialized) {
      return NOT_INITIALIZED_HANDLER;
    }
    return this.sendRequestWith(CodeboxLiveMessaging.parentMessenger!);
  }
}
