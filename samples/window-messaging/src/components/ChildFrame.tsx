import {
  MessageHandler,
  WindowMessagingHub,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import { HUB_KEY, TEST_MESSAGE_KEY, TEST_REQUEST_KEY } from "../constants";
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
      messageHandlers.set(TEST_MESSAGE_KEY, testMessageHandler);
      const hub = new WindowMessagingHub(
        HUB_KEY,
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
                .sendRequest<ITestResponse>(TEST_REQUEST_KEY, {
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
