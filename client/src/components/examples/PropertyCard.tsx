import { PropertyCard } from "../PropertyCard";

export default function PropertyCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
      <PropertyCard
        name="Grand Hotel Downtown"
        location="New York, NY"
        status="healthy"
        incidentCount={0}
        onClick={() => console.log("View property")}
      />
      <PropertyCard
        name="Beachside Resort"
        location="Miami, FL"
        status="degraded"
        incidentCount={3}
        onClick={() => console.log("View property")}
      />
      <PropertyCard
        name="Mountain Lodge"
        location="Denver, CO"
        status="critical"
        incidentCount={8}
        onClick={() => console.log("View property")}
      />
    </div>
  );
}
