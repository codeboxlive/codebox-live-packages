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
} from "@codeboxlive/hub-interfaces";

/**
 * This hub is only intended for use in child clients, and thus cannot handle requests
 */
export const FLUID_REQUEST_HANDLERS: IFluidRequests = {
  async getTenantInfo(): Promise<IFluidTenantInfo> {
    throw new Error(
      "FluidRequests.getTenantInfo: Cannot request details from child sandbox hub."
    );
  },
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    throw new Error(
      "FluidRequests.getFluidToken: Cannot request details from child sandbox hub."
    );
  },
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.getFluidContainerId: Cannot request details from child sandbox hub."
    );
  },
  async setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.setFluidContainerId: Cannot request details from child sandbox hub."
    );
  },
  async getNtpTime(): Promise<INtpTimeInfo> {
    throw new Error(
      "FluidRequests.getNtpTime: Cannot request details from child sandbox hub."
    );
  },
  async registerClientId(
    body: IUserRolesMessageBody
  ): Promise<IRegisterClientIdInfo> {
    throw new Error(
      "FluidRequests.registerClientId: Cannot request details from child sandbox hub."
    );
  },
  async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
    throw new Error(
      "FluidRequests.getUserRoles: Cannot request details from child sandbox hub."
    );
  },
  async getClientInfo(
    body: IUserRolesMessageBody
  ): Promise<IClientInfo | undefined> {
    throw new Error(
      "FluidRequests.getClientInfo: Cannot request details from child sandbox hub."
    );
  },
};
