import {
  WindowMessagingHub,
  RequestHandler,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import { ITestRequestBody, ITestResponse } from "../interfaces";

function ParentFrame() {
  const initializedRef = useRef(false);
  const iFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [childMessenger, setChildMessenger] = useState<WindowMessenger>();

  useEffect(() => {
    if (initializedRef.current || !iFrameRef.current) return;
    initializedRef.current = true;
    // Set up hub
    const requestHandlers = new Map<string, RequestHandler<any, any>>();
    const testRequestHandler: RequestHandler<
      ITestRequestBody,
      ITestResponse
    > = (data: ITestRequestBody): Promise<ITestResponse> => {
      return new Promise<ITestResponse>((resolve, reject) => {
        if (data.value < 10) {
          resolve({
            value: data.value + 1,
          });
        } else {
          reject(new Error("Max value is 10"));
        }
      });
    };
    requestHandlers.set("test-request", testRequestHandler);
    const hub = new WindowMessagingHub(
      [window.location.origin],
      requestHandlers
    );
    hub.addEventListener("registerWindowMessenger", (evt) => {
      console.log(evt);
      setChildMessenger(evt.windowMessenger);
    });
  });

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <button
          disabled={!childMessenger}
          onClick={() => {
            // Send a one-way message to child
            childMessenger?.sendMessage("test-message", {
              randomNumber: Math.round(Math.random() * 100),
            });
          }}
        >
          {"Send random number to child"}
        </button>
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
