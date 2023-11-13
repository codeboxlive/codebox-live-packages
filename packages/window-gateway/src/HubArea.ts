import { RequestHandlers } from "./interfaces";
import { WindowGateway } from "./WindowGateway";

function toMappedHandler<TypedRequestHandlers extends RequestHandlers>(
  areaPath: string,
  requestHandlers: TypedRequestHandlers
) {
  let mappedRequestHandlers: RequestHandlers = {};
  Object.keys(requestHandlers).forEach((key) => {
    const newValueMapped = {
      [`${areaPath}/${key}`]: requestHandlers[key],
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
  return mappedRequestHandlers as TypedRequestHandlers;
}

/**
 * Class for a hub area, which could be either a parent or child window.
 * Facilitates communication between the two windows, with a common set of interfaces for requests.
 */
export class HubArea<
  TypedRequestHandlers extends RequestHandlers = RequestHandlers
> {
  private readonly areaPath: string;
  private _requestHandlers: TypedRequestHandlers;
  constructor(areaPath: string, requestHandlers: TypedRequestHandlers) {
    this.areaPath = areaPath;
    this._requestHandlers = toMappedHandler(this.areaPath, requestHandlers);
  }

  public get requestHandlers(): TypedRequestHandlers {
    return this._requestHandlers;
  }

  public set requestHandlers(value: TypedRequestHandlers) {
    this._requestHandlers = toMappedHandler(this.areaPath, value);
  }

  protected sendRequest<
    RequestBody extends object | undefined,
    ResponseType extends object | void
  >(
    gateway: WindowGateway,
    caller: Function,
    body?: RequestBody
  ): Promise<ResponseType> {
    const callerName = caller.name;
    return gateway.sendRequest<ResponseType>(
      `${this.areaPath}/${callerName}`,
      body
    );
  }

  public sendRequestWith(
    gateway: WindowGateway,
    bindThis: HubArea = this
  ): TypedRequestHandlers {
    throw Error("HubArea: Not implemented exception.");
  }
}
