import { RequestHandlers } from "./interfaces";
import { WindowMessenger } from "./WindowMessenger";

export class HubArea<
  TypedRequestHandlers extends RequestHandlers = RequestHandlers
> {
  private readonly areaPath: string;
  private readonly _requestHandlers: TypedRequestHandlers;
  constructor(areaPath: string, requestHandlers: TypedRequestHandlers) {
    this.areaPath = areaPath;
    let mappedRequestHandlers: RequestHandlers = {};
    Object.keys(requestHandlers).forEach((key) => {
      const newValueMapped = {
        [`${this.areaPath}/${key}`]: requestHandlers[key],
      };
      if (mappedRequestHandlers) {
        mappedRequestHandlers = {
          ...mappedRequestHandlers,
          ...newValueMapped,
        };
      } else {
        mappedRequestHandlers = { ...newValueMapped };
      }
    });
    this._requestHandlers = mappedRequestHandlers as TypedRequestHandlers;
  }

  public get requestHandlers(): TypedRequestHandlers {
    return this._requestHandlers;
  }

  protected sendRequest<
    MessageBody extends object | undefined,
    ResponseType extends object | void
  >(
    messenger: WindowMessenger,
    caller: Function,
    body?: MessageBody
  ): Promise<ResponseType> {
    const callerName = caller.name;
    return messenger.sendRequest<ResponseType>(
      `${this.areaPath}/${callerName}`,
      body
    );
  }

  public sendRequestWith(
    messenger: WindowMessenger,
    bindThis: HubArea = this
  ): TypedRequestHandlers {
    throw Error("HubArea: Not implemented exception.");
  }
}
