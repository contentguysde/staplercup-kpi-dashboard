-- Speichert welche defaultHidden-Keys der User bereits kennt,
-- damit sie nicht erneut versteckt werden wenn der User sie einblendet.
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS seen_default_keys jsonb DEFAULT '[]'::jsonb;
