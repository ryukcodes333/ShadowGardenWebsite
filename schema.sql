-- Shadow Garden — run this in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query > paste this > Run

CREATE TABLE IF NOT EXISTS sg_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  frame_url TEXT,
  bio TEXT,
  title TEXT DEFAULT 'New Adventurer',
  wallet BIGINT DEFAULT 0,
  bank BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  guild TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sg_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary','god')),
  image_url TEXT NOT NULL,
  anime TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sg_user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sg_users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES sg_cards(id) ON DELETE CASCADE,
  obtained_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sg_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sg_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sg_user_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sg_users(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  caught_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sg_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sg_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP table for WhatsApp bot login
CREATE TABLE IF NOT EXISTS sg_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES sg_users(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  claimed_by_bot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for bot polling efficiency
CREATE INDEX IF NOT EXISTS idx_sg_otp_pending ON sg_otp (used, claimed_by_bot, expires_at)
  WHERE used = FALSE AND claimed_by_bot IS NULL;

-- Seed cards
INSERT INTO sg_cards (id, name, rarity, image_url, anime, description) VALUES
  ('rimuru-god','Rimuru Tempest','god','https://cdn.myanimelist.net/images/characters/9/388527.jpg','That Time I Got Reincarnated as a Slime','The ultimate slime god who rules all.'),
  ('naruto-legendary','Naruto Uzumaki','legendary','https://cdn.myanimelist.net/images/characters/2/284121.jpg','Naruto','The Seventh Hokage of the Hidden Leaf.'),
  ('goku-legendary','Son Goku','legendary','https://cdn.myanimelist.net/images/characters/5/237374.jpg','Dragon Ball Z','The legendary Super Saiyan.'),
  ('zero-two-epic','Zero Two','epic','https://cdn.myanimelist.net/images/characters/10/349061.jpg','Darling in the FranXX','The klaxosaur princess hybrid.'),
  ('rem-epic','Rem','epic','https://cdn.myanimelist.net/images/characters/4/316564.jpg','Re:ZERO','The loyal blue-haired oni maid.'),
  ('levi-rare','Levi Ackerman','rare','https://cdn.myanimelist.net/images/characters/2/241413.jpg','Attack on Titan','Humanity''s strongest soldier.'),
  ('mikasa-rare','Mikasa Ackerman','rare','https://cdn.myanimelist.net/images/characters/4/316673.jpg','Attack on Titan','The best soldier in the 104th.'),
  ('kirito-uncommon','Kirito','uncommon','https://cdn.myanimelist.net/images/characters/7/204126.jpg','Sword Art Online','The Black Swordsman of Aincrad.'),
  ('asuna-uncommon','Asuna','uncommon','https://cdn.myanimelist.net/images/characters/15/261661.jpg','Sword Art Online','The Flash of the Knights of the Blood.'),
  ('pikachu-common','Pikachu','common','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png','Pokémon','The electric mouse Pokémon.'),
  ('luffy-legendary','Monkey D. Luffy','legendary','https://cdn.myanimelist.net/images/characters/9/310307.jpg','One Piece','The rubber man who will be King of the Pirates.'),
  ('zoro-rare','Roronoa Zoro','rare','https://cdn.myanimelist.net/images/characters/3/100534.jpg','One Piece','The three-sword style master.'),
  ('asta-rare','Asta','rare','https://cdn.myanimelist.net/images/characters/6/339461.jpg','Black Clover','The anti-magic warrior.'),
  ('gojo-epic','Satoru Gojo','epic','https://cdn.myanimelist.net/images/characters/8/437695.jpg','Jujutsu Kaisen','The strongest sorcerer.'),
  ('itadori-uncommon','Yuji Itadori','uncommon','https://cdn.myanimelist.net/images/characters/9/435580.jpg','Jujutsu Kaisen','The vessel of Ryomen Sukuna.'),
  ('tanjiro-uncommon','Tanjiro Kamado','uncommon','https://cdn.myanimelist.net/images/characters/10/408511.jpg','Demon Slayer','The water and fire breathing demon slayer.'),
  ('nezuko-rare','Nezuko Kamado','rare','https://cdn.myanimelist.net/images/characters/3/408294.jpg','Demon Slayer','The demon sister.'),
  ('ainz-epic','Ainz Ooal Gown','epic','https://cdn.myanimelist.net/images/characters/7/340571.jpg','Overlord','The Sorcerer King of the Great Tomb of Nazarick.'),
  ('kirito2-common','Klein','common','https://cdn.myanimelist.net/images/characters/9/204133.jpg','Sword Art Online','A loyal friend to Kirito.'),
  ('spike-legendary','Spike Spiegel','legendary','https://cdn.myanimelist.net/images/characters/4/68371.jpg','Cowboy Bebop','The laid-back bounty hunter.')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for chat messages
ALTER TABLE sg_chat_messages REPLICA IDENTITY FULL;
