import {
  WindowMessagingHub,
  RequestHandler,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef } from "react";
import { ITestMessageBody, ITestResponse } from "../interfaces";

function ParentFrame() {
  const initializedRef = useRef(false);
  const iFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (initializedRef.current || !iFrameRef.current) return;
    initializedRef.current = true;
    // Set up hub
    const requestHandlers = new Map<string, RequestHandler<any, any>>();
    const testRequestHandler: RequestHandler<
      ITestMessageBody,
      ITestResponse
    > = (data: ITestMessageBody): Promise<ITestResponse> => {
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
    requestHandlers.set("test", testRequestHandler);
    WindowMessagingHub.initialize([window.location.origin], requestHandlers);
  });

  return (
    <>
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
