-- Seed-Daten: Beispielwerte fuer Entwicklung und Demo

-- 2023
INSERT INTO kpi_entries (year, metric_key, value) VALUES
  (2023, 'tiktok_followers',            0),
  (2023, 'instagram_followers',         8500),
  (2023, 'facebook_followers',          12000),
  (2023, 'youtube_subscribers',         3200),
  (2023, 'website_visitors',            45000),
  (2023, 'social_media_ad_impressions', 1200000),
  (2023, 'pr_reach',                    5000000),
  (2023, 'live_viewers',                15000),
  (2023, 'newsletter_subscribers',      2800);

-- 2024
INSERT INTO kpi_entries (year, metric_key, value) VALUES
  (2024, 'tiktok_followers',            4200),
  (2024, 'instagram_followers',         11300),
  (2024, 'facebook_followers',          12800),
  (2024, 'youtube_subscribers',         4100),
  (2024, 'website_visitors',            62000),
  (2024, 'social_media_ad_impressions', 1850000),
  (2024, 'pr_reach',                    7500000),
  (2024, 'live_viewers',                18500),
  (2024, 'newsletter_subscribers',      3400);

-- Notizen
INSERT INTO year_notes (year, note) VALUES
  (2023, 'Baseline-Jahr. Erste systematische Erfassung aller Marketing-KPIs. TikTok-Kanal existierte noch nicht.'),
  (2024, 'TikTok-Kanal im Maerz 2024 gestartet. Deutliches Wachstum bei Website-Besuchern durch neue SEO-Strategie. PR-Reichweite gestiegen durch Medienpartnerschaft mit Fachmagazin.');
