import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_devfest_editions_calls_to_action_style" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_devfest_editions_tracks_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TYPE "public"."enum_devfest_editions_event_phase" AS ENUM('announcement', 'cfp-open', 'registration-open', 'live', 'ended');
  CREATE TYPE "public"."enum_devfest_editions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__devfest_editions_v_version_calls_to_action_style" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__devfest_editions_v_version_tracks_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TYPE "public"."enum__devfest_editions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_speakers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__speakers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sessions_track" AS ENUM('ai', 'web-mobile', 'cloud', 'open');
  CREATE TYPE "public"."enum_sessions_format" AS ENUM('talk', 'workshop', 'keynote', 'panel', 'break');
  CREATE TYPE "public"."enum_sessions_level" AS ENUM('all', 'beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_sessions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sessions_v_version_track" AS ENUM('ai', 'web-mobile', 'cloud', 'open');
  CREATE TYPE "public"."enum__sessions_v_version_format" AS ENUM('talk', 'workshop', 'keynote', 'panel', 'break');
  CREATE TYPE "public"."enum__sessions_v_version_level" AS ENUM('all', 'beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum__sessions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_partners_tier" AS ENUM('host', 'platinum', 'gold', 'silver', 'community');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_version_tier" AS ENUM('host', 'platinum', 'gold', 'silver', 'community');
  CREATE TYPE "public"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_announcements_kind" AS ENUM('info', 'cfp', 'tickets', 'urgent');
  CREATE TYPE "public"."enum_announcements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__announcements_v_version_kind" AS ENUM('info', 'cfp', 'tickets', 'urgent');
  CREATE TYPE "public"."enum__announcements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_community_events_source" AS ENUM('bevy');
  CREATE TYPE "public"."enum_community_events_upstream_status" AS ENUM('live', 'completed', 'stale');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_portrait_url" varchar,
  	"sizes_portrait_width" numeric,
  	"sizes_portrait_height" numeric,
  	"sizes_portrait_mime_type" varchar,
  	"sizes_portrait_filesize" numeric,
  	"sizes_portrait_filename" varchar
  );
  
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
  
  CREATE TABLE "devfest_editions_statistics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "devfest_editions" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "speakers_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "speakers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"portrait_id" integer,
  	"job_title" varchar,
  	"company" varchar,
  	"bio" jsonb,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_speakers_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "speakers_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_speakers_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_speakers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_portrait_id" integer,
  	"version_job_title" varchar,
  	"version_company" varchar,
  	"version_bio" jsonb,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__speakers_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_speakers_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"room" varchar,
  	"track" "enum_sessions_track",
  	"format" "enum_sessions_format",
  	"level" "enum_sessions_level" DEFAULT 'all',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sessions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "sessions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"speakers_id" integer
  );
  
  CREATE TABLE "_sessions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_room" varchar,
  	"version_track" "enum__sessions_v_version_track",
  	"version_format" "enum__sessions_v_version_format",
  	"version_level" "enum__sessions_v_version_level" DEFAULT 'all',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sessions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_sessions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"speakers_id" integer
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_id" integer,
  	"url" varchar,
  	"tier" "enum_partners_tier",
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_partners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_logo_id" integer,
  	"version_url" varchar,
  	"version_tier" "enum__partners_v_version_tier",
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "team_members_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"bio" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_members_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_role" varchar,
  	"version_photo_id" integer,
  	"version_bio" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"message" varchar,
  	"kind" "enum_announcements_kind" DEFAULT 'info',
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"link_label" varchar,
  	"link_u_r_l" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_announcements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_announcements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_message" varchar,
  	"version_kind" "enum__announcements_v_version_kind" DEFAULT 'info',
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_link_label" varchar,
  	"version_link_u_r_l" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__announcements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "community_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum_community_events_source" DEFAULT 'bevy' NOT NULL,
  	"upstream_u_r_l" varchar NOT NULL,
  	"source_title" varchar NOT NULL,
  	"source_start_date" timestamp(3) with time zone NOT NULL,
  	"source_type" varchar,
  	"registration_u_r_l" varchar,
  	"image_u_r_l" varchar,
  	"excerpt" varchar,
  	"upstream_status" "enum_community_events_upstream_status" NOT NULL,
  	"last_synced_at" timestamp(3) with time zone NOT NULL,
  	"show_on_site" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"local_label" varchar,
  	"display_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"devfest_editions_id" integer,
  	"speakers_id" integer,
  	"sessions_id" integer,
  	"partners_id" integer,
  	"team_members_id" integer,
  	"announcements_id" integer,
  	"community_events_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'DevFest Nairobi',
  	"brand_label" varchar DEFAULT 'DevFest',
  	"edition_label" varchar DEFAULT 'Nairobi 2026',
  	"current_edition_id" integer,
  	"header_c_t_a_label" varchar DEFAULT 'Join GDG Nairobi',
  	"header_c_t_a_url" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/',
  	"footer_note" varchar DEFAULT 'Made by the community, for the community. GDG Nairobi is an independent group.',
  	"seo_title" varchar DEFAULT 'DevFest Nairobi 2026 — The Future Grows Here',
  	"seo_description" varchar,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v_version_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_footer_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'DevFest Nairobi',
  	"version_brand_label" varchar DEFAULT 'DevFest',
  	"version_edition_label" varchar DEFAULT 'Nairobi 2026',
  	"version_current_edition_id" integer,
  	"version_header_c_t_a_label" varchar DEFAULT 'Join GDG Nairobi',
  	"version_header_c_t_a_url" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/',
  	"version_footer_note" varchar DEFAULT 'Made by the community, for the community. GDG Nairobi is an independent group.',
  	"version_seo_title" varchar DEFAULT 'DevFest Nairobi 2026 — The Future Grows Here',
  	"version_seo_description" varchar,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_hero_signals" ADD CONSTRAINT "devfest_editions_hero_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_calls_to_action" ADD CONSTRAINT "devfest_editions_calls_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_ticker_items" ADD CONSTRAINT "devfest_editions_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "story_paragraphs" ADD CONSTRAINT "story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_tracks" ADD CONSTRAINT "devfest_editions_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_items" ADD CONSTRAINT "experience_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions_statistics" ADD CONSTRAINT "devfest_editions_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_hero_artwork_id_media_id_fk" FOREIGN KEY ("hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_featured_community_event_id_community_events_id_fk" FOREIGN KEY ("featured_community_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devfest_editions_texts" ADD CONSTRAINT "devfest_editions_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_hero_signals" ADD CONSTRAINT "_devfest_editions_v_version_hero_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_calls_to_action" ADD CONSTRAINT "_devfest_editions_v_version_calls_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_ticker_items" ADD CONSTRAINT "_devfest_editions_v_version_ticker_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_story_paragraphs_v" ADD CONSTRAINT "_story_paragraphs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_tracks" ADD CONSTRAINT "_devfest_editions_v_version_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_items_v" ADD CONSTRAINT "_experience_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_version_statistics" ADD CONSTRAINT "_devfest_editions_v_version_statistics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_parent_id_devfest_editions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_hero_artwork_id_media_id_fk" FOREIGN KEY ("version_hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_featured_community_event_id_community_events_id_fk" FOREIGN KEY ("version_featured_community_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v_texts" ADD CONSTRAINT "_devfest_editions_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers_links" ADD CONSTRAINT "speakers_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "speakers_texts" ADD CONSTRAINT "speakers_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_speakers_v_version_links" ADD CONSTRAINT "_speakers_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_speakers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_speakers_v" ADD CONSTRAINT "_speakers_v_parent_id_speakers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_speakers_v" ADD CONSTRAINT "_speakers_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_speakers_v_texts" ADD CONSTRAINT "_speakers_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_speakers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sessions_v" ADD CONSTRAINT "_sessions_v_parent_id_sessions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sessions_v_rels" ADD CONSTRAINT "_sessions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_sessions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sessions_v_rels" ADD CONSTRAINT "_sessions_v_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_links" ADD CONSTRAINT "team_members_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_links" ADD CONSTRAINT "_team_members_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_announcements_v" ADD CONSTRAINT "_announcements_v_parent_id_announcements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."announcements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_devfest_editions_fk" FOREIGN KEY ("devfest_editions_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_community_events_fk" FOREIGN KEY ("community_events_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_groups_links" ADD CONSTRAINT "site_settings_footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_groups" ADD CONSTRAINT "site_settings_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_current_edition_id_devfest_editions_id_fk" FOREIGN KEY ("current_edition_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_navigation" ADD CONSTRAINT "_site_settings_v_version_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_social_links" ADD CONSTRAINT "_site_settings_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_footer_groups_links" ADD CONSTRAINT "_site_settings_v_version_footer_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_footer_groups" ADD CONSTRAINT "_site_settings_v_version_footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_current_edition_id_devfest_editions_id_fk" FOREIGN KEY ("version_current_edition_id") REFERENCES "public"."devfest_editions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");
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
  CREATE INDEX "devfest_editions_statistics_order_idx" ON "devfest_editions_statistics" USING btree ("_order");
  CREATE INDEX "devfest_editions_statistics_parent_id_idx" ON "devfest_editions_statistics" USING btree ("_parent_id");
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
  CREATE INDEX "_devfest_editions_v_version_statistics_order_idx" ON "_devfest_editions_v_version_statistics" USING btree ("_order");
  CREATE INDEX "_devfest_editions_v_version_statistics_parent_id_idx" ON "_devfest_editions_v_version_statistics" USING btree ("_parent_id");
  CREATE INDEX "_devfest_editions_v_parent_idx" ON "_devfest_editions_v" USING btree ("parent_id");
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
  CREATE INDEX "speakers_links_order_idx" ON "speakers_links" USING btree ("_order");
  CREATE INDEX "speakers_links_parent_id_idx" ON "speakers_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "speakers_slug_idx" ON "speakers" USING btree ("slug");
  CREATE INDEX "speakers_portrait_idx" ON "speakers" USING btree ("portrait_id");
  CREATE INDEX "speakers_updated_at_idx" ON "speakers" USING btree ("updated_at");
  CREATE INDEX "speakers_created_at_idx" ON "speakers" USING btree ("created_at");
  CREATE INDEX "speakers__status_idx" ON "speakers" USING btree ("_status");
  CREATE INDEX "speakers_texts_order_parent" ON "speakers_texts" USING btree ("order","parent_id");
  CREATE INDEX "_speakers_v_version_links_order_idx" ON "_speakers_v_version_links" USING btree ("_order");
  CREATE INDEX "_speakers_v_version_links_parent_id_idx" ON "_speakers_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_speakers_v_parent_idx" ON "_speakers_v" USING btree ("parent_id");
  CREATE INDEX "_speakers_v_version_version_slug_idx" ON "_speakers_v" USING btree ("version_slug");
  CREATE INDEX "_speakers_v_version_version_portrait_idx" ON "_speakers_v" USING btree ("version_portrait_id");
  CREATE INDEX "_speakers_v_version_version_updated_at_idx" ON "_speakers_v" USING btree ("version_updated_at");
  CREATE INDEX "_speakers_v_version_version_created_at_idx" ON "_speakers_v" USING btree ("version_created_at");
  CREATE INDEX "_speakers_v_version_version__status_idx" ON "_speakers_v" USING btree ("version__status");
  CREATE INDEX "_speakers_v_created_at_idx" ON "_speakers_v" USING btree ("created_at");
  CREATE INDEX "_speakers_v_updated_at_idx" ON "_speakers_v" USING btree ("updated_at");
  CREATE INDEX "_speakers_v_latest_idx" ON "_speakers_v" USING btree ("latest");
  CREATE INDEX "_speakers_v_autosave_idx" ON "_speakers_v" USING btree ("autosave");
  CREATE INDEX "_speakers_v_texts_order_parent" ON "_speakers_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "sessions_slug_idx" ON "sessions" USING btree ("slug");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions__status_idx" ON "sessions" USING btree ("_status");
  CREATE INDEX "sessions_rels_order_idx" ON "sessions_rels" USING btree ("order");
  CREATE INDEX "sessions_rels_parent_idx" ON "sessions_rels" USING btree ("parent_id");
  CREATE INDEX "sessions_rels_path_idx" ON "sessions_rels" USING btree ("path");
  CREATE INDEX "sessions_rels_speakers_id_idx" ON "sessions_rels" USING btree ("speakers_id");
  CREATE INDEX "_sessions_v_parent_idx" ON "_sessions_v" USING btree ("parent_id");
  CREATE INDEX "_sessions_v_version_version_slug_idx" ON "_sessions_v" USING btree ("version_slug");
  CREATE INDEX "_sessions_v_version_version_updated_at_idx" ON "_sessions_v" USING btree ("version_updated_at");
  CREATE INDEX "_sessions_v_version_version_created_at_idx" ON "_sessions_v" USING btree ("version_created_at");
  CREATE INDEX "_sessions_v_version_version__status_idx" ON "_sessions_v" USING btree ("version__status");
  CREATE INDEX "_sessions_v_created_at_idx" ON "_sessions_v" USING btree ("created_at");
  CREATE INDEX "_sessions_v_updated_at_idx" ON "_sessions_v" USING btree ("updated_at");
  CREATE INDEX "_sessions_v_latest_idx" ON "_sessions_v" USING btree ("latest");
  CREATE INDEX "_sessions_v_autosave_idx" ON "_sessions_v" USING btree ("autosave");
  CREATE INDEX "_sessions_v_rels_order_idx" ON "_sessions_v_rels" USING btree ("order");
  CREATE INDEX "_sessions_v_rels_parent_idx" ON "_sessions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_sessions_v_rels_path_idx" ON "_sessions_v_rels" USING btree ("path");
  CREATE INDEX "_sessions_v_rels_speakers_id_idx" ON "_sessions_v_rels" USING btree ("speakers_id");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "partners__status_idx" ON "partners" USING btree ("_status");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_logo_idx" ON "_partners_v" USING btree ("version_logo_id");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_latest_idx" ON "_partners_v" USING btree ("latest");
  CREATE INDEX "_partners_v_autosave_idx" ON "_partners_v" USING btree ("autosave");
  CREATE INDEX "team_members_links_order_idx" ON "team_members_links" USING btree ("_order");
  CREATE INDEX "team_members_links_parent_id_idx" ON "team_members_links" USING btree ("_parent_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE INDEX "_team_members_v_version_links_order_idx" ON "_team_members_v_version_links" USING btree ("_order");
  CREATE INDEX "_team_members_v_version_links_parent_id_idx" ON "_team_members_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "_team_members_v_autosave_idx" ON "_team_members_v" USING btree ("autosave");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "announcements__status_idx" ON "announcements" USING btree ("_status");
  CREATE INDEX "_announcements_v_parent_idx" ON "_announcements_v" USING btree ("parent_id");
  CREATE INDEX "_announcements_v_version_version_updated_at_idx" ON "_announcements_v" USING btree ("version_updated_at");
  CREATE INDEX "_announcements_v_version_version_created_at_idx" ON "_announcements_v" USING btree ("version_created_at");
  CREATE INDEX "_announcements_v_version_version__status_idx" ON "_announcements_v" USING btree ("version__status");
  CREATE INDEX "_announcements_v_created_at_idx" ON "_announcements_v" USING btree ("created_at");
  CREATE INDEX "_announcements_v_updated_at_idx" ON "_announcements_v" USING btree ("updated_at");
  CREATE INDEX "_announcements_v_latest_idx" ON "_announcements_v" USING btree ("latest");
  CREATE INDEX "_announcements_v_autosave_idx" ON "_announcements_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "community_events_upstream_u_r_l_idx" ON "community_events" USING btree ("upstream_u_r_l");
  CREATE INDEX "community_events_updated_at_idx" ON "community_events" USING btree ("updated_at");
  CREATE INDEX "community_events_created_at_idx" ON "community_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_devfest_editions_id_idx" ON "payload_locked_documents_rels" USING btree ("devfest_editions_id");
  CREATE INDEX "payload_locked_documents_rels_speakers_id_idx" ON "payload_locked_documents_rels" USING btree ("speakers_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_community_events_id_idx" ON "payload_locked_documents_rels" USING btree ("community_events_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_navigation_order_idx" ON "site_settings_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_parent_id_idx" ON "site_settings_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_groups_links_order_idx" ON "site_settings_footer_groups_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_groups_links_parent_id_idx" ON "site_settings_footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_groups_order_idx" ON "site_settings_footer_groups" USING btree ("_order");
  CREATE INDEX "site_settings_footer_groups_parent_id_idx" ON "site_settings_footer_groups" USING btree ("_parent_id");
  CREATE INDEX "site_settings_current_edition_idx" ON "site_settings" USING btree ("current_edition_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_navigation_order_idx" ON "_site_settings_v_version_navigation" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_navigation_parent_id_idx" ON "_site_settings_v_version_navigation" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_social_links_order_idx" ON "_site_settings_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_social_links_parent_id_idx" ON "_site_settings_v_version_social_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_footer_groups_links_order_idx" ON "_site_settings_v_version_footer_groups_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_footer_groups_links_parent_id_idx" ON "_site_settings_v_version_footer_groups_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_footer_groups_order_idx" ON "_site_settings_v_version_footer_groups" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_footer_groups_parent_id_idx" ON "_site_settings_v_version_footer_groups" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_version_current_edition_idx" ON "_site_settings_v" USING btree ("version_current_edition_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_site_settings_v_autosave_idx" ON "_site_settings_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "devfest_editions_hero_signals" CASCADE;
  DROP TABLE "devfest_editions_calls_to_action" CASCADE;
  DROP TABLE "devfest_editions_ticker_items" CASCADE;
  DROP TABLE "story_paragraphs" CASCADE;
  DROP TABLE "devfest_editions_tracks" CASCADE;
  DROP TABLE "experience_items" CASCADE;
  DROP TABLE "devfest_editions_statistics" CASCADE;
  DROP TABLE "devfest_editions" CASCADE;
  DROP TABLE "devfest_editions_texts" CASCADE;
  DROP TABLE "_devfest_editions_v_version_hero_signals" CASCADE;
  DROP TABLE "_devfest_editions_v_version_calls_to_action" CASCADE;
  DROP TABLE "_devfest_editions_v_version_ticker_items" CASCADE;
  DROP TABLE "_story_paragraphs_v" CASCADE;
  DROP TABLE "_devfest_editions_v_version_tracks" CASCADE;
  DROP TABLE "_experience_items_v" CASCADE;
  DROP TABLE "_devfest_editions_v_version_statistics" CASCADE;
  DROP TABLE "_devfest_editions_v" CASCADE;
  DROP TABLE "_devfest_editions_v_texts" CASCADE;
  DROP TABLE "speakers_links" CASCADE;
  DROP TABLE "speakers" CASCADE;
  DROP TABLE "speakers_texts" CASCADE;
  DROP TABLE "_speakers_v_version_links" CASCADE;
  DROP TABLE "_speakers_v" CASCADE;
  DROP TABLE "_speakers_v_texts" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "sessions_rels" CASCADE;
  DROP TABLE "_sessions_v" CASCADE;
  DROP TABLE "_sessions_v_rels" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  DROP TABLE "team_members_links" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "_team_members_v_version_links" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "_announcements_v" CASCADE;
  DROP TABLE "community_events" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_navigation" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings_footer_groups_links" CASCADE;
  DROP TABLE "site_settings_footer_groups" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v_version_navigation" CASCADE;
  DROP TABLE "_site_settings_v_version_social_links" CASCADE;
  DROP TABLE "_site_settings_v_version_footer_groups_links" CASCADE;
  DROP TABLE "_site_settings_v_version_footer_groups" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_devfest_editions_calls_to_action_style";
  DROP TYPE "public"."enum_devfest_editions_tracks_accent";
  DROP TYPE "public"."enum_devfest_editions_event_phase";
  DROP TYPE "public"."enum_devfest_editions_status";
  DROP TYPE "public"."enum__devfest_editions_v_version_calls_to_action_style";
  DROP TYPE "public"."enum__devfest_editions_v_version_tracks_accent";
  DROP TYPE "public"."enum__devfest_editions_v_version_status";
  DROP TYPE "public"."enum_speakers_status";
  DROP TYPE "public"."enum__speakers_v_version_status";
  DROP TYPE "public"."enum_sessions_track";
  DROP TYPE "public"."enum_sessions_format";
  DROP TYPE "public"."enum_sessions_level";
  DROP TYPE "public"."enum_sessions_status";
  DROP TYPE "public"."enum__sessions_v_version_track";
  DROP TYPE "public"."enum__sessions_v_version_format";
  DROP TYPE "public"."enum__sessions_v_version_level";
  DROP TYPE "public"."enum__sessions_v_version_status";
  DROP TYPE "public"."enum_partners_tier";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum__partners_v_version_tier";
  DROP TYPE "public"."enum__partners_v_version_status";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum_announcements_kind";
  DROP TYPE "public"."enum_announcements_status";
  DROP TYPE "public"."enum__announcements_v_version_kind";
  DROP TYPE "public"."enum__announcements_v_version_status";
  DROP TYPE "public"."enum_community_events_source";
  DROP TYPE "public"."enum_community_events_upstream_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}
