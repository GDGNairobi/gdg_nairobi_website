import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { seedCommunity } from '../seed/community'

// Approved early-site consolidation: legacy DevFest presentation tables are replaced
// by versioned event records. Rollback restores schema, not removed legacy content.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_events_registration_status" AS ENUM('announced', 'open', 'closed');
  CREATE TYPE "public"."enum_community_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__community_events_v_version_event_kind" AS ENUM('community', 'workshop', 'devfest', 'io-extended', 'build-with-ai');
  CREATE TYPE "public"."enum__community_events_v_version_registration_status" AS ENUM('announced', 'open', 'closed');
  CREATE TYPE "public"."enum__community_events_v_version_schedule_mode" AS ENUM('single', 'multi');
  CREATE TYPE "public"."enum__community_events_v_version_live_status" AS ENUM('scheduled', 'delayed', 'live', 'complete');
  CREATE TYPE "public"."enum__community_events_v_version_source" AS ENUM('manual', 'bevy');
  CREATE TYPE "public"."enum__community_events_v_version_upstream_status" AS ENUM('live', 'completed', 'stale');
  CREATE TYPE "public"."enum__community_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "event_days" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "date" timestamp(3) with time zone,
    "description" varchar,
    "venue_name" varchar,
    "venue_address" varchar,
    "venue_website" varchar,
    "map_u_r_l" varchar
  );

  CREATE TABLE "event_videos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "featured" boolean DEFAULT true
  );

  CREATE TABLE "event_albums" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar
  );

  CREATE TABLE "_event_days_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "date" timestamp(3) with time zone,
    "description" varchar,
    "venue_name" varchar,
    "venue_address" varchar,
    "venue_website" varchar,
    "map_u_r_l" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_event_videos_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "featured" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_event_albums_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_community_events_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_seed_revision" varchar,
    "version_local_title" varchar,
    "version_slug" varchar,
    "version_featured" boolean DEFAULT false,
    "version_show_on_site" boolean DEFAULT true,
    "version_display_order" numeric DEFAULT 0,
    "version_event_kind" "enum__community_events_v_version_event_kind" DEFAULT 'community',
    "version_edition_year" numeric,
    "version_tagline" varchar,
    "version_local_description" varchar,
    "version_cover_image_id" integer,
    "version_registration_status" "enum__community_events_v_version_registration_status" DEFAULT 'announced',
    "version_registration_label" varchar,
    "version_local_registration_u_r_l" varchar,
    "version_local_label" varchar,
    "version_schedule_mode" "enum__community_events_v_version_schedule_mode" DEFAULT 'single',
    "version_live_status" "enum__community_events_v_version_live_status" DEFAULT 'scheduled',
    "version_schedule_start_override" timestamp(3) with time zone,
    "version_schedule_offset_minutes" numeric DEFAULT 0,
    "version_schedule_notice" varchar,
    "version_source" "enum__community_events_v_version_source" DEFAULT 'manual',
    "version_upstream_u_r_l" varchar,
    "version_source_title" varchar,
    "version_source_start_date" timestamp(3) with time zone,
    "version_source_type" varchar,
    "version_registration_u_r_l" varchar,
    "version_image_u_r_l" varchar,
    "version_excerpt" varchar,
    "version_upstream_status" "enum__community_events_v_version_upstream_status",
    "version_last_synced_at" timestamp(3) with time zone,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__community_events_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "community_programmes" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "community_ticker" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "_community_programmes_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_community_ticker_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  ALTER TABLE "devfest_editions_hero_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions_calls_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions_ticker_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "story_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions_tracks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experience_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "highlight_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "highlight_videos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devfest_editions_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_version_hero_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_version_calls_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_version_ticker_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_story_paragraphs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_version_tracks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_highlight_photos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_highlight_videos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_version_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_devfest_editions_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "devfest_editions_hero_signals" CASCADE;
  DROP TABLE "devfest_editions_calls_to_action" CASCADE;
  DROP TABLE "devfest_editions_ticker_items" CASCADE;
  DROP TABLE "story_paragraphs" CASCADE;
  DROP TABLE "devfest_editions_tracks" CASCADE;
  DROP TABLE "experience_items" CASCADE;
  DROP TABLE "highlight_photos" CASCADE;
  DROP TABLE "highlight_videos" CASCADE;
  DROP TABLE "devfest_editions_statistics" CASCADE;
  DROP TABLE "devfest_editions" CASCADE;
  DROP TABLE "devfest_editions_texts" CASCADE;
  DROP TABLE "_devfest_editions_v_version_hero_signals" CASCADE;
  DROP TABLE "_devfest_editions_v_version_calls_to_action" CASCADE;
  DROP TABLE "_devfest_editions_v_version_ticker_items" CASCADE;
  DROP TABLE "_story_paragraphs_v" CASCADE;
  DROP TABLE "_devfest_editions_v_version_tracks" CASCADE;
  DROP TABLE "_experience_items_v" CASCADE;
  DROP TABLE "_highlight_photos_v" CASCADE;
  DROP TABLE "_highlight_videos_v" CASCADE;
  DROP TABLE "_devfest_editions_v_version_statistics" CASCADE;
  DROP TABLE "_devfest_editions_v" CASCADE;
  DROP TABLE "_devfest_editions_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_devfest_editions_fk";

  ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_current_edition_id_devfest_editions_id_fk";

  ALTER TABLE "_site_settings_v" DROP CONSTRAINT IF EXISTS "_site_settings_v_version_current_edition_id_devfest_editions_id_fk";

  DROP INDEX "payload_locked_documents_rels_devfest_editions_id_idx";
  DROP INDEX "site_settings_current_edition_idx";
  DROP INDEX "_site_settings_v_version_version_current_edition_idx";
  ALTER TABLE "community_events" ALTER COLUMN "source" DROP NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "event_kind" DROP NOT NULL;
  ALTER TABLE "sessions" ADD COLUMN "import_key" varchar;
  ALTER TABLE "_sessions_v" ADD COLUMN "version_import_key" varchar;
  ALTER TABLE "community_events" ADD COLUMN "seed_revision" varchar;
  ALTER TABLE "community_events" ADD COLUMN "edition_year" numeric;
  ALTER TABLE "community_events" ADD COLUMN "tagline" varchar;
  ALTER TABLE "community_events" ADD COLUMN "cover_image_id" integer;
  ALTER TABLE "community_events" ADD COLUMN "registration_status" "enum_community_events_registration_status" DEFAULT 'announced';
  ALTER TABLE "community_events" ADD COLUMN "registration_label" varchar;
  ALTER TABLE "community_events" ADD COLUMN "_status" "enum_community_events_status" DEFAULT 'draft';
  ALTER TABLE "site_settings" ADD COLUMN "seed_revision" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_about_welcome_lead" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_about_welcome_line" varchar DEFAULT 'you''re welcome here.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_programmes_intro" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_programmes_closing" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_programmes_access_note" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_connection_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_connection_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_connection_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_ticker_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_events_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_highlights_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_highlights_kicker" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_highlights_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_highlights_intro" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_seed_revision" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_about_welcome_lead" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_about_welcome_line" varchar DEFAULT 'you''re welcome here.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_programmes_intro" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_programmes_closing" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_programmes_access_note" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_connection_heading" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_connection_description" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_connection_image_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_ticker_enabled" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_events_enabled" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_highlights_enabled" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_highlights_kicker" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_highlights_heading" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_highlights_intro" varchar;
  ALTER TABLE "event_days" ADD CONSTRAINT "event_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_videos" ADD CONSTRAINT "event_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_albums" ADD CONSTRAINT "event_albums_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_days_v" ADD CONSTRAINT "_event_days_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_videos_v" ADD CONSTRAINT "_event_videos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_albums_v" ADD CONSTRAINT "_event_albums_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_events_v" ADD CONSTRAINT "_community_events_v_parent_id_community_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_events_v" ADD CONSTRAINT "_community_events_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "community_programmes" ADD CONSTRAINT "community_programmes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_ticker" ADD CONSTRAINT "community_ticker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_programmes_v" ADD CONSTRAINT "_community_programmes_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_ticker_v" ADD CONSTRAINT "_community_ticker_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_days_order_idx" ON "event_days" USING btree ("_order");
  CREATE INDEX "event_days_parent_id_idx" ON "event_days" USING btree ("_parent_id");
  CREATE INDEX "event_videos_order_idx" ON "event_videos" USING btree ("_order");
  CREATE INDEX "event_videos_parent_id_idx" ON "event_videos" USING btree ("_parent_id");
  CREATE INDEX "event_albums_order_idx" ON "event_albums" USING btree ("_order");
  CREATE INDEX "event_albums_parent_id_idx" ON "event_albums" USING btree ("_parent_id");
  CREATE INDEX "_event_days_v_order_idx" ON "_event_days_v" USING btree ("_order");
  CREATE INDEX "_event_days_v_parent_id_idx" ON "_event_days_v" USING btree ("_parent_id");
  CREATE INDEX "_event_videos_v_order_idx" ON "_event_videos_v" USING btree ("_order");
  CREATE INDEX "_event_videos_v_parent_id_idx" ON "_event_videos_v" USING btree ("_parent_id");
  CREATE INDEX "_event_albums_v_order_idx" ON "_event_albums_v" USING btree ("_order");
  CREATE INDEX "_event_albums_v_parent_id_idx" ON "_event_albums_v" USING btree ("_parent_id");
  CREATE INDEX "_community_events_v_parent_idx" ON "_community_events_v" USING btree ("parent_id");
  CREATE INDEX "_community_events_v_version_version_slug_idx" ON "_community_events_v" USING btree ("version_slug");
  CREATE INDEX "_community_events_v_version_version_cover_image_idx" ON "_community_events_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_community_events_v_version_version_upstream_u_r_l_idx" ON "_community_events_v" USING btree ("version_upstream_u_r_l");
  CREATE INDEX "_community_events_v_version_version_updated_at_idx" ON "_community_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_community_events_v_version_version_created_at_idx" ON "_community_events_v" USING btree ("version_created_at");
  CREATE INDEX "_community_events_v_version_version__status_idx" ON "_community_events_v" USING btree ("version__status");
  CREATE INDEX "_community_events_v_created_at_idx" ON "_community_events_v" USING btree ("created_at");
  CREATE INDEX "_community_events_v_updated_at_idx" ON "_community_events_v" USING btree ("updated_at");
  CREATE INDEX "_community_events_v_latest_idx" ON "_community_events_v" USING btree ("latest");
  CREATE INDEX "_community_events_v_autosave_idx" ON "_community_events_v" USING btree ("autosave");
  CREATE INDEX "community_programmes_order_idx" ON "community_programmes" USING btree ("_order");
  CREATE INDEX "community_programmes_parent_id_idx" ON "community_programmes" USING btree ("_parent_id");
  CREATE INDEX "community_ticker_order_idx" ON "community_ticker" USING btree ("_order");
  CREATE INDEX "community_ticker_parent_id_idx" ON "community_ticker" USING btree ("_parent_id");
  CREATE INDEX "_community_programmes_v_order_idx" ON "_community_programmes_v" USING btree ("_order");
  CREATE INDEX "_community_programmes_v_parent_id_idx" ON "_community_programmes_v" USING btree ("_parent_id");
  CREATE INDEX "_community_ticker_v_order_idx" ON "_community_ticker_v" USING btree ("_order");
  CREATE INDEX "_community_ticker_v_parent_id_idx" ON "_community_ticker_v" USING btree ("_parent_id");
  ALTER TABLE "community_events" ADD CONSTRAINT "community_events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_community_homepage_connection_image_id_media_id_fk" FOREIGN KEY ("community_homepage_connection_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_community_homepage_connection_image_id_media_id_fk" FOREIGN KEY ("version_community_homepage_connection_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "event_importKey_idx" ON "sessions" USING btree ("event_id","import_key");
  CREATE INDEX "version_event_version_importKey_idx" ON "_sessions_v" USING btree ("version_event_id","version_import_key");
  CREATE INDEX "community_events_cover_image_idx" ON "community_events" USING btree ("cover_image_id");
  CREATE INDEX "community_events__status_idx" ON "community_events" USING btree ("_status");
  CREATE INDEX "site_settings_community_homepage_connection_community_ho_idx" ON "site_settings" USING btree ("community_homepage_connection_image_id");
  CREATE INDEX "_site_settings_v_version_community_homepage_connection_v_idx" ON "_site_settings_v" USING btree ("version_community_homepage_connection_image_id");
  ALTER TABLE "community_events" DROP COLUMN "event_destination";
  ALTER TABLE "community_events" DROP COLUMN "local_start_date";
  ALTER TABLE "community_events" DROP COLUMN "venue_name";
  ALTER TABLE "community_events" DROP COLUMN "venue_address";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "devfest_editions_id";
  ALTER TABLE "site_settings" DROP COLUMN "current_edition_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_current_edition_id";
  DROP TYPE "public"."enum_devfest_editions_calls_to_action_style";
  DROP TYPE "public"."enum_devfest_editions_tracks_accent";
  DROP TYPE "public"."enum_devfest_editions_event_phase";
  DROP TYPE "public"."enum_devfest_editions_status";
  DROP TYPE "public"."enum__devfest_editions_v_version_calls_to_action_style";
  DROP TYPE "public"."enum__devfest_editions_v_version_tracks_accent";
  DROP TYPE "public"."enum__devfest_editions_v_version_status";
  DROP TYPE "public"."enum_community_events_event_destination";`)
  await db.execute(sql`UPDATE "community_events" SET "local_title" = COALESCE("local_title", "source_title", 'Community event'), "_status" = 'published' WHERE "show_on_site" = true;`)
  await seedCommunity(payload, req)

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_devfest_editions_calls_to_action_style" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_devfest_editions_tracks_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TYPE "public"."enum_devfest_editions_event_phase" AS ENUM('announcement', 'cfp-open', 'registration-open', 'live', 'ended');
  CREATE TYPE "public"."enum_devfest_editions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__devfest_editions_v_version_calls_to_action_style" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__devfest_editions_v_version_tracks_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TYPE "public"."enum__devfest_editions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_community_events_event_destination" AS ENUM('community', 'schedule');
  CREATE TABLE "devfest_editions_hero_signals" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "devfest_editions_calls_to_action" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum_devfest_editions_calls_to_action_style" DEFAULT 'primary'
  );

  CREATE TABLE "devfest_editions_ticker_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "story_paragraphs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "devfest_editions_tracks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    "accent" "enum_devfest_editions_tracks_accent"
  );

  CREATE TABLE "experience_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "highlight_photos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar
  );

  CREATE TABLE "highlight_videos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "label" varchar DEFAULT 'Watch video'
  );

  CREATE TABLE "devfest_editions_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE "devfest_editions" (
    "id" serial PRIMARY KEY NOT NULL,
    "event_id" integer,
    "title" varchar,
    "year" numeric,
    "slug" varchar,
    "status" "enum_devfest_editions_event_phase" DEFAULT 'announcement',
    "hero_eyebrow" varchar DEFAULT 'Karibu Nairobi',
    "hero_headline" varchar DEFAULT 'The future',
    "hero_accent_line" varchar DEFAULT 'grows here.',
    "hero_description" varchar,
    "hero_artwork_id" integer,
    "hero_scroll_label" varchar DEFAULT 'Scroll to grow',
    "event_details_starts_at" timestamp(3) with time zone,
    "event_details_ends_at" timestamp(3) with time zone,
    "event_details_venue_name" varchar,
    "event_details_address" varchar,
    "event_details_map_u_r_l" varchar,
    "event_details_location_label" varchar DEFAULT 'Nairobi, Kenya',
    "ticker_enabled" boolean DEFAULT true,
    "story_section_enabled" boolean DEFAULT true,
    "story_section_kicker" varchar DEFAULT 'Community-led, Nairobi-built',
    "story_section_heading" varchar DEFAULT 'A local home for people who build.',
    "story_section_quote" varchar DEFAULT 'There is a seat for you here.',
    "tracks_section_enabled" boolean DEFAULT true,
    "tracks_section_kicker" varchar DEFAULT 'What grows here',
    "tracks_section_heading" varchar DEFAULT 'Four paths.
  One ecosystem.',
    "tracks_section_intro" varchar,
    "experience_section_enabled" boolean DEFAULT true,
    "experience_section_kicker" varchar DEFAULT 'The experience',
    "experience_section_heading" varchar DEFAULT 'Make it.
  Then meet around it.',
    "experience_section_marker" varchar DEFAULT '2',
    "experience_section_marker_label" varchar DEFAULT 'Ways to
  go deep',
    "cfp_section_enabled" boolean DEFAULT true,
    "cfp_section_badge" varchar DEFAULT 'CFP / 2026',
    "cfp_section_kicker" varchar DEFAULT 'Bring your voice',
    "cfp_section_heading" varchar,
    "cfp_section_description" varchar,
    "cfp_section_cta_label" varchar DEFAULT 'Register your interest',
    "cfp_section_cta_u_r_l" varchar,
    "cfp_section_art_label_top" varchar DEFAULT 'Your story',
    "cfp_section_art_label_bottom" varchar DEFAULT 'Our stage',
    "events_section_enabled" boolean DEFAULT true,
    "events_section_kicker" varchar DEFAULT 'The root system',
    "events_section_heading" varchar DEFAULT 'The community never stops.',
    "events_section_all_events_label" varchar DEFAULT 'All GDG Nairobi events',
    "events_section_all_events_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/',
    "events_section_sync_note" varchar,
    "highlights_section_enabled" boolean DEFAULT true,
    "highlights_section_kicker" varchar DEFAULT 'Previously, in Nairobi',
    "highlights_section_heading" varchar DEFAULT 'Made by the community.',
    "highlights_section_intro" varchar DEFAULT 'A few moments, talks and builds from previous GDG Nairobi events.',
    "closing_section_enabled" boolean DEFAULT true,
    "closing_section_kicker" varchar DEFAULT 'Nairobi / 2026',
    "closing_section_heading" varchar DEFAULT 'Come curious.',
    "closing_section_accent_line" varchar DEFAULT 'Leave connected.',
    "closing_section_primary_label" varchar DEFAULT 'Stay in the loop',
    "closing_section_primary_u_r_l" varchar,
    "closing_section_secondary_label" varchar DEFAULT 'Partner with DevFest',
    "closing_section_secondary_u_r_l" varchar DEFAULT '/partners',
    "featured_community_event_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_devfest_editions_status" DEFAULT 'draft'
  );

  CREATE TABLE "devfest_editions_texts" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "text" varchar
  );

  CREATE TABLE "_devfest_editions_v_version_hero_signals" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_devfest_editions_v_version_calls_to_action" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "style" "enum__devfest_editions_v_version_calls_to_action_style" DEFAULT 'primary',
    "_uuid" varchar
  );

  CREATE TABLE "_devfest_editions_v_version_ticker_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_story_paragraphs_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_devfest_editions_v_version_tracks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "description" varchar,
    "accent" "enum__devfest_editions_v_version_tracks_accent",
    "_uuid" varchar
  );

  CREATE TABLE "_experience_items_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_highlight_photos_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_highlight_videos_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "url" varchar,
    "label" varchar DEFAULT 'Watch video',
    "_uuid" varchar
  );

  CREATE TABLE "_devfest_editions_v_version_statistics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_devfest_editions_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_event_id" integer,
    "version_title" varchar,
    "version_year" numeric,
    "version_slug" varchar,
    "version_status" "enum_devfest_editions_event_phase" DEFAULT 'announcement',
    "version_hero_eyebrow" varchar DEFAULT 'Karibu Nairobi',
    "version_hero_headline" varchar DEFAULT 'The future',
    "version_hero_accent_line" varchar DEFAULT 'grows here.',
    "version_hero_description" varchar,
    "version_hero_artwork_id" integer,
    "version_hero_scroll_label" varchar DEFAULT 'Scroll to grow',
    "version_event_details_starts_at" timestamp(3) with time zone,
    "version_event_details_ends_at" timestamp(3) with time zone,
    "version_event_details_venue_name" varchar,
    "version_event_details_address" varchar,
    "version_event_details_map_u_r_l" varchar,
    "version_event_details_location_label" varchar DEFAULT 'Nairobi, Kenya',
    "version_ticker_enabled" boolean DEFAULT true,
    "version_story_section_enabled" boolean DEFAULT true,
    "version_story_section_kicker" varchar DEFAULT 'Community-led, Nairobi-built',
    "version_story_section_heading" varchar DEFAULT 'A local home for people who build.',
    "version_story_section_quote" varchar DEFAULT 'There is a seat for you here.',
    "version_tracks_section_enabled" boolean DEFAULT true,
    "version_tracks_section_kicker" varchar DEFAULT 'What grows here',
    "version_tracks_section_heading" varchar DEFAULT 'Four paths.
  One ecosystem.',
    "version_tracks_section_intro" varchar,
    "version_experience_section_enabled" boolean DEFAULT true,
    "version_experience_section_kicker" varchar DEFAULT 'The experience',
    "version_experience_section_heading" varchar DEFAULT 'Make it.
  Then meet around it.',
    "version_experience_section_marker" varchar DEFAULT '2',
    "version_experience_section_marker_label" varchar DEFAULT 'Ways to
  go deep',
    "version_cfp_section_enabled" boolean DEFAULT true,
    "version_cfp_section_badge" varchar DEFAULT 'CFP / 2026',
    "version_cfp_section_kicker" varchar DEFAULT 'Bring your voice',
    "version_cfp_section_heading" varchar,
    "version_cfp_section_description" varchar,
    "version_cfp_section_cta_label" varchar DEFAULT 'Register your interest',
    "version_cfp_section_cta_u_r_l" varchar,
    "version_cfp_section_art_label_top" varchar DEFAULT 'Your story',
    "version_cfp_section_art_label_bottom" varchar DEFAULT 'Our stage',
    "version_events_section_enabled" boolean DEFAULT true,
    "version_events_section_kicker" varchar DEFAULT 'The root system',
    "version_events_section_heading" varchar DEFAULT 'The community never stops.',
    "version_events_section_all_events_label" varchar DEFAULT 'All GDG Nairobi events',
    "version_events_section_all_events_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/',
    "version_events_section_sync_note" varchar,
    "version_highlights_section_enabled" boolean DEFAULT true,
    "version_highlights_section_kicker" varchar DEFAULT 'Previously, in Nairobi',
    "version_highlights_section_heading" varchar DEFAULT 'Made by the community.',
    "version_highlights_section_intro" varchar DEFAULT 'A few moments, talks and builds from previous GDG Nairobi events.',
    "version_closing_section_enabled" boolean DEFAULT true,
    "version_closing_section_kicker" varchar DEFAULT 'Nairobi / 2026',
    "version_closing_section_heading" varchar DEFAULT 'Come curious.',
    "version_closing_section_accent_line" varchar DEFAULT 'Leave connected.',
    "version_closing_section_primary_label" varchar DEFAULT 'Stay in the loop',
    "version_closing_section_primary_u_r_l" varchar,
    "version_closing_section_secondary_label" varchar DEFAULT 'Partner with DevFest',
    "version_closing_section_secondary_u_r_l" varchar DEFAULT '/partners',
    "version_featured_community_event_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__devfest_editions_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_devfest_editions_v_texts" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "text" varchar
  );

  ALTER TABLE "event_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_videos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_albums" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_days_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_videos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_event_albums_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_ticker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_programmes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_ticker_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_days" CASCADE;
  DROP TABLE "event_videos" CASCADE;
  DROP TABLE "event_albums" CASCADE;
  DROP TABLE "_event_days_v" CASCADE;
  DROP TABLE "_event_videos_v" CASCADE;
  DROP TABLE "_event_albums_v" CASCADE;
  DROP TABLE "_community_events_v" CASCADE;
  DROP TABLE "community_programmes" CASCADE;
  DROP TABLE "community_ticker" CASCADE;
  DROP TABLE "_community_programmes_v" CASCADE;
  DROP TABLE "_community_ticker_v" CASCADE;
  ALTER TABLE "community_events" DROP CONSTRAINT IF EXISTS "community_events_cover_image_id_media_id_fk";

  ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_community_homepage_connection_image_id_media_id_fk";

  ALTER TABLE "_site_settings_v" DROP CONSTRAINT IF EXISTS "_site_settings_v_version_community_homepage_connection_image_id_media_id_fk";

  DROP INDEX "event_importKey_idx";
  DROP INDEX "version_event_version_importKey_idx";
  DROP INDEX "community_events_cover_image_idx";
  DROP INDEX "community_events__status_idx";
  DROP INDEX "site_settings_community_homepage_connection_community_ho_idx";
  DROP INDEX "_site_settings_v_version_community_homepage_connection_v_idx";
  ALTER TABLE "community_events" ALTER COLUMN "event_kind" SET NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "source" SET NOT NULL;
  ALTER TABLE "community_events" ADD COLUMN "event_destination" "enum_community_events_event_destination" DEFAULT 'community' NOT NULL;
  ALTER TABLE "community_events" ADD COLUMN "local_start_date" timestamp(3) with time zone;
  ALTER TABLE "community_events" ADD COLUMN "venue_name" varchar;
  ALTER TABLE "community_events" ADD COLUMN "venue_address" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "devfest_editions_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "current_edition_id" integer;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_current_edition_id" integer;
  ALTER TABLE "devfest_editions_hero_signals" ADD CONSTRAINT "devfest_editions_hero_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_calls_to_action" ADD CONSTRAINT "devfest_editions_calls_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_ticker_items" ADD CONSTRAINT "devfest_editions_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "story_paragraphs" ADD CONSTRAINT "story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_tracks" ADD CONSTRAINT "devfest_editions_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_items" ADD CONSTRAINT "experience_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "highlight_photos" ADD CONSTRAINT "highlight_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "highlight_photos" ADD CONSTRAINT "highlight_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "highlight_videos" ADD CONSTRAINT "highlight_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_statistics" ADD CONSTRAINT "devfest_editions_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_event_id_community_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_hero_artwork_id_media_id_fk" FOREIGN KEY ("hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_featured_community_event_id_community_events_id_fk" FOREIGN KEY ("featured_community_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devfest_editions_texts" ADD CONSTRAINT "devfest_editions_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_hero_signals" ADD CONSTRAINT "_devfest_editions_v_version_hero_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_calls_to_action" ADD CONSTRAINT "_devfest_editions_v_version_calls_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_ticker_items" ADD CONSTRAINT "_devfest_editions_v_version_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_story_paragraphs_v" ADD CONSTRAINT "_story_paragraphs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_tracks" ADD CONSTRAINT "_devfest_editions_v_version_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_items_v" ADD CONSTRAINT "_experience_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_highlight_photos_v" ADD CONSTRAINT "_highlight_photos_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_highlight_photos_v" ADD CONSTRAINT "_highlight_photos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_highlight_videos_v" ADD CONSTRAINT "_highlight_videos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_statistics" ADD CONSTRAINT "_devfest_editions_v_version_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_parent_id_devfest_editions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_event_id_community_events_id_fk" FOREIGN KEY ("version_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_hero_artwork_id_media_id_fk" FOREIGN KEY ("version_hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_featured_community_event_id_community_events_id_fk" FOREIGN KEY ("version_featured_community_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_texts" ADD CONSTRAINT "_devfest_editions_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "devfest_editions_hero_signals_order_idx" ON "devfest_editions_hero_signals" USING btree ("_order");
  CREATE INDEX "devfest_editions_hero_signals_parent_id_idx" ON "devfest_editions_hero_signals" USING btree ("_parent_id");
  CREATE INDEX "devfest_editions_calls_to_action_order_idx" ON "devfest_editions_calls_to_action" USING btree ("_order");
  CREATE INDEX "devfest_editions_calls_to_action_parent_id_idx" ON "devfest_editions_calls_to_action" USING btree ("_parent_id");
  CREATE INDEX "devfest_editions_ticker_items_order_idx" ON "devfest_editions_ticker_items" USING btree ("_order");
  CREATE INDEX "devfest_editions_ticker_items_parent_id_idx" ON "devfest_editions_ticker_items" USING btree ("_parent_id");
  CREATE INDEX "story_paragraphs_order_idx" ON "story_paragraphs" USING btree ("_order");
  CREATE INDEX "story_paragraphs_parent_id_idx" ON "story_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "devfest_editions_tracks_order_idx" ON "devfest_editions_tracks" USING btree ("_order");
  CREATE INDEX "devfest_editions_tracks_parent_id_idx" ON "devfest_editions_tracks" USING btree ("_parent_id");
  CREATE INDEX "experience_items_order_idx" ON "experience_items" USING btree ("_order");
  CREATE INDEX "experience_items_parent_id_idx" ON "experience_items" USING btree ("_parent_id");
  CREATE INDEX "highlight_photos_order_idx" ON "highlight_photos" USING btree ("_order");
  CREATE INDEX "highlight_photos_parent_id_idx" ON "highlight_photos" USING btree ("_parent_id");
  CREATE INDEX "highlight_photos_image_idx" ON "highlight_photos" USING btree ("image_id");
  CREATE INDEX "highlight_videos_order_idx" ON "highlight_videos" USING btree ("_order");
  CREATE INDEX "highlight_videos_parent_id_idx" ON "highlight_videos" USING btree ("_parent_id");
  CREATE INDEX "devfest_editions_statistics_order_idx" ON "devfest_editions_statistics" USING btree ("_order");
  CREATE INDEX "devfest_editions_statistics_parent_id_idx" ON "devfest_editions_statistics" USING btree ("_parent_id");
  CREATE INDEX "devfest_editions_event_idx" ON "devfest_editions" USING btree ("event_id");
  CREATE UNIQUE INDEX "devfest_editions_year_idx" ON "devfest_editions" USING btree ("year");
  CREATE UNIQUE INDEX "devfest_editions_slug_idx" ON "devfest_editions" USING btree ("slug");
  CREATE INDEX "devfest_editions_hero_hero_artwork_idx" ON "devfest_editions" USING btree ("hero_artwork_id");
  CREATE INDEX "devfest_editions_featured_community_event_idx" ON "devfest_editions" USING btree ("featured_community_event_id");
  CREATE INDEX "devfest_editions_updated_at_idx" ON "devfest_editions" USING btree ("updated_at");
  CREATE INDEX "devfest_editions_created_at_idx" ON "devfest_editions" USING btree ("created_at");
  CREATE INDEX "devfest_editions__status_idx" ON "devfest_editions" USING btree ("_status");
  CREATE INDEX "devfest_editions_texts_order_parent" ON "devfest_editions_texts" USING btree ("order","parent_id");
  CREATE INDEX "_devfest_editions_v_version_hero_signals_order_idx" ON "_devfest_editions_v_version_hero_signals" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_hero_signals_parent_id_idx" ON "_devfest_editions_v_version_hero_signals" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_version_calls_to_action_order_idx" ON "_devfest_editions_v_version_calls_to_action" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_calls_to_action_parent_id_idx" ON "_devfest_editions_v_version_calls_to_action" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_version_ticker_items_order_idx" ON "_devfest_editions_v_version_ticker_items" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_ticker_items_parent_id_idx" ON "_devfest_editions_v_version_ticker_items" USING btree ("_parent_id");
  CREATE INDEX "_story_paragraphs_v_order_idx" ON "_story_paragraphs_v" USING btree ("_order");
  CREATE INDEX "_story_paragraphs_v_parent_id_idx" ON "_story_paragraphs_v" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_version_tracks_order_idx" ON "_devfest_editions_v_version_tracks" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_tracks_parent_id_idx" ON "_devfest_editions_v_version_tracks" USING btree ("_parent_id");
  CREATE INDEX "_experience_items_v_order_idx" ON "_experience_items_v" USING btree ("_order");
  CREATE INDEX "_experience_items_v_parent_id_idx" ON "_experience_items_v" USING btree ("_parent_id");
  CREATE INDEX "_highlight_photos_v_order_idx" ON "_highlight_photos_v" USING btree ("_order");
  CREATE INDEX "_highlight_photos_v_parent_id_idx" ON "_highlight_photos_v" USING btree ("_parent_id");
  CREATE INDEX "_highlight_photos_v_image_idx" ON "_highlight_photos_v" USING btree ("image_id");
  CREATE INDEX "_highlight_videos_v_order_idx" ON "_highlight_videos_v" USING btree ("_order");
  CREATE INDEX "_highlight_videos_v_parent_id_idx" ON "_highlight_videos_v" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_version_statistics_order_idx" ON "_devfest_editions_v_version_statistics" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_statistics_parent_id_idx" ON "_devfest_editions_v_version_statistics" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_parent_idx" ON "_devfest_editions_v" USING btree ("parent_id");
  CREATE INDEX "_devfest_editions_v_version_version_event_idx" ON "_devfest_editions_v" USING btree ("version_event_id");
  CREATE INDEX "_devfest_editions_v_version_version_year_idx" ON "_devfest_editions_v" USING btree ("version_year");
  CREATE INDEX "_devfest_editions_v_version_version_slug_idx" ON "_devfest_editions_v" USING btree ("version_slug");
  CREATE INDEX "_devfest_editions_v_version_hero_version_hero_artwork_idx" ON "_devfest_editions_v" USING btree ("version_hero_artwork_id");
  CREATE INDEX "_devfest_editions_v_version_version_featured_community_e_idx" ON "_devfest_editions_v" USING btree ("version_featured_community_event_id");
  CREATE INDEX "_devfest_editions_v_version_version_updated_at_idx" ON "_devfest_editions_v" USING btree ("version_updated_at");
  CREATE INDEX "_devfest_editions_v_version_version_created_at_idx" ON "_devfest_editions_v" USING btree ("version_created_at");
  CREATE INDEX "_devfest_editions_v_version_version__status_idx" ON "_devfest_editions_v" USING btree ("version__status");
  CREATE INDEX "_devfest_editions_v_created_at_idx" ON "_devfest_editions_v" USING btree ("created_at");
  CREATE INDEX "_devfest_editions_v_updated_at_idx" ON "_devfest_editions_v" USING btree ("updated_at");
  CREATE INDEX "_devfest_editions_v_latest_idx" ON "_devfest_editions_v" USING btree ("latest");
  CREATE INDEX "_devfest_editions_v_autosave_idx" ON "_devfest_editions_v" USING btree ("autosave");
  CREATE INDEX "_devfest_editions_v_texts_order_parent" ON "_devfest_editions_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_devfest_editions_fk" FOREIGN KEY ("devfest_editions_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_current_edition_id_devfest_editions_id_fk" FOREIGN KEY ("current_edition_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_current_edition_id_devfest_editions_id_fk" FOREIGN KEY ("version_current_edition_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_devfest_editions_id_idx" ON "payload_locked_documents_rels" USING btree ("devfest_editions_id");
  CREATE INDEX "site_settings_current_edition_idx" ON "site_settings" USING btree ("current_edition_id");
  CREATE INDEX "_site_settings_v_version_version_current_edition_idx" ON "_site_settings_v" USING btree ("version_current_edition_id");
  ALTER TABLE "sessions" DROP COLUMN "import_key";
  ALTER TABLE "_sessions_v" DROP COLUMN "version_import_key";
  ALTER TABLE "community_events" DROP COLUMN "seed_revision";
  ALTER TABLE "community_events" DROP COLUMN "edition_year";
  ALTER TABLE "community_events" DROP COLUMN "tagline";
  ALTER TABLE "community_events" DROP COLUMN "cover_image_id";
  ALTER TABLE "community_events" DROP COLUMN "registration_status";
  ALTER TABLE "community_events" DROP COLUMN "registration_label";
  ALTER TABLE "community_events" DROP COLUMN "_status";
  ALTER TABLE "site_settings" DROP COLUMN "seed_revision";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_about_welcome_lead";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_about_welcome_line";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_programmes_intro";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_programmes_closing";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_programmes_access_note";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_connection_heading";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_connection_description";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_connection_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_ticker_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_events_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_highlights_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_highlights_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_highlights_heading";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_highlights_intro";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_seed_revision";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_about_welcome_lead";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_about_welcome_line";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_programmes_intro";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_programmes_closing";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_programmes_access_note";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_connection_heading";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_connection_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_connection_image_id";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_ticker_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_events_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_highlights_enabled";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_highlights_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_highlights_heading";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_highlights_intro";
  DROP TYPE "public"."enum_community_events_registration_status";
  DROP TYPE "public"."enum_community_events_status";
  DROP TYPE "public"."enum__community_events_v_version_event_kind";
  DROP TYPE "public"."enum__community_events_v_version_registration_status";
  DROP TYPE "public"."enum__community_events_v_version_schedule_mode";
  DROP TYPE "public"."enum__community_events_v_version_live_status";
  DROP TYPE "public"."enum__community_events_v_version_source";
  DROP TYPE "public"."enum__community_events_v_version_upstream_status";
  DROP TYPE "public"."enum__community_events_v_version_status";`)
}
