import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_partners_scope" AS ENUM('chapter', 'devfest');
  CREATE TYPE "public"."enum__partners_v_version_scope" AS ENUM('chapter', 'devfest');
  ALTER TABLE "partners" ADD COLUMN "source_logo_u_r_l" varchar;
  ALTER TABLE "partners" ADD COLUMN "scope" "enum_partners_scope" DEFAULT 'devfest';
  ALTER TABLE "_partners_v" ADD COLUMN "version_source_logo_u_r_l" varchar;
  ALTER TABLE "_partners_v" ADD COLUMN "version_scope" "enum__partners_v_version_scope" DEFAULT 'devfest';

  UPDATE "team_members"
  SET "name" = 'Sabina Benerdette', "role" = 'QA Engineer · PULA', "updated_at" = now()
  WHERE "name" = 'Sabina Benedette';

  UPDATE "team_members"
  SET "role" = 'Typescript Aficionado and Google Developer Expert · Unstacked Labs', "updated_at" = now()
  WHERE "name" = 'Maina Wycliffe';

  WITH seed("name", "url", "logo", "tier", "order") AS (
    VALUES
      ('Ona', 'https://ona.io/home/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/red-logo.png', 'host', 1),
      ('Google', 'https://about.google/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/google2.0.0_SrBpHEE.jpg', 'host', 2),
      ('Apify', 'https://apify.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/Apify_Logo.svg_rS34wxY.png', 'community', 10),
      ('Fata School', 'https://fata.school/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/Fata%20school_xN1Slgf.jpeg', 'community', 11),
      ('Payd', 'https://paydhq.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/images%20%285%29_Ik0QCxm.png', 'community', 12),
      ('iHub', 'https://ihub.co.ke/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/download_dO1TQkz.png', 'community', 13),
      ('Turing', 'https://www.turing.com/jobs', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/Turing%20logo.png', 'community', 14),
      ('Kwara', 'https://kwara.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/Kwara.png', 'community', 15),
      ('Strathmore University', 'https://strathmore.edu/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/University-Logo-Black-12.png', 'community', 16),
      ('USIU-Africa', 'https://www.usiu.ac.ke/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/usiu-logo.png', 'community', 17),
      ('Lawyers Hub', 'https://lawyershub.org/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/logo_38Hfybi.png', 'community', 18),
      ('Zindi', 'https://zindi.africa/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/00aa4a928f3c44f881834d47fe624d91.png', 'community', 19),
      ('Mara', 'https://mara.xyz/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/Mara.jpg', 'community', 20),
      ('Women Techmakers', 'https://developers.google.com/womentechmakers', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/wtm-logo_96.png', 'community', 21),
      ('Arm', 'https://arm.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/Arm_logo_2017.svg.png', 'community', 22),
      ('Circle', 'https://www.circle.com/en/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/download_WVAKd1E.png', 'community', 23),
      ('Chimoney', 'https://chimoney.io/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/Main%20logo%20-%20WH%20PL.png', 'community', 24),
      ('Postman', 'https://www.postman.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/postman-logo-orange-stacked.png', 'community', 25),
      ('Youverify', 'https://youverify.co/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/download_umT6jvp.png', 'community', 26),
      ('KamiLimu', 'https://www.kamilimu.org/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/KamiLimu%20logo%20%282%29.jpg', 'community', 27),
      ('Denri Africa Stores', 'https://denriafricastores.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/ezgif.com-gif-maker_br0YBmz.jpg', 'community', 28),
      ('Dedan Kimathi University of Technology', 'https://www.dkut.ac.ke/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/dekut.png', 'community', 29),
      ('Women in Data', 'https://www.womenindata.org/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/wid_logo.png', 'community', 30),
      ('Wengi Web', 'http://wengiweb.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/weng-_web_logo.jpeg', 'community', 31),
      ('Safaricom Women in Technology', 'https://twitter.com/safaricom_wit', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/safaricom_wit_logo.png', 'community', 32),
      ('Beba Beggie', 'https://bebabeggie.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/images%20%283%29_dqAsZre.png', 'community', 33),
      ('Britam', 'https://ke.britam.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/ke-brit-logo-min_RLKvKre.png', 'community', 34),
      ('GDG Pwani', 'https://gdg.community.dev/gdg-pwani/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/GDG%20Pwani%20Logo%20-%20new.png', 'community', 35),
      ('ICP Kushite', 'https://icpkushite.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/Kushites.png', 'community', 36),
      ('Infinix', 'https://ke.infinixmobility.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/infinix-brand-logo-phone-symbol-name-black-design-china-mobile-illustration-free-vector.jpg', 'community', 37),
      ('ALX Africa', 'https://www.alxafrica.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/alx_LsTcbuy.png', 'community', 38),
      ('GoMyCode', 'https://gomycode.com/ke/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/go%20my%20code.png', 'community', 39),
      ('Red Bull', 'https://www.redbull.com/ke-en/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/images_21dHOa5.png', 'community', 40),
      ('GitHub', 'https://github.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/github.png', 'community', 41),
      ('SafeBoda', 'https://www.safeboda.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/SafeBoda%2BLogo_YbHOPds.png', 'community', 42),
      ('ChatSasa', 'https://www.chatsasa.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/ChatSasa_API_Logo_6MAzeKM.png', 'community', 43),
      ('Power Learn Project', 'https://powerlearnproject.org/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/83379a847dc9ee6_rmHMZhB.png', 'community', 44),
      ('Vilcom Networks', 'https://vilcom.ke/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/images%20%282%29_t18Bw1l.png', 'community', 45),
      ('Tunga', 'https://tunga.io/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/tunga_logo_round.png', 'community', 46),
      ('Propel', 'https://www.withpropel.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/Propel%20Logo%20Black_yDxBzDj.png', 'community', 47),
      ('Women Will', 'https://womenwill.google/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/GBG%20Women%20Will%20-%20GBG%20Nairobi.png', 'community', 48),
      ('Moringa School', 'https://moringaschool.com/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/Moringa-New-Logo-Potrait.png', 'community', 49),
      ('She Code Africa', 'https://shecodeafrica.org/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/she.png', 'community', 50),
      ('US4HER', 'https://www.us4her.info/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/sponsors/US4HER%20DESIGNS-%20PNGpng.png', 'community', 51)
  )
  INSERT INTO "partners" ("name", "url", "source_logo_u_r_l", "tier", "scope", "order", "_status")
  SELECT seed."name", seed."url", seed."logo", seed."tier"::"enum_partners_tier", 'chapter'::"enum_partners_scope", seed."order", 'published'::"enum_partners_status"
  FROM seed
  WHERE NOT EXISTS (SELECT 1 FROM "partners" existing WHERE existing."name" = seed."name" AND existing."scope" = 'chapter');

  INSERT INTO "community_events" ("source", "upstream_u_r_l", "source_title", "source_start_date", "source_type", "registration_u_r_l", "image_u_r_l", "upstream_status", "last_synced_at", "show_on_site", "featured", "display_order") VALUES
    ('bevy', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-google-ai-nairobi-pre-devfest-hands-on-workshop/', 'Build with Google AI: Nairobi Pre-DevFest Hands-On Workshop', '2026-10-17T05:00:00Z', 'External registration', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-google-ai-nairobi-pre-devfest-hands-on-workshop/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_500,h_500,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/GDG_Bevy_DefaultEventThumbnail_2_MF2GjYZ.png', 'live', now(), true, true, -10),
    ('bevy', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-google-io-extended-nairobi-2026/', 'Google I/O Extended Nairobi 2026', '2026-06-20T05:00:00Z', 'Free registration', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-google-io-extended-nairobi-2026/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_500,h_500,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/blob_EetexGS', 'completed', now(), true, false, 0),
    ('bevy', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-agentathon/', 'Build with AI Nairobi - Agentathon', '2026-05-16T06:00:00Z', 'Free registration', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-agentathon/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_500,h_500,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/blob_PFF9Hbf', 'completed', now(), true, false, 0),
    ('bevy', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-2026/', 'Build with AI Nairobi 2026', '2026-03-14T05:00:00Z', 'Free registration', 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-2026/', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_500,h_500,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/blob_PFF9Hbf', 'completed', now(), true, false, 0),
    ('bevy', 'https://gdg.community.dev/events/details/google-gdg-pwani-presents-building-secure-multi-agent-systems-on-cloud-run-using-vertex-ai-on-gemini-30-part-2/', 'Building Secure Multi-Agent Systems on Cloud Run using Vertex AI on Gemini 3.0 (Part 2)', '2026-03-13T16:00:00Z', 'Free registration', 'https://gdg.community.dev/events/details/google-gdg-pwani-presents-building-secure-multi-agent-systems-on-cloud-run-using-vertex-ai-on-gemini-30-part-2/cohost-gdg-nairobi', 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_500,h_500,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/events/blob_tcFwaT1', 'completed', now(), true, false, 0)
  ON CONFLICT ("upstream_u_r_l") DO UPDATE SET
    "source_title" = EXCLUDED."source_title",
    "source_start_date" = EXCLUDED."source_start_date",
    "source_type" = EXCLUDED."source_type",
    "registration_u_r_l" = EXCLUDED."registration_u_r_l",
    "image_u_r_l" = EXCLUDED."image_u_r_l",
    "upstream_status" = EXCLUDED."upstream_status",
    "last_synced_at" = EXCLUDED."last_synced_at",
    "show_on_site" = true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DELETE FROM "partners" WHERE "scope" = 'chapter';
  ALTER TABLE "partners" DROP COLUMN "source_logo_u_r_l";
  ALTER TABLE "partners" DROP COLUMN "scope";
  ALTER TABLE "_partners_v" DROP COLUMN "version_source_logo_u_r_l";
  ALTER TABLE "_partners_v" DROP COLUMN "version_scope";
  DROP TYPE "public"."enum_partners_scope";
  DROP TYPE "public"."enum__partners_v_version_scope";`)
}
