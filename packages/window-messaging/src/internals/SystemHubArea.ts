import { HubArea } from "../HubArea";
import { RequestHandlers } from "../interfaces";
import { WindowMessenger } from "../WindowMessenger";

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
    messenger: WindowMessenger,
    bindThis = this
  ): ISystemHubArea {
    return {
      initialize(): Promise<void> {
        return bindThis.sendRequest(messenger, this.initialize);
      },
    };
  }
}
