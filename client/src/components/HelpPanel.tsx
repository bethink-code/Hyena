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
import { FileText, Info, Sparkles, MessageSquare, Send, Trash2, Download } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { HelpComment } from "@shared/schema";

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
}

const routeToSpecMap: Record<string, string> = {
  "/manager": "/docs/hotel-manager-specs.html",
  "/manager/incidents": "/docs/hotel-manager-specs.html",
  "/manager/regional": "/docs/regional-manager-specs.html",
  "/admin": "/docs/admin-center-specs.html",
  "/admin/organizations": "/docs/admin-center-specs.html",
  "/admin/users": "/docs/admin-center-specs.html",
  "/technician": "/docs/technician-app-specs.html",
  "/technician/incidents": "/docs/technician-app-specs.html",
  "/guest": "/docs/guest-portal-specs.html",
  "/simulator": "/docs/event-simulator-specs.html",
};

const routeToDownloadSpecMap: Record<string, { url: string; filename: string }> = {
  "/manager": { url: "/docs/hotel-manager-specs.html", filename: "hotel-manager-specs.html" },
  "/manager/incidents": { url: "/docs/hotel-manager-specs.html", filename: "hotel-manager-specs.html" },
  "/manager/regional": { url: "/docs/regional-manager-specs.html", filename: "regional-manager-specs.html" },
  "/admin": { url: "/docs/admin-center-specs.html", filename: "admin-center-specs.html" },
  "/admin/organizations": { url: "/docs/admin-center-specs.html", filename: "admin-center-specs.html" },
  "/admin/users": { url: "/docs/admin-center-specs.html", filename: "admin-center-specs.html" },
  "/technician": { url: "/docs/technician-app-specs.html", filename: "technician-app-specs.html" },
  "/technician/incidents": { url: "/docs/technician-app-specs.html", filename: "technician-app-specs.html" },
  "/guest": { url: "/docs/guest-portal-specs.html", filename: "guest-portal-specs.html" },
  "/simulator": { url: "/docs/event-simulator-specs.html", filename: "event-simulator-specs.html" },
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
    queryFn: async () => {
      const encodedRoute = encodeURIComponent(route);
      const response = await fetch(`/api/help/comments/${encodedRoute}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
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

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/help/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help/comments", route] });
    },
  });

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
                  <div className="flex-1">
                    <div className="font-semibold text-sm" data-testid={`comment-author-${comment.id}`}>
                      {comment.authorName}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`comment-role-${comment.id}`}>
                      {comment.authorRole}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground" data-testid={`comment-time-${comment.id}`}>
                      {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/manager": "Hotel Manager Dashboard",
      "/manager/incidents": "Hotel Manager - Incident Queue",
      "/manager/regional": "Regional Manager Dashboard",
      "/admin": "Admin Center",
      "/technician": "Technician App",
      "/technician/incidents": "Technician App - Work Queue",
      "/guest": "Guest Portal",
      "/simulator": "Event Simulator",
    };
    return titles[location] || "Page Documentation";
  };

  const handleDownloadSpec = async () => {
    const downloadInfo = routeToDownloadSpecMap[location];
    if (!downloadInfo) return;

    try {
      const response = await fetch(downloadInfo.url);
      if (!response.ok) throw new Error("Failed to download specification");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadInfo.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleDownloadMasterPlatform = async () => {
    try {
      const response = await fetch("/docs/hyena-platform-functional-specifications.html");
      if (!response.ok) throw new Error("Failed to download master specification");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "hyena-platform-functional-specifications.html";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const hasDownloadableSpec = routeToDownloadSpecMap[location] !== undefined;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px]" data-testid="help-panel">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <SheetTitle>Page Documentation</SheetTitle>
            </div>
            <div className="flex gap-2">
              {hasDownloadableSpec && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSpec}
                  data-testid="button-download-spec"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Page Specs
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMasterPlatform}
                data-testid="button-download-master"
              >
                <Download className="h-4 w-4 mr-2" />
                Master Platform Specs
              </Button>
            </div>
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
            {!routeToSpecMap[location] && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Documentation is not available for this page yet. Specifications are available for:
                  Guest Portal, Manager Dashboard, Regional Manager, Admin Center, Technician App, and Event Simulator.
                </AlertDescription>
              </Alert>
            )}

            {routeToSpecMap[location] && (
              <iframe
                src={routeToSpecMap[location]}
                className="w-full h-full border-0"
                title="Functional Specification"
                data-testid="iframe-spec"
              />
            )}
          </TabsContent>

          <TabsContent value="ai" className="h-[calc(100%-3rem)] mt-4">
            {!routeToAIInsightsMap[location] && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  AI Opportunities content is not available for this page yet. Content is available for:
                  Manager Dashboard, Incident Queue, Admin Center, and Technician Work Queue.
                </AlertDescription>
              </Alert>
            )}

            {routeToAIInsightsMap[location] && (
              <iframe
                src={routeToAIInsightsMap[location]}
                className="w-full h-full border-0"
                title="AI Opportunities"
                data-testid="iframe-ai"
              />
            )}
          </TabsContent>

          <TabsContent value="comments" className="h-[calc(100%-3rem)] mt-4">
            <CommentsTab route={location} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
