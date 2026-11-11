import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_rewind_photos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "day" varchar
  );

  CREATE TABLE "_event_rewind_photos_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "day" varchar,
    "_uuid" varchar
  );

  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_hidden" boolean DEFAULT false;
  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_year" numeric;
  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_heading" varchar;
  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_description" varchar;
  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_day_one_album_u_r_l" varchar;
  ALTER TABLE "community_events" ADD COLUMN "photo_rewind_day_two_album_u_r_l" varchar;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_hidden" boolean DEFAULT false;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_year" numeric;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_heading" varchar;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_description" varchar;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_day_one_album_u_r_l" varchar;
  ALTER TABLE "_community_events_v" ADD COLUMN "version_photo_rewind_day_two_album_u_r_l" varchar;
  ALTER TABLE "event_rewind_photos" ADD CONSTRAINT "event_rewind_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_rewind_photos" ADD CONSTRAINT "event_rewind_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_event_rewind_photos_v" ADD CONSTRAINT "_event_rewind_photos_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_event_rewind_photos_v" ADD CONSTRAINT "_event_rewind_photos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_events_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_rewind_photos_order_idx" ON "event_rewind_photos" USING btree ("_order");
  CREATE INDEX "event_rewind_photos_parent_id_idx" ON "event_rewind_photos" USING btree ("_parent_id");
  CREATE INDEX "event_rewind_photos_image_idx" ON "event_rewind_photos" USING btree ("image_id");
  CREATE INDEX "_event_rewind_photos_v_order_idx" ON "_event_rewind_photos_v" USING btree ("_order");
  CREATE INDEX "_event_rewind_photos_v_parent_id_idx" ON "_event_rewind_photos_v" USING btree ("_parent_id");
  CREATE INDEX "_event_rewind_photos_v_image_idx" ON "_event_rewind_photos_v" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "event_rewind_photos" CASCADE;
  DROP TABLE "_event_rewind_photos_v" CASCADE;
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_hidden";
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_year";
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_heading";
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_description";
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_day_one_album_u_r_l";
  ALTER TABLE "community_events" DROP COLUMN "photo_rewind_day_two_album_u_r_l";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_hidden";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_year";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_heading";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_description";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_day_one_album_u_r_l";
  ALTER TABLE "_community_events_v" DROP COLUMN "version_photo_rewind_day_two_album_u_r_l";`)
}
