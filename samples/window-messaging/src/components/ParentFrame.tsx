import {
  WindowMessagingHub,
  WindowMessenger,
  HubArea,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import { HUB_KEY } from "../constants";
import {
  ITestHubAreaRequests,
  ITestMessageBody,
  ITestRequestBody,
  ITestResponse,
} from "../interfaces";

// HubArea implementation for parent window.
export class ParentTestHubArea extends HubArea {
  constructor() {
    // Declare request handlers for incoming requests
    const requestHandlers: ITestHubAreaRequests = {
      getTransformedValue(body: ITestRequestBody): Promise<ITestResponse> {
        return Promise.resolve({
          value: body.value + 1,
        });
      },
      sendRandomValue(body: ITestMessageBody): Promise<void> {
        return Promise.reject(
          new Error(
            "ParentTestHubArea: child should not be requesting random numbers, how dare you"
          )
        );
      },
    };
    super(HUB_KEY, requestHandlers);
  }

  // Declare requestWith handler for initiating a new request to a given iFrame window
  public override sendRequestWith(
    messenger: WindowMessenger,
    bindThis = this
  ): ITestHubAreaRequests {
    return {
      getTransformedValue(body: ITestRequestBody): Promise<ITestResponse> {
        return Promise.reject(
          new Error(
            "ParentTestHubArea: cannot call testRequestHandler from parent frame"
          )
        );
      },
      sendRandomValue(body: ITestMessageBody): Promise<void> {
        return bindThis.sendRequest(messenger, this.sendRandomValue, body);
      },
    };
  }
}

// View for ParentFrame
function ParentFrame() {
  const initializedRef = useRef(false);
  const iFrameRef = useRef<HTMLIFrameElement | null>(null);
  const hubAreaRef = useRef(new ParentTestHubArea());
  const [childMessenger, setChildMessenger] = useState<WindowMessenger>();
  const [numberMessagesSent, setNumberMessagesSent] = useState<number>(0);

  useEffect(() => {
    if (initializedRef.current || !iFrameRef.current) return;
    initializedRef.current = true;
    // Set up hub
    const hub = new WindowMessagingHub(
      HUB_KEY,
      [window.location.origin],
      [hubAreaRef.current]
    );
    hub.addEventListener("registerWindowMessenger", (evt) => {
      setChildMessenger(evt.windowMessenger);
    });
  });

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <button
          disabled={!childMessenger}
          onClick={async () => {
            // Send a one-way message to child
            await hubAreaRef.current
              .sendRequestWith(childMessenger!)
              .sendRandomValue({
                randomNumber: Math.round(Math.random() * 100),
              });
            // Increment our number of messages successfully sent
            setNumberMessagesSent(numberMessagesSent + 1);
          }}
        >
          {"Send random number to child"}
        </button>
        <div>{`# of random numbers sent: ${numberMessagesSent}`}</div>
      </div>
      <iframe
        ref={iFrameRef}
        width={720}
        height={520}
        src={window.location.origin}
      />
    </>
  );
}

export default ParentFrame;
