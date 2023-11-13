import { CodeboxLiveGateway } from "../window-gateway";
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
  IClientInfo,
  FLUID_AREA_PATH,
} from "@codeboxlive/hub-interfaces";
import { HubArea, WindowGateway } from "@codeboxlive/window-gateway";
import { FLUID_REQUEST_HANDLERS, NOT_INITIALIZED_HANDLER } from "./internal";

export class FluidRequests extends HubArea<IFluidRequests> {
  constructor() {
    super(FLUID_AREA_PATH, FLUID_REQUEST_HANDLERS);
  }

  public override sendRequestWith(
    gateway: WindowGateway,
    bindThis = this
  ): IFluidRequests {
    return {
      async getTenantInfo(): Promise<IFluidTenantInfo> {
        return bindThis.sendRequest(gateway, this.getTenantInfo);
      },
      async getFluidToken(
        body: IFluidTokenRequestBody
      ): Promise<IFluidTokenInfo> {
        return bindThis.sendRequest(gateway, this.getFluidToken, body);
      },
      async getFluidContainerId(): Promise<IFluidContainerInfo> {
        return bindThis.sendRequest(gateway, this.getFluidContainerId);
      },
      async setFluidContainerId(
        body: ISetFluidContainerIdRequestBody
      ): Promise<IFluidContainerInfo> {
        return bindThis.sendRequest(gateway, this.setFluidContainerId, body);
      },
      async getNtpTime(): Promise<INtpTimeInfo> {
        return bindThis.sendRequest(gateway, this.getNtpTime);
      },
      async registerClientId(
        body: IUserRolesMessageBody
      ): Promise<IRegisterClientIdInfo> {
        return bindThis.sendRequest(gateway, this.registerClientId, body);
      },
      async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
        return bindThis.sendRequest(gateway, this.getUserRoles, body);
      },
      async getClientInfo(
        body: IUserRolesMessageBody
      ): Promise<IClientInfo | undefined> {
        return bindThis.sendRequest(gateway, this.getClientInfo, body);
      },
    };
  }

  public getRequestsToParent(): IFluidRequests {
    if (!CodeboxLiveGateway.isInitialized) {
      return NOT_INITIALIZED_HANDLER;
    }
    return this.sendRequestWith(CodeboxLiveGateway.parentGateway!);
  }
}
