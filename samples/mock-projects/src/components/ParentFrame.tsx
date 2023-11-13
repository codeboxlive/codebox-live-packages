import { useEffect, useRef } from "react";
import { UncleGatewayHub } from "@codeboxlive/uncle";
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
  UserRole,
  ContainerState,
  IClientInfo,
} from "@codeboxlive/hub-interfaces";

// View for ParentFrame
function ParentFrame() {
  const initializedRef = useRef(false);
  const containerIdRef = useRef<string>();
  const clientIdRef = useRef<string>();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Set up hub
    const fluidRequests: IFluidRequests = {
      async getTenantInfo(): Promise<IFluidTenantInfo> {
        return Promise.resolve({
          serviceEndpoint: "http://localhost:7070",
          ordererEndpoint: "",
          storageEndpoint: "",
          type: "local",
          tenantId: "",
        });
      },
      async getFluidToken(
        body: IFluidTokenRequestBody
      ): Promise<IFluidTokenInfo> {
        return Promise.resolve({
          token: `TEST-TOKEN${body.containerId ? `+${body.containerId}` : ""}`,
        });
      },
      async getFluidContainerId(): Promise<IFluidContainerInfo> {
        return Promise.resolve({
          containerId: containerIdRef.current,
          shouldCreate: !containerIdRef.current,
          containerState: ContainerState.alreadyExists,
          retryAfter: 30,
        });
      },
      async setFluidContainerId(
        body: ISetFluidContainerIdRequestBody
      ): Promise<IFluidContainerInfo> {
        containerIdRef.current = body.containerId;
        return Promise.resolve({
          containerId: containerIdRef.current,
          shouldCreate: !containerIdRef.current,
          containerState: ContainerState.added,
          retryAfter: 30,
        });
      },
      async getNtpTime(): Promise<INtpTimeInfo> {
        return Promise.resolve({
          ntpTime: new Date().toUTCString(),
          ntpTimeInUTC: new Date().getUTCDate(),
        });
      },
      async registerClientId(
        body: IUserRolesMessageBody
      ): Promise<IRegisterClientIdInfo> {
        clientIdRef.current = body.clientId;
        return Promise.resolve({
          userRoles: [
            UserRole.organizer,
            UserRole.presenter,
            UserRole.attendee,
          ],
        });
      },
      async getUserRoles(body: IUserRolesMessageBody): Promise<IUserRolesInfo> {
        if (clientIdRef.current !== body.clientId) {
          return Promise.resolve({
            userRoles: [],
          });
        }
        return Promise.resolve({
          userRoles: [
            UserRole.organizer,
            UserRole.presenter,
            UserRole.attendee,
          ],
        });
      },
      async getClientInfo(
        body: IUserRolesMessageBody
      ): Promise<IClientInfo | undefined> {
        if (clientIdRef.current !== body.clientId) {
          return Promise.resolve({
            userId: "user1",
            displayName: "User 1",
            roles: [],
          });
        }
        return Promise.resolve({
          userId: "user2",
          displayName: "User 2",
          roles: [UserRole.organizer, UserRole.presenter, UserRole.attendee],
        });
      },
    };
    UncleGatewayHub.initialize(fluidRequests);
  });

  return (
    <>
      <iframe width={720} height={520} src={window.location.origin} />
    </>
  );
}

export default ParentFrame;
