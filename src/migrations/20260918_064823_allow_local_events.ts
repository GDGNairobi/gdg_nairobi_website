import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_community_events_source" ADD VALUE 'manual' BEFORE 'bevy';
  ALTER TABLE "community_events" ALTER COLUMN "source" SET DEFAULT 'manual';
  ALTER TABLE "community_events" ALTER COLUMN "source_title" DROP NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "source_start_date" DROP NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "upstream_status" DROP NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "last_synced_at" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "community_events"
   SET
    "source" = 'bevy',
    "source_title" = COALESCE("source_title", "local_title", 'Locally managed event'),
    "source_start_date" = COALESCE("source_start_date", "local_start_date", NOW()),
    "upstream_status" = COALESCE("upstream_status", 'live'),
    "last_synced_at" = COALESCE("last_synced_at", NOW());
  ALTER TABLE "community_events" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "community_events" ALTER COLUMN "source" SET DEFAULT 'bevy'::text;
  DROP TYPE "public"."enum_community_events_source";
  CREATE TYPE "public"."enum_community_events_source" AS ENUM('bevy');
  ALTER TABLE "community_events" ALTER COLUMN "source" SET DEFAULT 'bevy'::"public"."enum_community_events_source";
  ALTER TABLE "community_events" ALTER COLUMN "source" SET DATA TYPE "public"."enum_community_events_source" USING "source"::"public"."enum_community_events_source";
  ALTER TABLE "community_events" ALTER COLUMN "source_title" SET NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "source_start_date" SET NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "upstream_status" SET NOT NULL;
  ALTER TABLE "community_events" ALTER COLUMN "last_synced_at" SET NOT NULL;`)
}
