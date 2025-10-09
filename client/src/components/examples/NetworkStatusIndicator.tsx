import { NetworkStatusIndicator } from "../NetworkStatusIndicator";

export default function NetworkStatusIndicatorExample() {
  return (
    <div className="space-y-4 max-w-md">
      <NetworkStatusIndicator status="healthy" incidentCount={0} />
      <NetworkStatusIndicator status="degraded" incidentCount={2} />
      <NetworkStatusIndicator status="critical" incidentCount={5} />
      <NetworkStatusIndicator status="offline" incidentCount={1} />
    </div>
  );
}
