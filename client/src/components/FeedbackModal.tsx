import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  eventTitle: string;
  onSubmit: (rating: number, comments: string) => void;
}

export function FeedbackModal({
  open,
  onClose,
  eventTitle,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    console.log("Feedback submitted:", { rating, comments });
    onSubmit(rating, comments);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="modal-feedback">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your experience with: {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
                data-testid={`button-star-${star}`}
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    (hoveredRating || rating) >= star
                      ? "fill-event-high text-event-high"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              id="comments"
              placeholder="Tell us more about your experience..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              data-testid="input-comments"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            data-testid="button-submit-feedback"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
