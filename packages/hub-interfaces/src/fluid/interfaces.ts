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
  getClientInfo(body: IUserRolesMessageBody): Promise<IClientInfo | undefined>;
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
  tenantId: string;
  serviceEndpoint: string;
  type: "local" | "remote";
  /**
   * @deprecated
   * As of Fluid 1.0 this configuration information has been deprecated in favor of
   * `serviceEndpoint`.
   */
  ordererEndpoint: string;
  /**
   * @deprecated
   * As of Fluid 1.0 this configuration information has been deprecated in favor of
   * `serviceEndpoint`.
   */
  storageEndpoint: string;
}
/**
 * State of the current Live Share sessions backing fluid container.
 */
export enum ContainerState {
  /**
   * The call to `LiveShareHost.setContainerId()` successfully created the container mapping
   * for the current Live Share session.
   */
  added = "Added",

  /**
   * A container mapping for the current Live Share Session already exists and should be used
   * when joining the sessions Fluid container.
   */
  alreadyExists = "AlreadyExists",

  /**
   * The call to `LiveShareHost.setContainerId()` failed to create the container mapping due to
   * another client having already set the container ID for the current Live Share session.
   */
  conflict = "Conflict",

  /**
   * A container mapping for the current Live Share session doesn't exist yet.
   */
  notFound = "NotFound",
}
/**
 * Response for Fluid container info
 */
export interface IFluidContainerInfo {
  /**
   * State of the containerId mapping.
   */
  containerState: ContainerState;
  containerId: string | undefined;
  shouldCreate: boolean;
  /**
   * If `containerId` is undefined and `shouldCreate` is false, the container isn't ready but
   * another client is creating it. The local client should wait the specified amount of time and
   * then ask for the container info again.
   */
  retryAfter: number;
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

/**
 * Returned from `LiveShareHost.getClientInfo()` to specify the user information for a given `clientId`.
 * Each user individually requests this data for each other user in the session, making it secure & trusted.
 */
export interface IClientInfo {
  /**
   * The codebox user identifier that corresponds to the provided client identifier.
   */
  userId: string;
  /**
   * List of roles of the user.
   */
  roles: UserRole[];
  /**
   * Optional. The display name for the user.
   */
  displayName?: string;
}
