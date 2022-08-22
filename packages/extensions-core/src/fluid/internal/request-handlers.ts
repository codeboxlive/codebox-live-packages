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
} from "@codeboxlive/hub-interfaces";

/**
 * This hub is only intended for use in child clients, and thus cannot handle requests
 */
export const FLUID_REQUEST_HANDLERS: IFluidRequests = {
  async getTenantInfo(): Promise<IFluidTenantInfo> {
    throw new Error(
      "FluidRequests.getTenantInfo: Cannot process inbound requests in Codebox Project."
    );
  },
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    throw new Error(
      "FluidRequests.getFluidToken: Cannot process inbound requests in Codebox Project."
    );
  },
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.getFluidContainerId: Cannot process inbound requests in Codebox Project."
    );
  },
  async setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.setFluidContainerId: Cannot process inbound requests in Codebox Project."
    );
  },
  async getNtpTime(): Promise<INtpTimeInfo> {
    throw new Error(
      "FluidRequests.getNtpTime: Cannot process inbound requests in Codebox Project."
    );
  },
  async registerClientId(
    body: IUserRolesMessageBody
  ): Promise<IRegisterClientIdInfo> {
    throw new Error(
      "FluidRequests.registerClientId: Cannot process inbound requests in Codebox Project."
    );
  },
  async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
    throw new Error(
      "FluidRequests.getUserRoles: Cannot process inbound requests in Codebox Project."
    );
  },
};
