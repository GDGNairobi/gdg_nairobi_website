import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "community_events_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "partners_id" integer
  );

  CREATE TABLE "_community_events_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "partners_id" integer
  );

  ALTER TABLE "speakers" ADD COLUMN "is_organization" boolean DEFAULT false;
  ALTER TABLE "_speakers_v" ADD COLUMN "version_is_organization" boolean DEFAULT false;
  ALTER TABLE "community_events_rels" ADD CONSTRAINT "community_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_events_rels" ADD CONSTRAINT "community_events_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_events_v_rels" ADD CONSTRAINT "_community_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_community_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_events_v_rels" ADD CONSTRAINT "_community_events_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "community_events_rels_order_idx" ON "community_events_rels" USING btree ("order");
  CREATE INDEX "community_events_rels_parent_idx" ON "community_events_rels" USING btree ("parent_id");
  CREATE INDEX "community_events_rels_path_idx" ON "community_events_rels" USING btree ("path");
  CREATE INDEX "community_events_rels_partners_id_idx" ON "community_events_rels" USING btree ("partners_id");
  CREATE INDEX "_community_events_v_rels_order_idx" ON "_community_events_v_rels" USING btree ("order");
  CREATE INDEX "_community_events_v_rels_parent_idx" ON "_community_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_community_events_v_rels_path_idx" ON "_community_events_v_rels" USING btree ("path");
  CREATE INDEX "_community_events_v_rels_partners_id_idx" ON "_community_events_v_rels" USING btree ("partners_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "community_events_rels" CASCADE;
  DROP TABLE "_community_events_v_rels" CASCADE;
  ALTER TABLE "speakers" DROP COLUMN "is_organization";
  ALTER TABLE "_speakers_v" DROP COLUMN "version_is_organization";`)
}
