import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "devfest_editions" ADD COLUMN "highlights_section_enabled" boolean DEFAULT true;
  ALTER TABLE "devfest_editions" ADD COLUMN "highlights_section_kicker" varchar DEFAULT 'Previously, in Nairobi';
  ALTER TABLE "devfest_editions" ADD COLUMN "highlights_section_heading" varchar DEFAULT 'Made by the community.';
  ALTER TABLE "devfest_editions" ADD COLUMN "highlights_section_intro" varchar DEFAULT 'A few moments, talks and builds from previous GDG Nairobi events.';
  ALTER TABLE "_devfest_editions_v" ADD COLUMN "version_highlights_section_enabled" boolean DEFAULT true;
  ALTER TABLE "_devfest_editions_v" ADD COLUMN "version_highlights_section_kicker" varchar DEFAULT 'Previously, in Nairobi';
  ALTER TABLE "_devfest_editions_v" ADD COLUMN "version_highlights_section_heading" varchar DEFAULT 'Made by the community.';
  ALTER TABLE "_devfest_editions_v" ADD COLUMN "version_highlights_section_intro" varchar DEFAULT 'A few moments, talks and builds from previous GDG Nairobi events.';
  ALTER TABLE "highlight_photos" ADD CONSTRAINT "highlight_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "highlight_photos" ADD CONSTRAINT "highlight_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "highlight_videos" ADD CONSTRAINT "highlight_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devfest_editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_highlight_photos_v" ADD CONSTRAINT "_highlight_photos_v_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_highlight_photos_v" ADD CONSTRAINT "_highlight_photos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_highlight_videos_v" ADD CONSTRAINT "_highlight_videos_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_devfest_editions_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "highlight_photos_order_idx" ON "highlight_photos" USING btree ("_order");
  CREATE INDEX "highlight_photos_parent_id_idx" ON "highlight_photos" USING btree ("_parent_id");
  CREATE INDEX "highlight_photos_image_idx" ON "highlight_photos" USING btree ("image_id");
  CREATE INDEX "highlight_videos_order_idx" ON "highlight_videos" USING btree ("_order");
  CREATE INDEX "highlight_videos_parent_id_idx" ON "highlight_videos" USING btree ("_parent_id");
  CREATE INDEX "_highlight_photos_v_order_idx" ON "_highlight_photos_v" USING btree ("_order");
  CREATE INDEX "_highlight_photos_v_parent_id_idx" ON "_highlight_photos_v" USING btree ("_parent_id");
  CREATE INDEX "_highlight_photos_v_image_idx" ON "_highlight_photos_v" USING btree ("image_id");
  CREATE INDEX "_highlight_videos_v_order_idx" ON "_highlight_videos_v" USING btree ("_order");
  CREATE INDEX "_highlight_videos_v_parent_id_idx" ON "_highlight_videos_v" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "highlight_photos" CASCADE;
  DROP TABLE "highlight_videos" CASCADE;
  DROP TABLE "_highlight_photos_v" CASCADE;
  DROP TABLE "_highlight_videos_v" CASCADE;
  ALTER TABLE "devfest_editions" DROP COLUMN "highlights_section_enabled";
  ALTER TABLE "devfest_editions" DROP COLUMN "highlights_section_kicker";
  ALTER TABLE "devfest_editions" DROP COLUMN "highlights_section_heading";
  ALTER TABLE "devfest_editions" DROP COLUMN "highlights_section_intro";
  ALTER TABLE "_devfest_editions_v" DROP COLUMN "version_highlights_section_enabled";
  ALTER TABLE "_devfest_editions_v" DROP COLUMN "version_highlights_section_kicker";
  ALTER TABLE "_devfest_editions_v" DROP COLUMN "version_highlights_section_heading";
  ALTER TABLE "_devfest_editions_v" DROP COLUMN "version_highlights_section_intro";`)
}
