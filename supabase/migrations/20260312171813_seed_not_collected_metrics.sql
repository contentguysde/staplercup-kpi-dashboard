-- Sentinel -2 = Metrik wurde noch nicht erhoben
-- Check-Constraint erweitern um -2 zu erlauben
ALTER TABLE kpi_entries DROP CONSTRAINT chk_kpi_entries_value;
ALTER TABLE kpi_entries ADD CONSTRAINT chk_kpi_entries_value CHECK (value >= -2);

-- Beantwortete Kommentare wurden erst ab 2026 erhoben
INSERT INTO kpi_entries (year, metric_key, value) VALUES
  (2022, 'instagram_comments_answered', -2),
  (2022, 'facebook_comments_answered', -2),
  (2023, 'tiktok_comments_answered', -2),
  (2023, 'instagram_comments_answered', -2),
  (2023, 'facebook_comments_answered', -2),
  (2024, 'tiktok_comments_answered', -2),
  (2024, 'instagram_comments_answered', -2),
  (2024, 'facebook_comments_answered', -2),
  (2025, 'tiktok_comments_answered', -2),
  (2025, 'instagram_comments_answered', -2),
  (2025, 'facebook_comments_answered', -2)
ON CONFLICT (year, metric_key) DO UPDATE SET value = EXCLUDED.value;
