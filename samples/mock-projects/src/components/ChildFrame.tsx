import { useEffect, useRef, useState } from "react";
import { CodeboxLiveClient } from "@codeboxlive/extensions-core";

// View for ChildFrame
function ChildFrame() {
  const [loading, setLoading] = useState<boolean>(true);
  const [lastResponse, setLastResponse] = useState<string>(" ");
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      try {
        console.log("initializing child");
        await CodeboxLiveClient.initialize();
      } catch (err: any) {
        console.error(err);
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        console.log("done");
        setLoading(false);
      }
    };
    setupHub();
  });

  return (
    <>
      {loading && <div>{"Loading..."}</div>}
      {!loading && (
        <>
          <div>{lastResponse}</div>
          <button
            onClick={async () => {
              const response = await CodeboxLiveClient.fluid.getTenantInfo();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid tenant info"}
          </button>
          <button
            onClick={async () => {
              const response =
                await CodeboxLiveClient.fluid.getFluidContainerId();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid container ID"}
          </button>
          <button
            onClick={async () => {
              const response =
                await CodeboxLiveClient.fluid.setFluidContainerId({
                  containerId: "MOCK-CONTAINER-ID",
                });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Set Fluid container ID"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLiveClient.fluid.getFluidToken({
                containerId: "MOCK-CONTAINER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid token"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLiveClient.fluid.getNtpTime();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get NPT Time"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLiveClient.fluid.getUserRoles({
                clientId: "USER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get user roles"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLiveClient.fluid.registerClientId({
                clientId: "USER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Register client ID"}
          </button>
        </>
      )}
      {error && <div style={{ color: "red" }}>{error.message}</div>}
    </>
  );
}

export default ChildFrame;
