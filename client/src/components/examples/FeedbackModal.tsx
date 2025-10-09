import { useState } from "react";
import { FeedbackModal } from "../FeedbackModal";
import { Button } from "@/components/ui/button";

export default function FeedbackModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Feedback Modal</Button>
      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        eventTitle="Wi-Fi Not Working - Room 305"
        onSubmit={(rating, comments) =>
          console.log("Feedback:", { rating, comments })
        }
      />
    </div>
  );
}
