import { CodeboxLiveMessaging } from "../../window-messaging";
import { UNKNOWN_ERROR } from "../../constants";
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
  IFluidDetails,
} from "../interfaces";
import { FluidDetailsMessageTypes } from "../message-types";

export class FluidDetails implements IFluidDetails {
  public async getTenantInfo(): Promise<IFluidTenantInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request tenant info
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IFluidTenantInfo>(
          FluidDetailsMessageTypes.GET_FLUID_TENANT_INFO
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async getFluidToken(containerId?: string): Promise<IFluidTokenInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const messageBody: IFluidTokenRequestBody = {
        containerId,
      };
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IFluidTokenInfo>(
          FluidDetailsMessageTypes.GET_FLUID_TOKEN,
          messageBody
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async getFluidContainerId(): Promise<IFluidContainerInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IFluidContainerInfo>(
          FluidDetailsMessageTypes.GET_FLUID_CONTAINER_ID
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async setFluidContainerId(
    containerId: string
  ): Promise<IFluidContainerInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const messageBody: ISetFluidContainerIdRequestBody = {
        containerId,
      };
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IFluidContainerInfo>(
          FluidDetailsMessageTypes.SET_FLUID_CONTAINER_ID,
          messageBody
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async getNtpTime(): Promise<INtpTimeInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<INtpTimeInfo>(
          FluidDetailsMessageTypes.GET_NTP_TIME
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async registerClientId(
    clientId: string
  ): Promise<IRegisterClientIdInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const messageBody: IUserRolesMessageBody = {
        clientId,
      };
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IRegisterClientIdInfo>(
          FluidDetailsMessageTypes.REGISTER_CLIENT_ROLES,
          messageBody
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }

  public async getUserRoles(clientId: string): Promise<IUserRolesInfo> {
    try {
      // Initialize if needed
      await CodeboxLiveMessaging.initializeIfNeeded();
      // Request token
      const messageBody: IUserRolesMessageBody = {
        clientId,
      };
      const response =
        await CodeboxLiveMessaging.parentMessenger!.sendRequest<IUserRolesInfo>(
          FluidDetailsMessageTypes.GET_USER_ROLES,
          messageBody
        );
      return response;
    } catch (error) {
      throw error instanceof Error ? error : UNKNOWN_ERROR;
    }
  }
}
