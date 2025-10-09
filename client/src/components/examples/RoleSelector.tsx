import { RoleSelector } from "../RoleSelector";

export default function RoleSelectorExample() {
  return (
    <div className="max-w-4xl">
      <RoleSelector onSelectRole={(role) => console.log("Selected role:", role)} />
    </div>
  );
}
