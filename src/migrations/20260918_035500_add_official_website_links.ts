import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const repositoryURL = 'https://github.com/GDGNairobi/gdg_nairobi_website'
const storeURL = 'https://shop.gdgnairobi.com/'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "site_settings_footer_groups_links" ("_order", "_parent_id", "id", "label", "url")
    SELECT
      COALESCE((SELECT MAX(existing."_order") FROM "site_settings_footer_groups_links" existing WHERE existing."_parent_id" = footer_group."id"), -1) + 1,
      footer_group."id",
      'official-' || md5(footer_group."id" || ${repositoryURL}),
      'GitHub',
      ${repositoryURL}
    FROM "site_settings_footer_groups" footer_group
    WHERE LOWER(TRIM(footer_group."heading")) = 'connect'
      AND NOT EXISTS (
        SELECT 1
        FROM "site_settings_footer_groups_links" existing
        WHERE existing."_parent_id" = footer_group."id"
          AND existing."url" = ${repositoryURL}
      );
  `)

  await db.execute(sql`
    INSERT INTO "site_settings_navigation" ("_order", "_parent_id", "id", "label", "url", "enabled")
    SELECT
      COALESCE((SELECT MAX(existing."_order") FROM "site_settings_navigation" existing WHERE existing."_parent_id" = settings."id"), -1) + 1,
      settings."id",
      'official-shop-' || settings."id"::text,
      'Shop',
      ${storeURL},
      true
    FROM "site_settings" settings
    WHERE NOT EXISTS (
      SELECT 1
      FROM "site_settings_navigation" existing
      WHERE existing."_parent_id" = settings."id"
        AND existing."url" = ${storeURL}
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "site_settings_footer_groups_links"
    WHERE "id" LIKE 'official-%'
      AND "url" = ${repositoryURL};
  `)

  await db.execute(sql`
    DELETE FROM "site_settings_navigation"
    WHERE "id" LIKE 'official-shop-%'
      AND "url" = ${storeURL};
  `)
}
