-- ==========================================================
-- SKxMOVIES - CockroachDB / PostgreSQL Production Schema
-- Compatible with CockroachDB Serverless & Standard PostgreSQL
-- Multi-Database Supported
-- ==========================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Genres Table
CREATE TABLE IF NOT EXISTS genres (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Content / Movies / Series Table
CREATE TABLE IF NOT EXISTS content (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  slug VARCHAR(512) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  backdrop_url TEXT,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
  category_name VARCHAR(255),
  category_slug VARCHAR(255),
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  release_date VARCHAR(64),
  duration VARCHAR(64),
  rating VARCHAR(64),
  language VARCHAR(128),
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(32) DEFAULT 'published',
  trailer_url TEXT,
  views INT DEFAULT 0,
  db_source VARCHAR(64) DEFAULT 'DATABASE_URL',
  tutorial_title TEXT,
  tutorial_url TEXT,
  tutorial_thumbnail TEXT,
  how_to_access_title TEXT,
  how_to_access_instructions TEXT,
  how_to_access_steps JSONB DEFAULT '[]'::jsonb,
  access_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast lookups in CockroachDB
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_featured ON content(featured);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_slug);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);

-- 5. Popups Table
CREATE TABLE IF NOT EXISTS popups (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  btn1_text VARCHAR(128),
  btn1_url TEXT,
  btn1_enabled BOOLEAN DEFAULT TRUE,
  btn2_text VARCHAR(128),
  btn2_url TEXT,
  btn2_enabled BOOLEAN DEFAULT FALSE,
  bg_image_url TEXT,
  type VARCHAR(32) DEFAULT 'announcement',
  position VARCHAR(32) DEFAULT 'center',
  frequency VARCHAR(32) DEFAULT 'once_per_session',
  delay_seconds INT DEFAULT 2,
  show_on VARCHAR(32) DEFAULT 'all',
  page_paths TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 1,
  show_close_btn BOOLEAN DEFAULT TRUE,
  show_overlay BOOLEAN DEFAULT TRUE,
  close_on_overlay BOOLEAN DEFAULT TRUE,
  cooldown_enabled BOOLEAN DEFAULT FALSE,
  cooldown_hours INT DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Site Settings (JSON Store for dynamic branding, background style & telegram links)
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(64) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
