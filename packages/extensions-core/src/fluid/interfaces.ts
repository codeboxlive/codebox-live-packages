export interface IFluidDetails {
  getTenantInfo(): Promise<IFluidTenantInfo>;
  getFluidToken(containerId?: string): Promise<IFluidTokenInfo>;
  getFluidContainerId(): Promise<IFluidContainerInfo>;
  setFluidContainerId(containerId: string): Promise<IFluidContainerInfo>;
  getNtpTime(): Promise<INtpTimeInfo>;
  registerClientId(clientId: string): Promise<IRegisterClientIdInfo>;
  getUserRoles(clientId: string): Promise<IUserRolesInfo>;
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
 * @hidden
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
 * @hidden
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
