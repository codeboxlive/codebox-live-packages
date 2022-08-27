/*!
 * This file is copyrighted and licensed separately from the rest
 * of this package. Before using this package in your app, please be
 * aware of the license terms of Live Share.
 *
 * See license: https://github.com/microsoft/live-share-sdk/blob/main/LICENSE
 */
import { IFluidContainer, ContainerSchema } from "@fluidframework/fluid-static";
import {
  AzureClient,
  AzureConnectionConfig,
  AzureContainerServices,
  AzureRemoteConnectionConfig,
  ITelemetryBaseLogger,
} from "@fluidframework/azure-client";
import { RoleVerifier, SharedClock } from "./internals";
import { CodeboxLive } from "@codeboxlive/extensions-core";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { EphemeralEvent } from "@microsoft/live-share";
import { CodeboxLiveTokenProvider } from "./internals/CodeboxLiveTokenProvider";

/**
 * Options used to configure the `CodeboxLiveFluidClient` class.
 */
export interface ICodeboxLiveFluidClientOptions {
  /**
   * Optional. Configuration to use when connecting to a custom Azure Fluid Relay instance.
   */
  readonly connection?: AzureConnectionConfig;

  /**
   * Optional. A logger instance to receive diagnostic messages.
   */
  readonly logger?: ITelemetryBaseLogger;
}

export class CodeboxLiveFluidClient {
  private readonly _options: ICodeboxLiveFluidClientOptions;
  private _clock?: SharedClock;
  private _roleVerifier?: RoleVerifier;

  /**
   * Creates a new `CodeboxLiveFluidClient` instance.
   * @param options Configuration options for the client.
   */
  constructor(options?: ICodeboxLiveFluidClientOptions) {
    // Save props
    this._options = Object.assign(
      {} as ICodeboxLiveFluidClientOptions,
      options
    );
  }

  /**
   * If true the client is configured to use a local test server.
   */
  public get isTesting(): boolean {
    return this._options.connection?.type == "local";
  }

  /**
   * Number of times the client should attempt to get the ID of the container to join for the
   * current context.
   */
  public maxContainerLookupTries = 3;

  /**
   * Connects to the fluid container that correlates with the container used by the parent iFrame.
   * This is not the same container used by the parent iFrame in the code sandbox.
   *
   * @remarks
   * The first client joining the container will create the container resulting in the
   * `onContainerFirstCreated` callback being called. This callback can be used to set the initial
   * state of of the containers object prior to the container being attached.
   * @param fluidContainerSchema Fluid objects to create.
   * @param onContainerFirstCreated Optional. Callback that's called when the container is first created.
   * @returns The fluid `container` and `services` objects to use along with a `created` flag that if true means the container had to be created.
   */
  public async joinContainer(
    fluidContainerSchema: ContainerSchema,
    onContainerFirstCreated?: (container: IFluidContainer) => void
  ): Promise<{
    container: IFluidContainer;
    services: AzureContainerServices;
    created: boolean;
  }> {
    try {
      // Configure role verifier and timestamp provider
      const pRoleVerifier = this.initializeRoleVerifier();
      const pTimestampProvider = this.initializeTimestampProvider();

      // Initialize FRS connection config
      let config: AzureConnectionConfig | undefined = this._options.connection;
      if (!config) {
        const frsTenantInfo = await CodeboxLive.fluid.getTenantInfo();

        // Compute endpoint
        let endpoint = frsTenantInfo.serviceEndpoint;

        // Is this a local config?
        if (frsTenantInfo.type == "local") {
          config = {
            type: "local",
            endpoint,
            tokenProvider: new InsecureTokenProvider("", { id: "test-user" }),
          };
        } else {
          config = {
            type: "remote",
            tenantId: frsTenantInfo.tenantId,
            endpoint: endpoint,
            tokenProvider: new CodeboxLiveTokenProvider(),
          } as AzureRemoteConnectionConfig;
        }
      }

      // Create FRS client
      const client = new AzureClient({
        connection: config,
        logger: this._options.logger,
      });

      // Create container on first access
      const pContainer = this.getOrCreateContainer(
        client,
        fluidContainerSchema,
        0,
        onContainerFirstCreated
      );

      // Wait in parallel for everything to finish initializing.
      const result = await Promise.all([
        pContainer,
        pRoleVerifier,
        pTimestampProvider,
      ]);

      // Wait for containers socket to connect
      let connected = false;
      const { container, services } = result[0];
      container.on("connected", async () => {
        if (!connected) {
          connected = true;
        }

        // Register any new clientId's
        // - registerClientId() will only register a client on first use
        if (this._roleVerifier) {
          const connections = services.audience.getMyself()?.connections ?? [];
          for (let i = 0; i < connections.length; i++) {
            try {
              const clientId = connections[i]?.id;
              if (clientId) {
                await this._roleVerifier?.registerClientId(clientId);
              }
            } catch (err: any) {
              console.error(err.toString());
            }
          }
        }
      });

      return result[0];
    } catch (err: any) {
      throw err;
    }
  }

  /**
   * @hidden
   */
  protected initializeRoleVerifier(): Promise<void> {
    if (!this._roleVerifier && !this.isTesting) {
      this._roleVerifier = new RoleVerifier();

      // Register role verifier as current verifier for events
      EphemeralEvent.setRoleVerifier(this._roleVerifier);
    }

    return Promise.resolve();
  }

  /**
   * @hidden
   */
  protected initializeTimestampProvider(): Promise<void> {
    if (!this._clock && !this.isTesting) {
      this._clock = new SharedClock();

      // Register clock as current timestamp provider for events
      EphemeralEvent.setTimestampProvider(this._clock);

      // Start the clock
      return this._clock.start();
    } else {
      return Promise.resolve();
    }
  }

  private async getOrCreateContainer(
    client: AzureClient,
    fluidContainerSchema: ContainerSchema,
    tries: number,
    onInitializeContainer?: (container: IFluidContainer) => void
  ): Promise<{
    container: IFluidContainer;
    services: AzureContainerServices;
    created: boolean;
  }> {
    // Get container ID mapping
    const containerInfo = await CodeboxLive.fluid.getFluidContainerId();
    const retryAfter = 500;

    // Create container on first access
    if (containerInfo.shouldCreate) {
      return await this.createNewContainer(
        client,
        fluidContainerSchema,
        tries,
        onInitializeContainer
      );
    } else if (containerInfo.containerId) {
      return {
        created: false,
        ...(await client.getContainer(
          containerInfo.containerId,
          fluidContainerSchema
        )),
      };
    } else if (tries < this.maxContainerLookupTries && retryAfter > 0) {
      await this.wait(retryAfter);
      return await this.getOrCreateContainer(
        client,
        fluidContainerSchema,
        tries + 1,
        onInitializeContainer
      );
    } else {
      throw new Error(
        `CodeboxLiveFluidClient: timed out attempting to create or get container for current context.`
      );
    }
  }

  private async createNewContainer(
    client: AzureClient,
    fluidContainerSchema: ContainerSchema,
    tries: number,
    onInitializeContainer?: (container: IFluidContainer) => void
  ): Promise<{
    container: IFluidContainer;
    services: AzureContainerServices;
    created: boolean;
  }> {
    // Create and initialize container
    const { container, services } = await client.createContainer(
      fluidContainerSchema
    );
    if (onInitializeContainer) {
      onInitializeContainer(container);
    }

    // Attach container to service
    const newContainerId = await container.attach();

    // Attempt to save container ID mapping
    const containerInfo = await CodeboxLive.fluid.setFluidContainerId({
      containerId: newContainerId,
    });
    if (containerInfo.containerId !== newContainerId) {
      // Delete created container
      container.dispose();

      // Get mapped container ID
      return {
        created: false,
        ...(await client.getContainer(
          containerInfo.containerId!,
          fluidContainerSchema
        )),
      };
    } else {
      return { container, services, created: true };
    }
  }

  private wait(delay: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), delay);
    });
  }
}
