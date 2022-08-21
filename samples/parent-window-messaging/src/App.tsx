import {
  WindowMessagingHub,
  RequestHandler,
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
  const [count, setCount] = useState(0);
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
    WindowMessagingHub.initialize(["http://localhost:3001"], requestHandlers);
  });

  return (
    <div className="App">
      <h1>Parent Test</h1>
      <iframe
        ref={iFrameRef}
        width={720}
        height={520}
        src="http://localhost:3001"
      />
    </div>
  );
}

export default App;
