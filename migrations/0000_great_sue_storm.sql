CREATE TABLE "help_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_timeline" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"location" text,
	"category" text,
	"affected_guests" integer,
	"estimated_resolution" text,
	"assigned_to" text,
	"property_id" text NOT NULL,
	"source" text,
	"item_type" text DEFAULT 'incident' NOT NULL,
	"root_cause" text,
	"resolution" text,
	"incident_type" text,
	"scheduled_for" timestamp,
	"metadata" text,
	"cancel_reason" text,
	"hold_reason" text,
	"hold_resume_date" timestamp,
	"duplicate_of_id" text,
	"requested_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'table_mountain_blue' NOT NULL,
	"logo_url" text,
	"contact_email" text,
	"contact_phone" text,
	"contact_person" text,
	"headquarters" text,
	"timezone" text DEFAULT 'Africa/Johannesburg' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"status" text DEFAULT 'active' NOT NULL,
	"timezone" text DEFAULT 'Africa/Johannesburg' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"user_type" text DEFAULT 'platform' NOT NULL,
	"role" text NOT NULL,
	"property_id" text,
	"organization_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
