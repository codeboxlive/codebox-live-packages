/*!
 * This file is copyrighted and licensed separately from the rest
 * of this package. Before using this package in your app, please be
 * aware of the license terms of Live Share.
 *
 * See license: https://github.com/microsoft/live-share-sdk/blob/main/LICENSE
 */
import { IRoleVerifier, UserMeetingRole } from "@microsoft/live-share";
import { CodeboxLive } from "@codeboxlive/extensions-core";
import { UserRole } from "@codeboxlive/hub-interfaces";

/**
 * @hidden
 * Implements a role verifier.
 */
export class RoleVerifier implements IRoleVerifier {
  private roleCache: Map<string, UserRole[]> = new Map();

  public addClient(clientId: string, roles: UserRole[]): this {
    this.roleCache.set(clientId, roles);
    return this;
  }

  public async getClientRoles(clientId: string): Promise<UserMeetingRole[]> {
    if (!clientId) {
      throw new Error(
        `LocalRoleVerifier: called getClientRoles() without a clientId`
      );
    }

    let roles: UserRole[];
    if (this.roleCache.has(clientId)) {
      roles = this.roleCache.get(clientId)!;
    } else {
      const rolesResponse = await CodeboxLive.fluid.getUserRoles({
        clientId,
      });
      roles = rolesResponse.userRoles!;
    }

    return Promise.resolve(roles as unknown as UserMeetingRole[]);
  }

  public async registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    const rolesResponse = await CodeboxLive.fluid.registerClientId({
      clientId,
    });
    return Promise.resolve(
      rolesResponse.userRoles as unknown as UserMeetingRole[]
    );
  }

  public async verifyRolesAllowed(
    clientId: string,
    allowedRoles: UserMeetingRole[]
  ): Promise<boolean> {
    if (!clientId) {
      throw new Error(
        `LocalRoleVerifier: called verifyRolesAllowed() without a clientId`
      );
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      const roles = await this.getClientRoles(clientId);
      for (let i = 0; i < allowedRoles.length; i++) {
        const role = allowedRoles[i];
        if (roles.indexOf(role) >= 0) {
          return true;
        }
      }

      return false;
    }

    return true;
  }
}
