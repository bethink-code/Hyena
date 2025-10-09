import { AppHeader } from "../AppHeader";

export default function AppHeaderExample() {
  return (
    <div className="space-y-4">
      <AppHeader title="Guest Portal" notificationCount={3} />
      <AppHeader title="Manager Dashboard" notificationCount={0} />
    </div>
  );
}
