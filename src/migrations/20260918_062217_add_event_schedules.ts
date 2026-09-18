import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_events_event_destination" AS ENUM('community', 'schedule');
  CREATE TYPE "public"."enum_community_events_schedule_mode" AS ENUM('single', 'multi');
  CREATE TYPE "public"."enum_community_events_live_status" AS ENUM('scheduled', 'delayed', 'live', 'complete');
  ALTER TABLE "sessions" ADD COLUMN "event_id" integer;
  ALTER TABLE "_sessions_v" ADD COLUMN "version_event_id" integer;
  ALTER TABLE "community_events" ADD COLUMN "event_destination" "enum_community_events_event_destination" DEFAULT 'community' NOT NULL;
  ALTER TABLE "community_events" ADD COLUMN "slug" varchar;
  ALTER TABLE "community_events" ADD COLUMN "schedule_mode" "enum_community_events_schedule_mode" DEFAULT 'single';
  ALTER TABLE "community_events" ADD COLUMN "local_title" varchar;
  ALTER TABLE "community_events" ADD COLUMN "local_description" varchar;
  ALTER TABLE "community_events" ADD COLUMN "venue_name" varchar;
  ALTER TABLE "community_events" ADD COLUMN "venue_address" varchar;
  ALTER TABLE "community_events" ADD COLUMN "live_status" "enum_community_events_live_status" DEFAULT 'scheduled';
  ALTER TABLE "community_events" ADD COLUMN "schedule_offset_minutes" numeric DEFAULT 0;
  ALTER TABLE "community_events" ADD COLUMN "schedule_notice" varchar;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_event_id_community_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sessions_v" ADD CONSTRAINT "_sessions_v_version_event_id_community_events_id_fk" FOREIGN KEY ("version_event_id") REFERENCES "public"."community_events"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sessions_event_idx" ON "sessions" USING btree ("event_id");
  CREATE INDEX "_sessions_v_version_version_event_idx" ON "_sessions_v" USING btree ("version_event_id");
  CREATE UNIQUE INDEX "community_events_slug_idx" ON "community_events" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" DROP CONSTRAINT "sessions_event_id_community_events_id_fk";
  
  ALTER TABLE "_sessions_v" DROP CONSTRAINT "_sessions_v_version_event_id_community_events_id_fk";
  
  DROP INDEX "sessions_event_idx";
  DROP INDEX "_sessions_v_version_version_event_idx";
  DROP INDEX "community_events_slug_idx";
  ALTER TABLE "sessions" DROP COLUMN "event_id";
  ALTER TABLE "_sessions_v" DROP COLUMN "version_event_id";
  ALTER TABLE "community_events" DROP COLUMN "event_destination";
  ALTER TABLE "community_events" DROP COLUMN "slug";
  ALTER TABLE "community_events" DROP COLUMN "schedule_mode";
  ALTER TABLE "community_events" DROP COLUMN "local_title";
  ALTER TABLE "community_events" DROP COLUMN "local_description";
  ALTER TABLE "community_events" DROP COLUMN "venue_name";
  ALTER TABLE "community_events" DROP COLUMN "venue_address";
  ALTER TABLE "community_events" DROP COLUMN "live_status";
  ALTER TABLE "community_events" DROP COLUMN "schedule_offset_minutes";
  ALTER TABLE "community_events" DROP COLUMN "schedule_notice";
  DROP TYPE "public"."enum_community_events_event_destination";
  DROP TYPE "public"."enum_community_events_schedule_mode";
  DROP TYPE "public"."enum_community_events_live_status";`)
}
