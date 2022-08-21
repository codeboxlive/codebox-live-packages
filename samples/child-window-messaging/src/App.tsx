import {
  WindowMessagingHub,
  RequestHandler,
  WindowMessenger,
} from "@codeboxlive/window-messaging";
import { useEffect, useRef, useState } from "react";
import "./App.css";

interface ITestMessageBody {
  value: number;
}

interface ITestResponse {
  value: number;
}

function App() {
  const [windowMessenger, setWindowMessenger] = useState<WindowMessenger>();
  const [number, setNumber] = useState(0);
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      const requestHandlers = new Map<string, RequestHandler<any, any>>();
      const testRequestHandler: RequestHandler<
        ITestMessageBody,
        ITestResponse
      > = (data: ITestMessageBody): Promise<ITestResponse> => {
        return new Promise<ITestResponse>((resolve) => {
          setTimeout(() => {
            resolve({
              value: data.value * 10,
            });
          }, 50);
        });
      };
      requestHandlers.set("test", testRequestHandler);
      WindowMessagingHub.initialize(["http://localhost:3000"], requestHandlers);
      const parentMessenger = await WindowMessagingHub.registerWindowMessenger(
        parent
      );
      setWindowMessenger(parentMessenger);
    };
    setupHub();
  });

  return (
    <div className="App">
      <h1>iFrame Test Child</h1>
      {!windowMessenger && <div>loading</div>}
      {windowMessenger && (
        <>
          <button
            onClick={() => {
              windowMessenger
                .sendRequest<ITestResponse>("test", {
                  value: number,
                })
                .then((response) => {
                  console.log(response);
                  setNumber(response.value);
                })
                .catch((err) => {
                  console.log("child received error");
                  if (err instanceof Error) {
                    setError(err);
                  }
                });
            }}
          >
            Send value to parent
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
    </div>
  );
}

export default App;
