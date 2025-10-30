import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileText, Info, Sparkles, MessageSquare, Send } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { HelpComment } from "@shared/schema";

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

const routeToSpecMap: Record<string, string> = {
  "/manager": "/docs/manager/dashboard.html",
  "/manager/incidents": "/docs/manager/incidents.html",
  "/admin": "/docs/admin/portfolio.html",
  "/technician": "/docs/technician/work-queue.html",
  "/technician/incidents": "/docs/technician/work-queue.html",
};

const routeToAIInsightsMap: Record<string, string> = {
  "/manager": "/docs/ai/manager-dashboard.html",
  "/manager/incidents": "/docs/ai/incident-queue.html",
  "/admin": "/docs/ai/admin-portfolio.html",
  "/technician": "/docs/ai/technician-queue.html",
  "/technician/incidents": "/docs/ai/technician-queue.html",
};

const commentFormSchema = z.object({
  authorName: z.string().min(1, "Name is required"),
  authorRole: z.string().min(1, "Role is required"),
  body: z.string().min(1, "Comment is required"),
});

function CommentsTab({ route }: { route: string }) {
  const { data: comments, isLoading } = useQuery<HelpComment[]>({
    queryKey: ["/api/help/comments", route],
    enabled: !!route,
  });

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      authorName: "",
      authorRole: "",
      body: "",
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof commentFormSchema>) => {
      const response = await fetch(`/api/help/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, route }),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help/comments", route] });
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof commentFormSchema>) => {
    addCommentMutation.mutate(data);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-comment-author" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="authorRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Product Manager" {...field} data-testid="input-comment-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your feedback or suggestions..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-comment-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={addCommentMutation.isPending}
                className="w-full"
                data-testid="button-submit-comment"
              >
                <Send className="h-4 w-4 mr-2" />
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {isLoading && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading comments...
            </div>
          )}

          {!isLoading && comments && comments.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No comments yet. Be the first to share your feedback!
              </AlertDescription>
            </Alert>
          )}

          {comments?.map((comment) => (
            <Card key={comment.id} data-testid={`comment-${comment.id}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-semibold text-sm" data-testid={`comment-author-${comment.id}`}>
                      {comment.authorName}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`comment-role-${comment.id}`}>
                      {comment.authorRole}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid={`comment-time-${comment.id}`}>
                    {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <p className="text-sm" data-testid={`comment-body-${comment.id}`}>
                  {comment.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function HelpPanel({ open, onClose }: HelpPanelProps) {
  const [location] = useLocation();
  const [specContent, setSpecContent] = useState<string>("");
  const [aiContent, setAiContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadSpec = async () => {
      setLoading(true);
      setError(null);

      const specPath = routeToSpecMap[location];
      
      if (!specPath) {
        setSpecContent("");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(specPath);
        if (!response.ok) {
          throw new Error("Failed to load specification");
        }
        const html = await response.text();
        setSpecContent(html);
      } catch (err) {
        console.error("Error loading spec:", err);
        setError("Unable to load documentation for this page.");
        setSpecContent("");
      } finally {
        setLoading(false);
      }
    };

    loadSpec();
  }, [location, open]);

  useEffect(() => {
    if (!open) return;

    const loadAIInsights = async () => {
      setAiLoading(true);
      setAiError(null);

      const aiPath = routeToAIInsightsMap[location];
      
      if (!aiPath) {
        setAiContent("");
        setAiLoading(false);
        return;
      }

      try {
        const response = await fetch(aiPath);
        if (!response.ok) {
          throw new Error("Failed to load AI insights");
        }
        const html = await response.text();
        setAiContent(html);
      } catch (err) {
        console.error("Error loading AI insights:", err);
        setAiError("Unable to load AI opportunities for this page.");
        setAiContent("");
      } finally {
        setAiLoading(false);
      }
    };

    loadAIInsights();
  }, [location, open]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/manager": "Manager Dashboard",
      "/manager/incidents": "Incident Queue",
      "/admin": "Admin Center - Portfolio Dashboard",
      "/technician": "Technician Work Queue",
      "/technician/incidents": "Technician Work Queue",
    };
    return titles[location] || "Page Documentation";
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px]" data-testid="help-panel">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <SheetTitle>Page Documentation</SheetTitle>
          </div>
          <SheetDescription>
            {getPageTitle()}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="specification" className="h-[calc(100vh-8rem)]">
          <TabsList className="grid w-full grid-cols-3" data-testid="help-tabs">
            <TabsTrigger value="specification" data-testid="tab-specification">
              <FileText className="h-4 w-4 mr-2" />
              Functional Spec
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Opportunities
            </TabsTrigger>
            <TabsTrigger value="comments" data-testid="tab-comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="specification" className="h-[calc(100%-3rem)] mt-4">
            <ScrollArea className="h-full pr-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading documentation...</div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && !error && !specContent && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Documentation is not available for this page yet. Specifications are available for:
                    Manager Dashboard, Incident Queue, Admin Center, and Technician Work Queue.
                  </AlertDescription>
                </Alert>
              )}

              {!loading && !error && specContent && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: specContent }}
                />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="h-[calc(100%-3rem)] mt-4">
            <ScrollArea className="h-full pr-4">
              {aiLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading AI opportunities...</div>
                </div>
              )}

              {aiError && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{aiError}</AlertDescription>
                </Alert>
              )}

              {!aiLoading && !aiError && !aiContent && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    AI Opportunities content is not available for this page yet. Content is available for:
                    Manager Dashboard, Incident Queue, Admin Center, and Technician Work Queue.
                  </AlertDescription>
                </Alert>
              )}

              {!aiLoading && !aiError && aiContent && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aiContent }}
                />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="h-[calc(100%-3rem)] mt-4">
            <CommentsTab route={location} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
