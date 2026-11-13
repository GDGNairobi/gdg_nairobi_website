import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "community_events" ADD COLUMN "schedule_sheet_u_r_l" varchar;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_schedule_sheet_u_r_l" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "community_events" DROP COLUMN "schedule_sheet_u_r_l";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_schedule_sheet_u_r_l";`)
}
