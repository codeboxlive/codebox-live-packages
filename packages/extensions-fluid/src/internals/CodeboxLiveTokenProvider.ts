import { CodeboxLive } from "@codeboxlive/extensions-core";
import { ITokenProvider, ITokenResponse } from "@fluidframework/azure-client";

/**
 * Token Provider implementation for connecting to an Azure Function endpoint for
 * Azure Fluid Relay token resolution.
 */
export class CodeboxLiveTokenProvider implements ITokenProvider {
  private _cachedToken?: string;
  private _cachedDocumentId?: string;
  private _cachedTenantId?: string;

  public async fetchOrdererToken(
    tenantId: string,
    documentId?: string,
    refresh?: boolean
  ): Promise<ITokenResponse> {
    return this.getToken(tenantId, documentId, refresh);
  }

  public async fetchStorageToken(
    tenantId: string,
    documentId: string,
    refresh?: boolean
  ): Promise<ITokenResponse> {
    return this.getToken(tenantId, documentId, refresh);
  }

  private async getToken(
    tenantId: string,
    documentId?: string,
    refresh?: boolean
  ): Promise<ITokenResponse> {
    let fromCache: boolean;
    if (
      [
        !this._cachedToken,
        !!refresh,
        this._cachedTenantId !== tenantId,
        this._cachedDocumentId !== documentId,
      ].includes(true)
    ) {
      const tokenInfo = await CodeboxLive.fluid.getFluidToken({
        containerId: documentId,
      });
      this._cachedToken = tokenInfo.token;
      fromCache = false;
    } else {
      fromCache = true;
    }
    this._cachedTenantId = tenantId;
    if (documentId) {
      this._cachedDocumentId = documentId;
    }
    return {
      jwt: this._cachedToken!,
      fromCache,
    };
  }
}
