import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_community_pillars_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TYPE "public"."enum__community_pillars_v_accent" AS ENUM('blue', 'red', 'yellow', 'green');
  CREATE TABLE "community_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "community_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"accent" "enum_community_pillars_accent"
  );
  
  CREATE TABLE "ecosystem_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "_community_stats_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_community_pillars_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"accent" "enum__community_pillars_v_accent",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ecosystem_items_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'GDG Nairobi';
  ALTER TABLE "site_settings" ALTER COLUMN "brand_label" SET DEFAULT 'GDG';
  ALTER TABLE "site_settings" ALTER COLUMN "edition_label" SET DEFAULT 'Nairobi';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_note" SET DEFAULT 'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.';
  ALTER TABLE "site_settings" ALTER COLUMN "seo_title" SET DEFAULT 'GDG Nairobi — Learn, connect and build';
  ALTER TABLE "site_settings" ALTER COLUMN "seo_description" SET DEFAULT 'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_name" SET DEFAULT 'GDG Nairobi';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_brand_label" SET DEFAULT 'GDG';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_edition_label" SET DEFAULT 'Nairobi';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_footer_note" SET DEFAULT 'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_seo_title" SET DEFAULT 'GDG Nairobi — Learn, connect and build';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_seo_description" SET DEFAULT 'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_eyebrow" varchar DEFAULT 'GDG Nairobi · Volunteer-led';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_headline" varchar DEFAULT 'A developer community';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_accent_line" varchar DEFAULT 'for Nairobi.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_description" varchar DEFAULT 'Meet peers, learn through practical events and share experience around Google technologies and modern software development.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_primary_label" varchar DEFAULT 'Join the community';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_primary_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_secondary_label" varchar DEFAULT 'Explore events';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_hero_secondary_u_r_l" varchar DEFAULT '/events';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_about_kicker" varchar DEFAULT 'Community, all year round';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_about_heading" varchar DEFAULT 'Year-round events for Nairobi’s developer community.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_about_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_ecosystem_kicker" varchar DEFAULT 'More than code';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_ecosystem_heading" varchar DEFAULT 'Connected to the wider developer community.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_ecosystem_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_kicker" varchar DEFAULT 'Open to every experience level';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_heading" varchar DEFAULT 'Join GDG Nairobi.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_accent_line" varchar DEFAULT 'Start with the next event.';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_primary_label" varchar DEFAULT 'Join GDG Nairobi';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_primary_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_secondary_label" varchar DEFAULT 'Meet the organizers';
  ALTER TABLE "site_settings" ADD COLUMN "community_homepage_closing_secondary_u_r_l" varchar DEFAULT '/team';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_eyebrow" varchar DEFAULT 'GDG Nairobi · Volunteer-led';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_headline" varchar DEFAULT 'A developer community';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_accent_line" varchar DEFAULT 'for Nairobi.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_description" varchar DEFAULT 'Meet peers, learn through practical events and share experience around Google technologies and modern software development.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_primary_label" varchar DEFAULT 'Join the community';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_primary_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_secondary_label" varchar DEFAULT 'Explore events';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_hero_secondary_u_r_l" varchar DEFAULT '/events';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_about_kicker" varchar DEFAULT 'Community, all year round';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_about_heading" varchar DEFAULT 'Year-round events for Nairobi’s developer community.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_about_description" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_ecosystem_kicker" varchar DEFAULT 'More than code';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_ecosystem_heading" varchar DEFAULT 'Connected to the wider developer community.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_ecosystem_description" varchar;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_kicker" varchar DEFAULT 'Open to every experience level';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_heading" varchar DEFAULT 'Join GDG Nairobi.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_accent_line" varchar DEFAULT 'Start with the next event.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_primary_label" varchar DEFAULT 'Join GDG Nairobi';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_primary_u_r_l" varchar DEFAULT 'https://gdg.community.dev/gdg-nairobi/';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_secondary_label" varchar DEFAULT 'Meet the organizers';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_community_homepage_closing_secondary_u_r_l" varchar DEFAULT '/team';
  ALTER TABLE "community_stats" ADD CONSTRAINT "community_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_pillars" ADD CONSTRAINT "community_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ecosystem_items" ADD CONSTRAINT "ecosystem_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_stats_v" ADD CONSTRAINT "_community_stats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_pillars_v" ADD CONSTRAINT "_community_pillars_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ecosystem_items_v" ADD CONSTRAINT "_ecosystem_items_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "community_stats_order_idx" ON "community_stats" USING btree ("_order");
  CREATE INDEX "community_stats_parent_id_idx" ON "community_stats" USING btree ("_parent_id");
  CREATE INDEX "community_pillars_order_idx" ON "community_pillars" USING btree ("_order");
  CREATE INDEX "community_pillars_parent_id_idx" ON "community_pillars" USING btree ("_parent_id");
  CREATE INDEX "ecosystem_items_order_idx" ON "ecosystem_items" USING btree ("_order");
  CREATE INDEX "ecosystem_items_parent_id_idx" ON "ecosystem_items" USING btree ("_parent_id");
  CREATE INDEX "_community_stats_v_order_idx" ON "_community_stats_v" USING btree ("_order");
  CREATE INDEX "_community_stats_v_parent_id_idx" ON "_community_stats_v" USING btree ("_parent_id");
  CREATE INDEX "_community_pillars_v_order_idx" ON "_community_pillars_v" USING btree ("_order");
  CREATE INDEX "_community_pillars_v_parent_id_idx" ON "_community_pillars_v" USING btree ("_parent_id");
  CREATE INDEX "_ecosystem_items_v_order_idx" ON "_ecosystem_items_v" USING btree ("_order");
  CREATE INDEX "_ecosystem_items_v_parent_id_idx" ON "_ecosystem_items_v" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "community_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ecosystem_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_stats_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_pillars_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ecosystem_items_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "community_stats" CASCADE;
  DROP TABLE "community_pillars" CASCADE;
  DROP TABLE "ecosystem_items" CASCADE;
  DROP TABLE "_community_stats_v" CASCADE;
  DROP TABLE "_community_pillars_v" CASCADE;
  DROP TABLE "_ecosystem_items_v" CASCADE;
  ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT 'DevFest Nairobi';
  ALTER TABLE "site_settings" ALTER COLUMN "brand_label" SET DEFAULT 'DevFest';
  ALTER TABLE "site_settings" ALTER COLUMN "edition_label" SET DEFAULT 'Nairobi 2026';
  ALTER TABLE "site_settings" ALTER COLUMN "footer_note" SET DEFAULT 'Made by the community, for the community. GDG Nairobi is an independent group.';
  ALTER TABLE "site_settings" ALTER COLUMN "seo_title" SET DEFAULT 'DevFest Nairobi 2026 — The Future Grows Here';
  ALTER TABLE "site_settings" ALTER COLUMN "seo_description" DROP DEFAULT;
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_site_name" SET DEFAULT 'DevFest Nairobi';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_brand_label" SET DEFAULT 'DevFest';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_edition_label" SET DEFAULT 'Nairobi 2026';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_footer_note" SET DEFAULT 'Made by the community, for the community. GDG Nairobi is an independent group.';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_seo_title" SET DEFAULT 'DevFest Nairobi 2026 — The Future Grows Here';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_seo_description" DROP DEFAULT;
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_headline";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_accent_line";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_description";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_primary_label";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_primary_u_r_l";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_secondary_label";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_hero_secondary_u_r_l";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_about_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_about_heading";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_about_description";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_ecosystem_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_ecosystem_heading";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_ecosystem_description";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_kicker";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_heading";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_accent_line";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_primary_label";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_primary_u_r_l";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_secondary_label";
  ALTER TABLE "site_settings" DROP COLUMN "community_homepage_closing_secondary_u_r_l";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_eyebrow";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_headline";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_accent_line";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_primary_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_primary_u_r_l";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_secondary_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_hero_secondary_u_r_l";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_about_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_about_heading";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_about_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_ecosystem_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_ecosystem_heading";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_ecosystem_description";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_kicker";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_heading";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_accent_line";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_primary_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_primary_u_r_l";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_secondary_label";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_community_homepage_closing_secondary_u_r_l";
  DROP TYPE "public"."enum_community_pillars_accent";
  DROP TYPE "public"."enum__community_pillars_v_accent";`)
}
