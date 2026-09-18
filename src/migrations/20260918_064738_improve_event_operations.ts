import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sessions_session_status" AS ENUM('scheduled', 'delayed', 'live', 'complete', 'cancelled');
  CREATE TYPE "public"."enum__sessions_v_version_session_status" AS ENUM('scheduled', 'delayed', 'live', 'complete', 'cancelled');
  ALTER TABLE "community_events" ALTER COLUMN "upstream_u_r_l" DROP NOT NULL;
  ALTER TABLE "sessions" ADD COLUMN "schedule_track" varchar;
  ALTER TABLE "sessions" ADD COLUMN "session_status" "enum_sessions_session_status" DEFAULT 'scheduled';
  ALTER TABLE "sessions" ADD COLUMN "public_note" varchar;
  ALTER TABLE "_sessions_v" ADD COLUMN "version_schedule_track" varchar;
  ALTER TABLE "_sessions_v" ADD COLUMN "version_session_status" "enum__sessions_v_version_session_status" DEFAULT 'scheduled';
  ALTER TABLE "_sessions_v" ADD COLUMN "version_public_note" varchar;
  ALTER TABLE "community_events" ADD COLUMN "local_start_date" timestamp(3) with time zone;
  ALTER TABLE "community_events" ADD COLUMN "local_registration_u_r_l" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "community_events" ALTER COLUMN "upstream_u_r_l" SET NOT NULL;
  ALTER TABLE "sessions" DROP COLUMN "schedule_track";
  ALTER TABLE "sessions" DROP COLUMN "session_status";
  ALTER TABLE "sessions" DROP COLUMN "public_note";
  ALTER TABLE "_sessions_v" DROP COLUMN "version_schedule_track";
  ALTER TABLE "_sessions_v" DROP COLUMN "version_session_status";
  ALTER TABLE "_sessions_v" DROP COLUMN "version_public_note";
  ALTER TABLE "community_events" DROP COLUMN "local_start_date";
  ALTER TABLE "community_events" DROP COLUMN "local_registration_u_r_l";
  DROP TYPE "public"."enum_sessions_session_status";
  DROP TYPE "public"."enum__sessions_v_version_session_status";`)
}
