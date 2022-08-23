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
          type: "local",
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
        });
      },
      async setFluidContainerId(
        body: ISetFluidContainerIdRequestBody
      ): Promise<IFluidContainerInfo> {
        containerIdRef.current = body.containerId;
        return Promise.resolve({
          containerId: containerIdRef.current,
          shouldCreate: !containerIdRef.current,
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
