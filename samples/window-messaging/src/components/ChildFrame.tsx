import {
  WindowMessagingHub,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import { ITestResponse } from "../interfaces";

function ChildFrame() {
  const [windowMessenger, setWindowMessenger] = useState<WindowMessenger>();
  const [number, setNumber] = useState(0);
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      WindowMessagingHub.initialize([window.location.origin]);
      const parentMessenger = await WindowMessagingHub.registerWindowMessenger(
        parent
      );
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
              windowMessenger
                .sendRequest<ITestResponse>("test", {
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
              setNumber(0);
              setError(undefined);
            }}
          >
            Reset number
          </button>
        </>
      )}
    </>
  );
}

export default ChildFrame;
