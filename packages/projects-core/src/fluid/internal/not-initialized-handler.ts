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
export const NOT_INITIALIZED_HANDLER: IFluidRequests = {
  async getTenantInfo(): Promise<IFluidTenantInfo> {
    throw new Error(
      "FluidRequests.getTenantInfo: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo> {
    throw new Error(
      "FluidRequests.getFluidToken: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.getFluidContainerId: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo> {
    throw new Error(
      "FluidRequests.setFluidContainerId: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async getNtpTime(): Promise<INtpTimeInfo> {
    throw new Error(
      "FluidRequests.getNtpTime: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async registerClientId(
    body: IUserRolesMessageBody
  ): Promise<IRegisterClientIdInfo> {
    throw new Error(
      "FluidRequests.registerClientId: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
  async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
    throw new Error(
      "FluidRequests.getUserRoles: not initialized. Use `await CodeSandboxClient.initialize()` and try again."
    );
  },
};
