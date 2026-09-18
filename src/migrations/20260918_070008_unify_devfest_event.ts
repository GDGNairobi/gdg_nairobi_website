import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_events_event_kind" AS ENUM('community', 'workshop', 'devfest', 'io-extended', 'build-with-ai');
  ALTER TABLE "devfest_editions" ADD COLUMN "event_id" integer;
  ALTER TABLE "_devfest_editions_v" ADD COLUMN "version_event_id" integer;
  ALTER TABLE "community_events" ADD COLUMN "event_kind" "enum_community_events_event_kind" DEFAULT 'community' NOT NULL;
  ALTER TABLE "devfest_editions" ADD CONSTRAINT "devfest_editions_event_id_community_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_devfest_editions_v" ADD CONSTRAINT "_devfest_editions_v_version_event_id_community_events_id_fk" FOREIGN KEY ("version_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "devfest_editions_event_idx" ON "devfest_editions" USING btree ("event_id");
  CREATE INDEX "_devfest_editions_v_version_version_event_idx" ON "_devfest_editions_v" USING btree ("version_event_id");

  INSERT INTO "community_events" (
    "source", "event_kind", "local_title", "local_description", "local_label",
    "event_destination", "slug", "schedule_mode", "live_status",
    "local_registration_u_r_l", "show_on_site", "featured", "display_order"
  )
  VALUES (
    'manual', 'devfest', 'DevFest Nairobi 2026',
    'A community-driven developer festival in Nairobi with technical sessions, hands-on workshops, and space for developers to learn and connect.',
    'DevFest', 'schedule', 'devfest-nairobi-2026', 'multi', 'scheduled',
    'https://gdg.community.dev/gdg-nairobi/', true, true, -100
  )
  ON CONFLICT ("slug") DO UPDATE SET
    "event_kind" = 'devfest',
    "event_destination" = 'schedule',
    "schedule_mode" = 'multi',
    "featured" = true,
    "updated_at" = NOW();

  INSERT INTO "devfest_editions" (
    "title", "year", "slug", "status", "event_id",
    "hero_headline", "hero_accent_line", "hero_description", "_status"
  )
  SELECT
    'DevFest Nairobi 2026', 2026, 'devfest-nairobi-2026', 'announcement', event."id",
    'The future', 'grows here.',
    'A community-led conference where developers connect, learn, and build with Google technologies.',
    'published'
  FROM "community_events" event
  WHERE event."slug" = 'devfest-nairobi-2026'
  ON CONFLICT ("year") DO UPDATE SET
    "event_id" = EXCLUDED."event_id",
    "updated_at" = NOW();

  UPDATE "sessions"
  SET "event_id" = (SELECT "id" FROM "community_events" WHERE "slug" = 'devfest-nairobi-2026')
  WHERE "event_id" IS NULL;

  UPDATE "site_settings"
  SET "current_edition_id" = COALESCE(
    "current_edition_id",
    (SELECT "id" FROM "devfest_editions" WHERE "year" = 2026)
  );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "devfest_editions" DROP CONSTRAINT "devfest_editions_event_id_community_events_id_fk";
  
  ALTER TABLE "_devfest_editions_v" DROP CONSTRAINT "_devfest_editions_v_version_event_id_community_events_id_fk";
  
  DROP INDEX "devfest_editions_event_idx";
  DROP INDEX "_devfest_editions_v_version_version_event_idx";
  ALTER TABLE "devfest_editions" DROP COLUMN "event_id";
  ALTER TABLE "_devfest_editions_v" DROP COLUMN "version_event_id";
  ALTER TABLE "community_events" DROP COLUMN "event_kind";
  DROP TYPE "public"."enum_community_events_event_kind";`)
}
