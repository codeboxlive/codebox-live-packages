import { type RequestHandlers } from "@codeboxlive/window-gateway";
/**
 * Fluid details interface
 */
export interface IFluidRequests extends RequestHandlers {
  getTenantInfo(): Promise<IFluidTenantInfo>;
  getFluidToken(body: IFluidTokenRequestBody): Promise<IFluidTokenInfo>;
  getFluidContainerId(): Promise<IFluidContainerInfo>;
  setFluidContainerId(
    body: ISetFluidContainerIdRequestBody
  ): Promise<IFluidContainerInfo>;
  getNtpTime(): Promise<INtpTimeInfo>;
  registerClientId(body: IUserRolesMessageBody): Promise<IRegisterClientIdInfo>;
  getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo>;
}

/**
 * Response for Fluid token
 */
export interface IFluidTokenInfo {
  token: string;
}
/**
 * Hub message request body
 * @hidden
 */
export interface IFluidTokenRequestBody {
  containerId?: string;
}
/**
 * Response for Fluid tenant info
 */
export interface IFluidTenantInfo {
  tenantId?: string;
  serviceEndpoint: string;
  type: "local" | "remote";
}
/**
 * Response for Fluid container info
 */
export interface IFluidContainerInfo {
  containerId: string | undefined;
  shouldCreate: boolean;
}
/**
 * Set container ID request body
 */
export interface ISetFluidContainerIdRequestBody {
  containerId: string;
}
/**
 * Response for get NPT time
 */
export interface INtpTimeInfo {
  ntpTime: string;
  ntpTimeInUTC: number;
}
/**
 * Allowed roles in Microsoft Teams (Live Share only)
 */
export enum UserRole {
  /**
   * The user is an external guest user.
   */
  guest = "Guest",

  /**
   * The user is a standard meeting attendee.
   */
  attendee = "Attendee",

  /**
   * The user has presenter privileges for the meeting.
   */
  presenter = "Presenter",

  /**
   * The user is a meeting organizer.
   */
  organizer = "Organizer",
}
/**
 * Response for get user roles (Live Share only)
 */
export interface IUserRolesInfo {
  userRoles: UserRole[] | undefined;
}
/**
 * Message body for registering clientId or getting user roles
 */
export interface IUserRolesMessageBody {
  clientId: string;
}
/**
 * Response for register clientId (Live Share only)
 */
export interface IRegisterClientIdInfo {
  userRoles: UserRole[] | undefined;
}
