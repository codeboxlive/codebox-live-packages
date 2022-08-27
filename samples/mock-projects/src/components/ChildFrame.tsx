import { useEffect, useRef, useState } from "react";
import { CodeboxLive } from "@codeboxlive/extensions-core";

// View for ChildFrame
function ChildFrame() {
  const [loading, setLoading] = useState<boolean>(true);
  const [lastResponse, setLastResponse] = useState<string>(
    "Waiting for first response..."
  );
  const [error, setError] = useState<Error>();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const setupHub = async () => {
      // Set up hub
      try {
        await CodeboxLive.initialize();
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
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
              const response = await CodeboxLive.fluid.getTenantInfo();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid tenant info"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.getFluidContainerId();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid container ID"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.setFluidContainerId({
                containerId: "MOCK-CONTAINER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Set Fluid container ID"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.getFluidToken({
                containerId: "MOCK-CONTAINER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get Fluid token"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.getNtpTime();
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get NPT Time"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.getUserRoles({
                clientId: "USER-ID",
              });
              setLastResponse(JSON.stringify(response));
            }}
          >
            {"Get user roles"}
          </button>
          <button
            onClick={async () => {
              const response = await CodeboxLive.fluid.registerClientId({
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
