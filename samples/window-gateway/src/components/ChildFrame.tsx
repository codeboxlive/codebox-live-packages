import {
  HubArea,
  WindowGatewayHub,
  WindowGateway,
} from "@codeboxlive/window-gateway";
import { useEffect, useRef, useState } from "react";
import { HUB_KEY } from "../constants";
import {
  ITestHubAreaRequests,
  ITestMessageBody,
  ITestRequestBody,
  ITestResponse,
} from "../interfaces";

// HubArea implementation for child window.
export class ChildTestHubArea extends HubArea<ITestHubAreaRequests> {
  constructor(onReceivedRandomNumber: (randomNumber: number) => void) {
    // Declare request handlers for incoming requests
    const requestHandlers: ITestHubAreaRequests = {
      getTransformedValue(body: ITestRequestBody): Promise<ITestResponse> {
        return Promise.reject(
          new Error("ChildTestHubArea: Only the parent can transform values")
        );
      },
      sendRandomValue(body: ITestMessageBody): Promise<void> {
        onReceivedRandomNumber(body.randomNumber);
        return Promise.resolve();
      },
    };
    super(HUB_KEY, requestHandlers);
  }

  // Declare requestWith handler for initiating a new request to a given iFrame window
  public override sendRequestWith(
    gateway: WindowGateway,
    bindThis = this
  ): ITestHubAreaRequests {
    return {
      getTransformedValue(body: ITestRequestBody): Promise<ITestResponse> {
        return bindThis.sendRequest(gateway, this.getTransformedValue, body);
      },
      sendRandomValue(body: ITestMessageBody): Promise<void> {
        return Promise.reject(
          new Error(
            "ChildTestHubArea: child can't send random values to parent"
          )
        );
      },
    };
  }
}

// View for ChildFrame
function ChildFrame() {
  const [gateway, setGateway] = useState<WindowGateway>();

  const [number, setNumber] = useState(0);
  const [randomNumber, setRandomNumber] = useState<number>();
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);
  const hubAreaRef = useRef(new ChildTestHubArea(setRandomNumber));

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      const hub = new WindowGatewayHub(
        HUB_KEY,
        [window.location.origin],
        [hubAreaRef.current]
      );
      const parentGateway = await hub.registerGateway(parent);
      setGateway(parentGateway);
    };
    setupHub();
  });

  return (
    <>
      {!gateway && <div>{"loading..."}</div>}
      {gateway && (
        <>
          <button
            onClick={() => {
              // Send a request to parent to change the number
              hubAreaRef.current
                .sendRequestWith(gateway!)
                .getTransformedValue({
                  value: number,
                })
                .then((response) => {
                  setNumber(response.value);
                })
                .catch((err) => {
                  if (err instanceof Error) {
                    setError(err);
                  }
                });
            }}
          >
            {"Get number from parent"}
          </button>
          <h2>{number}</h2>
        </>
      )}
      {error && (
        <>
          <div style={{ color: "red" }}>{error.message}</div>
          <button
            onClick={() => {
              // Reset number and error
              setNumber(0);
              setError(undefined);
            }}
          >
            {"Reset number"}
          </button>
        </>
      )}
      <div style={{ marginTop: "24px" }}>
        {"Last random number from parent:"}
      </div>
      <h2>{randomNumber ?? "N/A"}</h2>
    </>
  );
}

export default ChildFrame;
