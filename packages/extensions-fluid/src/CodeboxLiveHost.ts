import {
  IClientInfo,
  IFluidContainerInfo,
  IFluidTenantInfo,
  INtpTimeInfo,
  UserRole,
} from "@codeboxlive/hub-interfaces";
import { CodeboxLive } from "@codeboxlive/extensions-core";

function isUserMeetingRole(value: any): value is UserRole {
  if (Object.values(UserRole).includes(value)) {
    return true;
  }
  return false;
}

function isUserMeetingRoleList(value: any): value is UserRole[] {
  if (Array.isArray(value)) {
    return value.every((role) => isUserMeetingRole(role));
  }
  return false;
}

function isClientInfo(value: any): value is IClientInfo {
  return [
    typeof value.userId === "string",
    isUserMeetingRoleList(value.roles),
    value.displayName === undefined || typeof value.displayName === "string",
  ].every((val) => val === true);
}

/**
 * Codebox ILiveShareHost class
 */
export class CodeboxLiveHost {
  async getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    const frsTenantInfo = await CodeboxLive.fluid.getTenantInfo();
    return frsTenantInfo;
  }
  async getFluidToken(containerId?: string | undefined): Promise<string> {
    const tokenInfo = await CodeboxLive.fluid.getFluidToken({
      containerId,
    });
    return tokenInfo.token;
  }
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    const containerInfo = await CodeboxLive.fluid.getFluidContainerId();
    return containerInfo;
  }
  async setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    const containerInfo = await CodeboxLive.fluid.setFluidContainerId({
      containerId,
    });
    return containerInfo;
  }
  async getNtpTime(): Promise<INtpTimeInfo> {
    const nptInfo = await CodeboxLive.fluid.getNtpTime();
    return nptInfo;
  }
  async registerClientId(clientId: string): Promise<UserRole[]> {
    const roleInfo = await CodeboxLive.fluid.registerClientId({
      clientId,
    });
    if (isUserMeetingRoleList(roleInfo.userRoles)) {
      return roleInfo.userRoles;
    }
    return [];
  }
  async getClientRoles(clientId: string): Promise<UserRole[] | undefined> {
    const roleInfo = await CodeboxLive.fluid.getUserRoles({
      clientId,
    });
    if (isUserMeetingRoleList(roleInfo.userRoles)) {
      return roleInfo.userRoles;
    }
    return [];
  }
  async getClientInfo(clientId: string): Promise<IClientInfo | undefined> {
    const clientInfo = await CodeboxLive.fluid.getClientInfo({
      clientId,
    });
    if (clientInfo === undefined || isClientInfo(clientInfo)) {
      return clientInfo;
    }
    throw new Error(
      `CodeboxLiveHost.getClientInfo: invalid response of ${clientInfo}`
    );
  }
}
