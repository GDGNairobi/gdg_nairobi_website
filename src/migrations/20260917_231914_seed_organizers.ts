import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "community_homepage_closing_secondary_u_r_l" SET DEFAULT '/about#organizers';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_community_homepage_closing_secondary_u_r_l" SET DEFAULT '/about#organizers';

  UPDATE "site_settings"
  SET
    "site_name" = 'GDG Nairobi',
    "brand_label" = 'GDG',
    "edition_label" = 'Nairobi',
    "footer_note" = 'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.',
    "seo_title" = 'GDG Nairobi — Learn, connect and build',
    "seo_description" = 'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.'
  WHERE "site_name" = 'DevFest Nairobi' AND "brand_label" = 'DevFest';

  UPDATE "site_settings"
  SET
    "community_homepage_hero_eyebrow" = 'GDG Nairobi · Volunteer-led',
    "community_homepage_hero_headline" = 'A developer community',
    "community_homepage_hero_accent_line" = 'for Nairobi.',
    "community_homepage_hero_description" = 'Meet peers, learn through practical events and share experience around Google technologies and modern software development.',
    "community_homepage_about_heading" = 'Year-round events for Nairobi’s developer community.',
    "community_homepage_ecosystem_heading" = 'Connected to the wider developer community.',
    "community_homepage_ecosystem_description" = 'Our programmes often involve Women Techmakers, Google Developer Experts, other GDG chapters and independent technology communities. Those relationships vary by event and are credited where relevant.',
    "community_homepage_closing_kicker" = 'Open to every experience level',
    "community_homepage_closing_heading" = 'Join GDG Nairobi.',
    "community_homepage_closing_accent_line" = 'Start with the next event.',
    "community_homepage_closing_secondary_u_r_l" = '/about#organizers';

  WITH seed("name", "role", "order") AS (
    VALUES
      ('Brayan Kai Mwanyumba', 'GDG Co-Lead & Crew', 1),
      ('Tabitha Kavyu', 'Community Coordinator', 2),
      ('Brian Ouma', 'Software Engineer · GDG Organizer & Logistics', 3),
      ('Wayne Gakuo', 'Unstacked Labs · GDG Co-organizer & Crew', 4),
      ('Rachael Kimberly Msabeni', 'WTM Ambassador · Software Developer, UX Designer', 5),
      ('Sabina Benedette', 'PULA · QA Engineer', 6),
      ('Ngesa Marvin', 'Safaricom PLC · Strategic Partnerships, Content & ML', 7),
      ('Mambo Bryan', 'BiziLabs · Strategy and Partnerships', 8),
      ('Maina Wycliffe', 'Unstacked Labs', 9)
  )
  INSERT INTO "team_members" ("name", "role", "order", "_status")
  SELECT seed."name", seed."role", seed."order", 'published'::"enum_team_members_status"
  FROM seed
  WHERE NOT EXISTS (SELECT 1 FROM "team_members" existing WHERE existing."name" = seed."name");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "community_homepage_closing_secondary_u_r_l" SET DEFAULT '/team';
  ALTER TABLE "_site_settings_v" ALTER COLUMN "version_community_homepage_closing_secondary_u_r_l" SET DEFAULT '/team';`)
}
