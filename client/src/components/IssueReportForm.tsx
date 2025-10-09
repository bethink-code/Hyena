import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface IssueReportFormProps {
  onSubmit: (data: IssueFormData) => void;
  className?: string;
}

export interface IssueFormData {
  category: string;
  location: string;
  description: string;
  image?: File;
}

export function IssueReportForm({ onSubmit, className }: IssueReportFormProps) {
  const [formData, setFormData] = useState<IssueFormData>({
    category: "",
    location: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Issue reported:", formData);
    onSubmit(formData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Issue Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select an issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wifi-not-working">Wi-Fi Not Working</SelectItem>
                <SelectItem value="slow-internet">Slow Internet</SelectItem>
                <SelectItem value="cant-connect">Can't Connect Device</SelectItem>
                <SelectItem value="streaming-issues">Streaming Problems</SelectItem>
                <SelectItem value="vpn-issues">VPN Issues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Room/Location</Label>
            <Input
              id="location"
              placeholder="e.g., Room 305"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              data-testid="input-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue you're experiencing..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              data-testid="input-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Screenshot (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files?.[0] })
                }
                data-testid="input-image"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" data-testid="button-submit-issue">
            Submit Issue Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
