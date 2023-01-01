import {
  IFluidContainerInfo,
  IFluidTenantInfo,
  ILiveShareHost,
  INtpTimeInfo,
  UserMeetingRole,
} from "@microsoft/live-share";
import { CodeboxLive } from "@codeboxlive/extensions-core";

function isUserMeetingRole(value: any): value is UserMeetingRole {
  if (Object.values(UserMeetingRole).includes(value)) {
    return true;
  }
  return false;
}

function isUserMeetingRoleList(value: any): value is UserMeetingRole[] {
  if (Array.isArray(value)) {
    return value.every((role) => isUserMeetingRole(role));
  }
  return false;
}

export class CodeboxLiveHost implements ILiveShareHost {
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
  async registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    const roleInfo = await CodeboxLive.fluid.registerClientId({
      clientId,
    });
    if (isUserMeetingRoleList(roleInfo.userRoles)) {
      return roleInfo.userRoles;
    }
    return [];
  }
  async getClientRoles(
    clientId: string
  ): Promise<UserMeetingRole[] | undefined> {
    const roleInfo = await CodeboxLive.fluid.getUserRoles({
      clientId,
    });
    if (isUserMeetingRoleList(roleInfo.userRoles)) {
      return roleInfo.userRoles;
    }
    return [];
  }
}
