import { PropertySelector } from "../PropertySelector";

export default function PropertySelectorExample() {
  const mockProperties = [
    { id: "1", name: "Grand Hotel Downtown", location: "New York, NY" },
    { id: "2", name: "Beachside Resort", location: "Miami, FL" },
    { id: "3", name: "Mountain Lodge", location: "Denver, CO" },
  ];

  return (
    <div className="max-w-md">
      <PropertySelector
        properties={mockProperties}
        onPropertyChange={(id) => console.log("Selected property:", id)}
      />
    </div>
  );
}
