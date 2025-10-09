import { AppHeader } from "../AppHeader";

export default function AppHeaderExample() {
  return (
    <div className="space-y-4">
      <AppHeader title="Guest Portal" homeRoute="/guest" notificationCount={3} />
      <AppHeader title="Manager Dashboard" homeRoute="/manager" notificationCount={0} />
    </div>
  );
}
