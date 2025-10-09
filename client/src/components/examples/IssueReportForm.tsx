import { IssueReportForm } from "../IssueReportForm";

export default function IssueReportFormExample() {
  return (
    <div className="max-w-2xl">
      <IssueReportForm
        onSubmit={(data) => console.log("Issue submitted:", data)}
      />
    </div>
  );
}
