import pg from 'pg';
import bcrypt from 'bcryptjs';
import {
  Category,
  Genre,
  Tag,
  ContentItem,
  Popup,
  SiteSettings,
  AdminStats,
  SearchFilterParams,
  PaginatedResult,
  MultiDbStatus,
  AdminUser
} from '../../src/types';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GENRES,
  INITIAL_TAGS,
  INITIAL_CONTENT,
  INITIAL_POPUPS
} from './seed-data';

const { Pool } = pg;

export interface DatabaseConnection {
  index: number;
  envKey: string;
  url: string;
  pool: pg.Pool | null;
  isWriteActive: boolean;
  status: 'connected' | 'unreachable' | 'simulated';
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class MultiDbManager {
  private connections: DatabaseConnection[] = [];
  private activeWriteIndex = 1;
  private localData = {
    settings: { ...INITIAL_SETTINGS },
    categories: [...INITIAL_CATEGORIES],
    genres: [...INITIAL_GENRES],
    tags: [...INITIAL_TAGS],
    content: [...INITIAL_CONTENT],
    popups: [...INITIAL_POPUPS],
    adminUsers: [
      {
        id: 'admin-master',
        email: process.env.ADMIN_EMAIL || 'admin@skxmovies.com',
        name: 'SKx Movies Chief Admin',
        role: 'superadmin' as const,
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@skxmovies2026', 10),
        createdAt: new Date().toISOString()
      }
    ]
  };
  private isInitialized = false;

  constructor() {
    this.discoverDatabases();
  }

  /**
   * Scan environment variables for DATABASE_URL, DATABASE_URL_2, DATABASE_URL_3, etc.
   */
  public discoverDatabases(envSource: Record<string, string | undefined> = process.env) {
    const discovered: DatabaseConnection[] = [];

    // Check DATABASE_URL (Index 1)
    const primaryUrl = envSource.DATABASE_URL?.trim();
    if (primaryUrl) {
      discovered.push({
        index: 1,
        envKey: 'DATABASE_URL',
        url: primaryUrl,
        pool: null,
        isWriteActive: false,
        status: 'unreachable'
      });
    }

    // Check DATABASE_URL_2 through DATABASE_URL_10
    for (let i = 2; i <= 10; i++) {
      const key = `DATABASE_URL_${i}`;
      const url = envSource[key]?.trim();
      if (url) {
        discovered.push({
          index: i,
          envKey: key,
          url,
          pool: null,
          isWriteActive: false,
          status: 'unreachable'
        });
      }
    }

    // If no databases configured in env, maintain 1 simulated in-memory connection
    if (discovered.length === 0) {
      discovered.push({
        index: 1,
        envKey: 'DATABASE_URL (Local / Simulated)',
        url: 'memory://skxmovies-local',
        pool: null,
        isWriteActive: true,
        status: 'simulated'
      });
      this.activeWriteIndex = 1;
      this.connections = discovered;
      return;
    }

    // The highest index is marked as the active write database
    discovered.sort((a, b) => a.index - b.index);
    const highest = discovered[discovered.length - 1];
    highest.isWriteActive = true;
    this.activeWriteIndex = highest.index;

    // Initialize Pools
    for (const conn of discovered) {
      try {
        const pool = new Pool({
          connectionString: conn.url,
          ssl: conn.url.includes('localhost') ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });
        conn.pool = pool;
        conn.status = 'connected';
      } catch (err) {
        console.warn(`[MultiDbManager] Warning: failed to init pool for ${conn.envKey}:`, err);
        conn.status = 'unreachable';
      }
    }

    this.connections = discovered;
  }

  /**
   * Bootstrap CockroachDB / PostgreSQL tables if live pools exist
   */
  public async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    for (const conn of this.connections) {
      if (!conn.pool) continue;
      try {
        await conn.pool.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            display_order INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS genres (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            slug VARCHAR(128) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS tags (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            slug VARCHAR(128) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS content (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(512) NOT NULL,
            slug VARCHAR(512) UNIQUE NOT NULL,
            description TEXT NOT NULL,
            poster_url TEXT NOT NULL,
            backdrop_url TEXT,
            category_id VARCHAR(64),
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
            db_source VARCHAR(64),
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
          CREATE TABLE IF NOT EXISTS site_settings (
            id VARCHAR(64) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS admin_users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(64) DEFAULT 'superadmin',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
          );
        `);
        conn.status = 'connected';
      } catch (err) {
        console.warn(`[MultiDbManager] Warning initializing tables on ${conn.envKey}:`, err);
      }
    }
  }

  public getDbStatus(): MultiDbStatus {
    const connectedDatabases = this.connections.filter(c => c.status === 'connected' || c.status === 'simulated').length;
    const active = this.connections.find(c => c.isWriteActive) || this.connections[0];

    return {
      connectedDatabases,
      activeDatabaseIndex: active ? active.index : 1,
      activeDatabaseName: active ? active.envKey : 'DATABASE_URL',
      allDatabases: this.connections.map(c => ({
        index: c.index,
        name: c.envKey,
        isWriteActive: c.isWriteActive,
        status: c.status
      }))
    };
  }

  // ==========================================
  // CONTENT (MULTI-DATABASE READ & WRITE)
  // ==========================================

  public async getAllContent(params: SearchFilterParams = {}): Promise<PaginatedResult<ContentItem>> {
    let allItems: ContentItem[] = [];
    let usedLiveDb = false;

    // 1. Read across all connected databases
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM content ORDER BY created_at DESC`);
          const items: ContentItem[] = res.rows.map(row => this.mapContentRow(row, conn.envKey));
          allItems.push(...items);
          usedLiveDb = true;
        } catch (e) {
          console.warn(`[MultiDbManager] Query failed on ${conn.envKey}:`, e);
        }
      }
    }

    // 2. If no live DB results or in local simulated mode, use localData
    if (!usedLiveDb) {
      allItems = [...this.localData.content];
    }

    // 3. Deduplicate by ID
    const map = new Map<string, ContentItem>();
    for (const item of allItems) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    let list = Array.from(map.values());

    // 4. Filter
    if (params.status && params.status !== 'all') {
      list = list.filter(c => c.status === params.status);
    } else if (!params.status) {
      list = list.filter(c => c.status === 'published');
    }

    if (params.category) {
      const cat = params.category.toLowerCase();
      list = list.filter(c => c.categorySlug?.toLowerCase() === cat || c.categoryId === cat);
    }

    if (params.genre) {
      const gen = params.genre.toLowerCase();
      list = list.filter(c => c.genres.some(g => g.toLowerCase() === gen));
    }

    if (params.tag) {
      const t = params.tag.toLowerCase();
      list = list.filter(c => c.tags.some(tg => tg.toLowerCase() === t));
    }

    if (params.year) {
      list = list.filter(c => c.releaseDate && c.releaseDate.includes(params.year!));
    }

    if (params.featured !== undefined) {
      list = list.filter(c => c.featured === params.featured);
    }

    if (params.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.genres.some(g => g.toLowerCase().includes(q)) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 5. Sort
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    list.sort((a, b) => {
      let valA: any = a.createdAt;
      let valB: any = b.createdAt;

      if (sortBy === 'views') {
        valA = a.views || 0;
        valB = b.views || 0;
      } else if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'releaseDate') {
        valA = a.releaseDate || '';
        valB = b.releaseDate || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 6. Pagination
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 24);
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  }

  public async getContentBySlug(slug: string, incrementViews = false): Promise<ContentItem | null> {
    const cleanSlug = slug.toLowerCase().trim();

    // Search live DBs in descending order (newest first)
    const reversed = [...this.connections].reverse();
    for (const conn of reversed) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM content WHERE LOWER(slug) = $1 LIMIT 1`, [cleanSlug]);
          if (res.rows.length > 0) {
            const item = this.mapContentRow(res.rows[0], conn.envKey);
            if (incrementViews) {
              item.views = (item.views || 0) + 1;
              conn.pool.query(`UPDATE content SET views = views + 1 WHERE id = $1`, [item.id]).catch(() => {});
            }
            return item;
          }
        } catch (e) {
          console.warn(`[MultiDbManager] Search by slug failed on ${conn.envKey}:`, e);
        }
      }
    }

    // Fallback to local
    const local = this.localData.content.find(c => c.slug.toLowerCase() === cleanSlug);
    if (local) {
      if (incrementViews) {
        local.views = (local.views || 0) + 1;
      }
      return { ...local };
    }
    return null;
  }

  public async getContentById(id: string): Promise<ContentItem | null> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM content WHERE id = $1 LIMIT 1`, [id]);
          if (res.rows.length > 0) {
            return this.mapContentRow(res.rows[0], conn.envKey);
          }
        } catch (e) {
          console.warn(`[MultiDbManager] Search by id failed on ${conn.envKey}:`, e);
        }
      }
    }
    const local = this.localData.content.find(c => c.id === id);
    return local ? { ...local } : null;
  }

  /**
   * CREATE CONTENT: Always writes to the newest active write database
   */
  public async createContent(input: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<ContentItem> {
    const now = new Date().toISOString();
    const id = 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.title);

    // Identify active write connection
    const writeConn = this.connections.find(c => c.isWriteActive) || this.connections[this.connections.length - 1];
    const dbSource = writeConn ? writeConn.envKey : 'DATABASE_URL';

    const newItem: ContentItem = {
      ...input,
      id,
      slug,
      views: 0,
      dbSource,
      createdAt: now,
      updatedAt: now
    };

    // Save to local cache
    this.localData.content.unshift(newItem);

    // Write to active CockroachDB / Postgres database
    if (writeConn && writeConn.pool && writeConn.status === 'connected') {
      try {
        await writeConn.pool.query(`
          INSERT INTO content (
            id, title, slug, description, poster_url, backdrop_url,
            category_id, category_name, category_slug, genres, tags,
            release_date, duration, rating, language, featured, status,
            trailer_url, views, db_source, tutorial_title, tutorial_url,
            tutorial_thumbnail, how_to_access_title, how_to_access_instructions,
            how_to_access_steps, access_options, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
          )
        `, [
          newItem.id, newItem.title, newItem.slug, newItem.description, newItem.posterUrl, newItem.backdropUrl || null,
          newItem.categoryId, newItem.categoryName, newItem.categorySlug, JSON.stringify(newItem.genres), JSON.stringify(newItem.tags),
          newItem.releaseDate, newItem.duration || null, newItem.rating || null, newItem.language || null, newItem.featured, newItem.status,
          newItem.trailerUrl || null, newItem.views, newItem.dbSource, newItem.tutorialTitle || null, newItem.tutorialUrl || null,
          newItem.tutorialThumbnail || null, newItem.howToAccessTitle || null, newItem.howToAccessInstructions || null,
          JSON.stringify(newItem.howToAccessSteps || []), JSON.stringify(newItem.accessOptions || []),
          new Date(newItem.createdAt), new Date(newItem.updatedAt)
        ]);
      } catch (err) {
        console.error(`[MultiDbManager] Error inserting content into ${writeConn.envKey}:`, err);
      }
    }

    return newItem;
  }

  /**
   * UPDATE CONTENT: Updates in the database where it was found
   */
  public async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const existingIndex = this.localData.content.findIndex(c => c.id === id);
    const existing = existingIndex !== -1 ? this.localData.content[existingIndex] : await this.getContentById(id);
    if (!existing) return null;

    const updated: ContentItem = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };

    if (updates.title && !updates.slug) {
      updated.slug = generateSlug(updates.title);
    }

    if (existingIndex !== -1) {
      this.localData.content[existingIndex] = updated;
    }

    // Update in all pools where the record exists
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          await conn.pool.query(`
            UPDATE content SET
              title = $1, slug = $2, description = $3, poster_url = $4, backdrop_url = $5,
              category_id = $6, category_name = $7, category_slug = $8, genres = $9, tags = $10,
              release_date = $11, duration = $12, rating = $13, language = $14, featured = $15,
              status = $16, trailer_url = $17, tutorial_title = $18, tutorial_url = $19,
              tutorial_thumbnail = $20, how_to_access_title = $21, how_to_access_instructions = $22,
              how_to_access_steps = $23, access_options = $24, updated_at = $25
            WHERE id = $26
          `, [
            updated.title, updated.slug, updated.description, updated.posterUrl, updated.backdropUrl || null,
            updated.categoryId, updated.categoryName, updated.categorySlug, JSON.stringify(updated.genres), JSON.stringify(updated.tags),
            updated.releaseDate, updated.duration || null, updated.rating || null, updated.language || null, updated.featured,
            updated.status, updated.trailerUrl || null, updated.tutorialTitle || null, updated.tutorialUrl || null,
            updated.tutorialThumbnail || null, updated.howToAccessTitle || null, updated.howToAccessInstructions || null,
            JSON.stringify(updated.howToAccessSteps || []), JSON.stringify(updated.accessOptions || []),
            new Date(updated.updatedAt), updated.id
          ]);
        } catch (e) {
          console.warn(`[MultiDbManager] Update failed on ${conn.envKey}:`, e);
        }
      }
    }

    return updated;
  }

  /**
   * DELETE CONTENT: Deletes from whichever database holds it
   */
  public async deleteContent(id: string): Promise<boolean> {
    this.localData.content = this.localData.content.filter(c => c.id !== id);

    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          await conn.pool.query(`DELETE FROM content WHERE id = $1`, [id]);
        } catch (e) {
          console.warn(`[MultiDbManager] Delete failed on ${conn.envKey}:`, e);
        }
      }
    }
    return true;
  }

  // ==========================================
  // CATEGORIES, GENRES, TAGS
  // ==========================================

  public async getCategories(): Promise<Category[]> {
    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        const res = await primary.pool.query(`SELECT * FROM categories ORDER BY display_order ASC`);
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            imageUrl: r.image_url,
            displayOrder: r.display_order,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        console.warn('[MultiDbManager] getCategories error:', e);
      }
    }
    return [...this.localData.categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public async createCategory(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const id = 'cat-' + Date.now();
    const cat: Category = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };
    this.localData.categories.push(cat);

    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        await primary.pool.query(`
          INSERT INTO categories (id, name, slug, description, image_url, display_order, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [cat.id, cat.name, cat.slug, cat.description || null, cat.imageUrl || null, cat.displayOrder || 0, new Date(cat.createdAt)]);
      } catch (e) {
        console.warn('[MultiDbManager] createCategory error:', e);
      }
    }
    return cat;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = this.localData.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localData.categories[idx], ...updates };
    this.localData.categories[idx] = updated;

    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        await primary.pool.query(`
          UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4, display_order = $5
          WHERE id = $6
        `, [updated.name, updated.slug, updated.description || null, updated.imageUrl || null, updated.displayOrder || 0, id]);
      } catch (e) {
        console.warn('[MultiDbManager] updateCategory error:', e);
      }
    }
    return updated;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    this.localData.categories = this.localData.categories.filter(c => c.id !== id);
    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        await primary.pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
      } catch (e) {
        console.warn('[MultiDbManager] deleteCategory error:', e);
      }
    }
    return true;
  }

  public async getGenres(): Promise<Genre[]> {
    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        const res = await primary.pool.query(`SELECT * FROM genres ORDER BY name ASC`);
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            createdAt: r.created_at
          }));
        }
      } catch (e) {
        console.warn('[MultiDbManager] getGenres error:', e);
      }
    }
    return [...this.localData.genres];
  }

  public async createGenre(input: Omit<Genre, 'id' | 'createdAt'>): Promise<Genre> {
    const id = 'gen-' + Date.now();
    const item: Genre = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };
    this.localData.genres.push(item);
    return item;
  }

  public async deleteGenre(id: string): Promise<boolean> {
    this.localData.genres = this.localData.genres.filter(g => g.id !== id);
    return true;
  }

  public async getTags(): Promise<Tag[]> {
    return [...this.localData.tags];
  }

  public async createTag(input: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    const id = 'tag-' + Date.now();
    const item: Tag = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };
    this.localData.tags.push(item);
    return item;
  }

  public async deleteTag(id: string): Promise<boolean> {
    this.localData.tags = this.localData.tags.filter(t => t.id !== id);
    return true;
  }

  // ==========================================
  // SITE SETTINGS (BACKGROUND MOTION & TELEGRAM)
  // ==========================================

  public async getSettings(): Promise<SiteSettings> {
    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        const res = await primary.pool.query(`SELECT data FROM site_settings WHERE id = 'global_settings'`);
        if (res.rows.length > 0) {
          return { ...INITIAL_SETTINGS, ...res.rows[0].data };
        }
      } catch (e) {
        console.warn('[MultiDbManager] getSettings error:', e);
      }
    }
    return { ...INITIAL_SETTINGS, ...this.localData.settings };
  }

  public async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    this.localData.settings = {
      ...INITIAL_SETTINGS,
      ...this.localData.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const primary = this.connections[0];
    if (primary && primary.pool && primary.status === 'connected') {
      try {
        await primary.pool.query(`
          INSERT INTO site_settings (id, data, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW();
        `, ['global_settings', JSON.stringify(this.localData.settings)]);
      } catch (e) {
        console.warn('[MultiDbManager] updateSettings error:', e);
      }
    }

    return { ...this.localData.settings };
  }

  // ==========================================
  // POPUPS MANAGEMENT
  // ==========================================

  public async getPopups(activeOnly = false): Promise<Popup[]> {
    let list = [...this.localData.popups];
    if (activeOnly) {
      const now = new Date();
      list = list.filter(p => {
        if (!p.active) return false;
        if (p.startDate && new Date(p.startDate) > now) return false;
        if (p.endDate && new Date(p.endDate) < now) return false;
        return true;
      });
    }
    return list.sort((a, b) => a.priority - b.priority);
  }

  public async createPopup(input: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Popup> {
    const now = new Date().toISOString();
    const id = 'pop-' + Date.now();
    const p: Popup = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.localData.popups.push(p);
    return p;
  }

  public async updatePopup(id: string, updates: Partial<Popup>): Promise<Popup | null> {
    const idx = this.localData.popups.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = {
      ...this.localData.popups[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.localData.popups[idx] = updated;
    return updated;
  }

  public async deletePopup(id: string): Promise<boolean> {
    this.localData.popups = this.localData.popups.filter(p => p.id !== id);
    return true;
  }

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  public async verifyAdmin(email: string, passwordPlain: string): Promise<AdminUser | null> {
    const user = this.localData.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  public async changeAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
    const user = this.localData.adminUsers.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    return true;
  }

  // ==========================================
  // STATS
  // ==========================================

  public async getStats(): Promise<AdminStats> {
    const contentRes = await this.getAllContent({ status: 'all', limit: 1000 });
    const all = contentRes.items;
    const published = all.filter(c => c.status === 'published').length;
    const drafts = all.length - published;
    const totalViews = all.reduce((acc, c) => acc + (c.views || 0), 0);

    return {
      totalContent: all.length,
      published,
      drafts,
      totalCategories: this.localData.categories.length,
      totalGenres: this.localData.genres.length,
      totalTags: this.localData.tags.length,
      totalViews,
      dbStatus: this.getDbStatus(),
      recentContent: all.slice(0, 8)
    };
  }

  private mapContentRow(r: any, defaultSource: string): ContentItem {
    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      posterUrl: r.poster_url,
      backdropUrl: r.backdrop_url,
      categoryId: r.category_id,
      categoryName: r.category_name,
      categorySlug: r.category_slug,
      genres: typeof r.genres === 'string' ? JSON.parse(r.genres) : r.genres || [],
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags || [],
      releaseDate: r.release_date,
      duration: r.duration,
      rating: r.rating,
      language: r.language,
      featured: Boolean(r.featured),
      status: r.status || 'published',
      trailerUrl: r.trailer_url,
      views: Number(r.views) || 0,
      dbSource: r.db_source || defaultSource,
      tutorialTitle: r.tutorial_title,
      tutorialUrl: r.tutorial_url,
      tutorialThumbnail: r.tutorial_thumbnail,
      howToAccessTitle: r.how_to_access_title,
      howToAccessInstructions: r.how_to_access_instructions,
      howToAccessSteps: typeof r.how_to_access_steps === 'string' ? JSON.parse(r.how_to_access_steps) : r.how_to_access_steps || [],
      accessOptions: typeof r.access_options === 'string' ? JSON.parse(r.access_options) : r.access_options || [],
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
    };
  }
}

export const multiDb = new MultiDbManager();
