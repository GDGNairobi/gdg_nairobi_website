import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "community_hero_photos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer
  );

  CREATE TABLE "_community_hero_photos_v" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "_uuid" varchar
  );

  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_photo_caption" varchar DEFAULT 'There is a seat for you here.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_photo_caption" varchar DEFAULT 'There is a seat for you here.';
  ALTER TABLE "community_hero_photos" ADD CONSTRAINT "community_hero_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "community_hero_photos" ADD CONSTRAINT "community_hero_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_hero_photos_v" ADD CONSTRAINT "_community_hero_photos_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_hero_photos_v" ADD CONSTRAINT "_community_hero_photos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "community_hero_photos_order_idx" ON "community_hero_photos" USING btree ("_order");
  CREATE INDEX "community_hero_photos_parent_id_idx" ON "community_hero_photos" USING btree ("_parent_id");
  CREATE INDEX "community_hero_photos_image_idx" ON "community_hero_photos" USING btree ("image_id");
  CREATE INDEX "_community_hero_photos_v_order_idx" ON "_community_hero_photos_v" USING btree ("_order");
  CREATE INDEX "_community_hero_photos_v_parent_id_idx" ON "_community_hero_photos_v" USING btree ("_parent_id");
  CREATE INDEX "_community_hero_photos_v_image_idx" ON "_community_hero_photos_v" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "community_hero_photos" CASCADE;
  DROP TABLE "_community_hero_photos_v" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_photo_caption";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_photo_caption";`)
}
