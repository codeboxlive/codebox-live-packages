import { HubArea } from "../HubArea";
import { RequestHandlers } from "../interfaces";
import { WindowGateway } from "../WindowGateway";

interface ISystemHubArea extends RequestHandlers {
  initialize(): Promise<void>;
}

export class SystemHubArea extends HubArea<ISystemHubArea> {
  constructor() {
    const requestHandlers: ISystemHubArea = {
      initialize(): Promise<void> {
        return Promise.resolve();
      },
    };
    super("<<<SYSTEM-AREA>>>", requestHandlers);
  }

  public override sendRequestWith(
    gateway: WindowGateway,
    bindThis = this
  ): ISystemHubArea {
    return {
      initialize(): Promise<void> {
        return bindThis.sendRequest(gateway, this.initialize);
      },
    };
  }
}
