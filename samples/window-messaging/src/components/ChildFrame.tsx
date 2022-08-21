import {
  MessageHandler,
  WindowMessagingHub,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import { ITestMessageBody, ITestResponse } from "../interfaces";

function ChildFrame() {
  const [windowMessenger, setWindowMessenger] = useState<WindowMessenger>();
  const [number, setNumber] = useState(0);
  const [randomNumber, setRandomNumber] = useState<number>();
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      const messageHandlers: Map<string, MessageHandler<any>> = new Map();
      const testMessageHandler: MessageHandler<ITestMessageBody> = (evt) => {
        setRandomNumber(evt.randomNumber);
      };
      messageHandlers.set("test-message", testMessageHandler);
      const hub = new WindowMessagingHub(
        [window.location.origin],
        undefined,
        messageHandlers
      );
      const parentMessenger = await hub.registerWindowMessenger(parent);
      setWindowMessenger(parentMessenger);
    };
    setupHub();
  });

  return (
    <>
      {!windowMessenger && <div>{"loading..."}</div>}
      {windowMessenger && (
        <>
          <button
            onClick={() => {
              // Send a request to parent to change the number
              windowMessenger
                .sendRequest<ITestResponse>("test-request", {
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
            {"Send value to parent"}
          </button>
          <div>{number}</div>
        </>
      )}
      {error && (
        <>
          <div style={{ color: "red", marginTop: "24px" }}>{error.message}</div>
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
      <div style={{ marginTop: "12px" }}>
        {`Last random number from parent: ${randomNumber ?? "N/A"}`}
      </div>
    </>
  );
}

export default ChildFrame;
