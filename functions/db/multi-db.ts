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

/**
 * MultiDbManager: Multi-Database PostgreSQL / CockroachDB Manager
 * Optimized for Cloudflare Pages Functions and edge environments.
 */
export class MultiDbManager {
  private connections: DatabaseConnection[] = [];
  private activeWriteIndex = 1;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private currentEnv: Record<string, any> = {};

  // In-memory fallback used ONLY during local development when no database is configured
  private localDevData = {
    settings: { ...INITIAL_SETTINGS },
    categories: [...INITIAL_CATEGORIES],
    genres: [...INITIAL_GENRES],
    tags: [...INITIAL_TAGS],
    content: [...INITIAL_CONTENT],
    popups: [...INITIAL_POPUPS],
    adminUsers: [] as Array<{
      id: string;
      email: string;
      name: string;
      role: 'superadmin';
      passwordHash: string;
      createdAt: string;
    }>
  };

  private lastDiscoveredKey = '';
  private poolCache = new Map<string, pg.Pool>();

  constructor() {
    this.discoverDatabases({});
  }

  public isProduction(): boolean {
    const env = this.currentEnv;
    const nodeEnv = env.NODE_ENV || '';
    const environment = env.ENVIRONMENT || '';
    return nodeEnv === 'production' || environment === 'production';
  }

  public hasRealDatabases(): boolean {
    return this.connections.some(c => c.status !== 'simulated' && c.url && !c.url.startsWith('memory://'));
  }

  /**
   * Scan environment for DATABASE_URL, DATABASE_URL_2 ... DATABASE_URL_10 and HYPERDRIVE
   */
  public discoverDatabases(envSource: Record<string, any> = {}) {
    this.currentEnv = envSource;
    const discovered: DatabaseConnection[] = [];

    // 1. Check Cloudflare Hyperdrive binding first if available
    const hyperdriveUrl = envSource.HYPERDRIVE?.connectionString;
    const primaryUrl = (hyperdriveUrl || envSource.DATABASE_URL || '')?.trim();

    if (primaryUrl) {
      discovered.push({
        index: 1,
        envKey: hyperdriveUrl ? 'HYPERDRIVE (Primary)' : 'DATABASE_URL',
        url: primaryUrl,
        pool: null,
        isWriteActive: false,
        status: 'unreachable'
      });
    }

    // 2. Check DATABASE_URL_2 through DATABASE_URL_10
    for (let i = 2; i <= 10; i++) {
      const key = `DATABASE_URL_${i}`;
      const url = (envSource[key] || '')?.trim();
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

    // If no real databases configured:
    if (discovered.length === 0) {
      if (this.lastDiscoveredKey === 'memory-only') return;
      this.lastDiscoveredKey = 'memory-only';
      discovered.push({
        index: 1,
        envKey: 'DATABASE_URL (Local Dev Memory)',
        url: 'memory://skxmovies-local-dev',
        pool: null,
        isWriteActive: true,
        status: 'simulated'
      });
      this.activeWriteIndex = 1;
      this.connections = discovered;
      return;
    }

    const newKey = discovered.map(d => `${d.index}:${d.url}`).join(';');
    if (newKey === this.lastDiscoveredKey && this.connections.length > 0) {
      return;
    }
    this.lastDiscoveredKey = newKey;

    // Mark the highest index as active write database
    discovered.sort((a, b) => a.index - b.index);
    const highest = discovered[discovered.length - 1];
    highest.isWriteActive = true;
    this.activeWriteIndex = highest.index;

    // Initialize or reuse Pools
    for (const conn of discovered) {
      let pool = this.poolCache.get(conn.url);
      if (!pool) {
        try {
          pool = new Pool({
            connectionString: conn.url,
            ssl: conn.url.includes('localhost') ? false : { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
          });
          this.poolCache.set(conn.url, pool);
        } catch (err) {
          console.warn(`[MultiDbManager] Warning: failed to create pool for ${conn.envKey}:`, err);
        }
      }
      conn.pool = pool || null;
      conn.status = pool ? 'connected' : 'unreachable';
    }

    this.connections = discovered;
  }

  /**
   * Idempotent table creation with concurrency-safe lock and initial seeding
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
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

          // Seed default data if tables are currently empty
          try {
            const catRes = await conn.pool.query('SELECT count(*) FROM categories');
            if (parseInt(catRes.rows[0].count, 10) === 0) {
              for (const c of INITIAL_CATEGORIES) {
                await conn.pool.query(
                  `INSERT INTO categories (id, name, slug, description, image_url, display_order, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
                  [c.id, c.name, c.slug, c.description || null, c.imageUrl || null, c.displayOrder || 0, new Date(c.createdAt)]
                );
              }
            }

            const genRes = await conn.pool.query('SELECT count(*) FROM genres');
            if (parseInt(genRes.rows[0].count, 10) === 0) {
              for (const g of INITIAL_GENRES) {
                await conn.pool.query(
                  `INSERT INTO genres (id, name, slug, description, created_at)
                   VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
                  [g.id, g.name, g.slug, g.description || null, new Date(g.createdAt)]
                );
              }
            }

            const tagRes = await conn.pool.query('SELECT count(*) FROM tags');
            if (parseInt(tagRes.rows[0].count, 10) === 0) {
              for (const t of INITIAL_TAGS) {
                await conn.pool.query(
                  `INSERT INTO tags (id, name, slug, created_at)
                   VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
                  [t.id, t.name, t.slug, new Date(t.createdAt)]
                );
              }
            }

            const setRes = await conn.pool.query('SELECT count(*) FROM site_settings');
            if (parseInt(setRes.rows[0].count, 10) === 0) {
              await conn.pool.query(
                `INSERT INTO site_settings (id, data, updated_at)
                 VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING`,
                ['global_settings', JSON.stringify(INITIAL_SETTINGS)]
              );
            }

            const popRes = await conn.pool.query('SELECT count(*) FROM popups');
            if (parseInt(popRes.rows[0].count, 10) === 0) {
              for (const p of INITIAL_POPUPS) {
                await conn.pool.query(
                  `INSERT INTO popups (
                    id, title, message, btn1_text, btn1_url, btn1_enabled,
                    btn2_text, btn2_url, btn2_enabled, bg_image_url, type,
                    position, frequency, delay_seconds, show_on, page_paths,
                    active, priority, show_close_btn, show_overlay, close_on_overlay,
                    cooldown_enabled, cooldown_hours, created_at, updated_at
                  ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
                  ) ON CONFLICT (id) DO NOTHING`,
                  [
                    p.id, p.title, p.message, p.btn1Text || null, p.btn1Url || null, p.btn1Enabled,
                    p.btn2Text || null, p.btn2Url || null, p.btn2Enabled, p.bgImageUrl || null, p.type,
                    p.position, p.frequency, p.delaySeconds, p.showOn, p.pagePaths || null,
                    p.active, p.priority, p.showCloseBtn, p.showOverlay, p.closeOnOverlay,
                    p.cooldownEnabled, p.cooldownHours, new Date(p.createdAt), new Date(p.updatedAt)
                  ]
                );
              }
            }

            const contRes = await conn.pool.query('SELECT count(*) FROM content');
            if (parseInt(contRes.rows[0].count, 10) === 0) {
              for (const item of INITIAL_CONTENT) {
                await conn.pool.query(`
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
                  ) ON CONFLICT (id) DO NOTHING
                `, [
                  item.id, item.title, item.slug, item.description, item.posterUrl, item.backdropUrl || null,
                  item.categoryId, item.categoryName, item.categorySlug, JSON.stringify(item.genres), JSON.stringify(item.tags),
                  item.releaseDate, item.duration || null, item.rating || null, item.language || null, item.featured, item.status,
                  item.trailerUrl || null, item.views, conn.envKey, item.tutorialTitle || null, item.tutorialUrl || null,
                  item.tutorialThumbnail || null, item.howToAccessTitle || null, item.howToAccessInstructions || null,
                  JSON.stringify(item.howToAccessSteps || []), JSON.stringify(item.accessOptions || []),
                  new Date(item.createdAt), new Date(item.updatedAt)
                ]);
              }
            }
          } catch (seedErr) {
            console.warn(`[MultiDbManager] Warning seeding initial data on ${conn.envKey}:`, seedErr);
          }
        } catch (err) {
          console.error(`[MultiDbManager] Error initializing schema on ${conn.envKey}:`, err);
          conn.status = 'unreachable';
        }
      }
      this.isInitialized = true;
    })();

    return this.initPromise;
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
    const realConns = this.connections.filter(c => c.pool && c.status === 'connected');

    if (realConns.length > 0) {
      const allItems: ContentItem[] = [];
      let anySucceeded = false;
      let lastError: any = null;

      for (const conn of realConns) {
        try {
          const res = await conn.pool!.query(`SELECT * FROM content ORDER BY created_at DESC`);
          const items = res.rows.map(row => this.mapContentRow(row, conn.envKey));
          allItems.push(...items);
          anySucceeded = true;
        } catch (err) {
          lastError = err;
          console.error(`[MultiDbManager] Error querying content on ${conn.envKey}:`, err);
          conn.status = 'unreachable';
        }
      }

      if (anySucceeded && allItems.length > 0) {
        return this.filterAndPaginateContent(allItems, params);
      }

      if (lastError) {
        console.warn('[MultiDbManager] Falling back to default content due to query error:', lastError);
      }
    }

    // Local dev mode fallback or when DB is empty/unreachable
    return this.filterAndPaginateContent(this.localDevData.content, params);
  }

  private filterAndPaginateContent(allItems: ContentItem[], params: SearchFilterParams): PaginatedResult<ContentItem> {
    const map = new Map<string, ContentItem>();
    for (const item of allItems) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    let list = Array.from(map.values());

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
      list = list.filter(c => c.featured === Boolean(params.featured));
    }

    const searchKeyword = (params.q || params.search || params.query || '').toLowerCase().trim();
    if (searchKeyword) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(searchKeyword) ||
        c.description.toLowerCase().includes(searchKeyword) ||
        c.genres.some(g => g.toLowerCase().includes(searchKeyword)) ||
        c.tags.some(t => t.toLowerCase().includes(searchKeyword))
      );
    }

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
          console.error(`[MultiDbManager] Search by slug failed on ${conn.envKey}:`, e);
          if (this.isProduction()) throw e;
        }
      }
    }

    if (!this.hasRealDatabases()) {
      const local = this.localDevData.content.find(c => c.slug.toLowerCase() === cleanSlug);
      if (local) {
        if (incrementViews) local.views = (local.views || 0) + 1;
        return { ...local };
      }
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
          console.error(`[MultiDbManager] Search by id failed on ${conn.envKey}:`, e);
          if (this.isProduction()) throw e;
        }
      }
    }

    if (!this.hasRealDatabases()) {
      const local = this.localDevData.content.find(c => c.id === id);
      return local ? { ...local } : null;
    }

    return null;
  }

  public async createContent(input: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<ContentItem> {
    const now = new Date().toISOString();
    const id = 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.title);

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
        return newItem;
      } catch (err) {
        console.error(`[MultiDbManager] Error inserting content into ${writeConn.envKey}:`, err);
        throw err;
      }
    }

    if (this.isProduction()) {
      throw new Error('Cannot create content: No database connection available.');
    }

    this.localDevData.content.unshift(newItem);
    return newItem;
  }

  public async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const existing = await this.getContentById(id);
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

    let updatedInDb = false;
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`
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
          if ((res.rowCount ?? 0) > 0) updatedInDb = true;
        } catch (e) {
          console.error(`[MultiDbManager] Update failed on ${conn.envKey}:`, e);
          if (this.isProduction()) throw e;
        }
      }
    }

    if (!this.hasRealDatabases()) {
      const idx = this.localDevData.content.findIndex(c => c.id === id);
      if (idx !== -1) this.localDevData.content[idx] = updated;
      return updated;
    }

    return updatedInDb ? updated : existing;
  }

  public async deleteContent(id: string): Promise<boolean> {
    let deleted = false;
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`DELETE FROM content WHERE id = $1`, [id]);
          if ((res.rowCount ?? 0) > 0) deleted = true;
        } catch (e) {
          console.error(`[MultiDbManager] Delete failed on ${conn.envKey}:`, e);
          if (this.isProduction()) throw e;
        }
      }
    }

    if (!this.hasRealDatabases()) {
      this.localDevData.content = this.localDevData.content.filter(c => c.id !== id);
      return true;
    }

    return deleted;
  }

  // ==========================================
  // CATEGORIES
  // ==========================================

  public async getCategories(): Promise<Category[]> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM categories ORDER BY display_order ASC, name ASC`);
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
          console.error(`[MultiDbManager] getCategories error on ${conn.envKey}:`, e);
          conn.status = 'unreachable';
        }
      }
    }

    return [...this.localDevData.categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public async createCategory(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const id = 'cat-' + Date.now();
    const cat: Category = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`
          INSERT INTO categories (id, name, slug, description, image_url, display_order, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [cat.id, cat.name, cat.slug, cat.description || null, cat.imageUrl || null, cat.displayOrder || 0, new Date(cat.createdAt)]);
        return cat;
      } catch (e) {
        console.error('[MultiDbManager] createCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) {
      throw new Error('Database error: Unable to create category.');
    }

    this.localDevData.categories.push(cat);
    return cat;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        const existingRes = await primary.pool.query(`SELECT * FROM categories WHERE id = $1`, [id]);
        if (existingRes.rows.length === 0) return null;
        const current = existingRes.rows[0];
        const updated = {
          name: updates.name ?? current.name,
          slug: updates.slug ? generateSlug(updates.slug) : current.slug,
          description: updates.description ?? current.description,
          imageUrl: updates.imageUrl ?? current.image_url,
          displayOrder: updates.displayOrder ?? current.display_order
        };
        await primary.pool.query(`
          UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4, display_order = $5
          WHERE id = $6
        `, [updated.name, updated.slug, updated.description, updated.imageUrl, updated.displayOrder, id]);
        return {
          id,
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          imageUrl: updated.imageUrl,
          displayOrder: updated.displayOrder,
          createdAt: current.created_at
        };
      } catch (e) {
        console.error('[MultiDbManager] updateCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');

    const idx = this.localDevData.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localDevData.categories[idx], ...updates };
    this.localDevData.categories[idx] = updated;
    return updated;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
        return true;
      } catch (e) {
        console.error('[MultiDbManager] deleteCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.categories = this.localDevData.categories.filter(c => c.id !== id);
    return true;
  }

  // ==========================================
  // GENRES
  // ==========================================

  public async getGenres(): Promise<Genre[]> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM genres ORDER BY name ASC`);
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
          console.error('[MultiDbManager] getGenres error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    return [...this.localDevData.genres];
  }

  public async createGenre(input: Omit<Genre, 'id' | 'createdAt'>): Promise<Genre> {
    const id = 'gen-' + Date.now();
    const item: Genre = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`
          INSERT INTO genres (id, name, slug, description, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [item.id, item.name, item.slug, item.description || null, new Date(item.createdAt)]);
        return item;
      } catch (e) {
        console.error('[MultiDbManager] createGenre error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.genres.push(item);
    return item;
  }

  public async deleteGenre(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`DELETE FROM genres WHERE id = $1`, [id]);
        return true;
      } catch (e) {
        console.error('[MultiDbManager] deleteGenre error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.genres = this.localDevData.genres.filter(g => g.id !== id);
    return true;
  }

  // ==========================================
  // TAGS
  // ==========================================

  public async getTags(): Promise<Tag[]> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT * FROM tags ORDER BY name ASC`);
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
          console.error('[MultiDbManager] getTags error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    return [...this.localDevData.tags];
  }

  public async createTag(input: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    const id = 'tag-' + Date.now();
    const item: Tag = {
      ...input,
      id,
      slug: input.slug ? generateSlug(input.slug) : generateSlug(input.name),
      createdAt: new Date().toISOString()
    };

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`
          INSERT INTO tags (id, name, slug, created_at)
          VALUES ($1, $2, $3, $4)
        `, [item.id, item.name, item.slug, new Date(item.createdAt)]);
        return item;
      } catch (e) {
        console.error('[MultiDbManager] createTag error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.tags.push(item);
    return item;
  }

  public async deleteTag(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`DELETE FROM tags WHERE id = $1`, [id]);
        return true;
      } catch (e) {
        console.error('[MultiDbManager] deleteTag error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.tags = this.localDevData.tags.filter(t => t.id !== id);
    return true;
  }

  // ==========================================
  // SITE SETTINGS
  // ==========================================

  public async getSettings(): Promise<SiteSettings> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const res = await conn.pool.query(`SELECT data FROM site_settings WHERE id = 'global_settings'`);
          if (res.rows.length > 0 && res.rows[0].data) {
            return { ...INITIAL_SETTINGS, ...res.rows[0].data };
          }
        } catch (e) {
          console.error('[MultiDbManager] getSettings error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    return { ...INITIAL_SETTINGS, ...this.localDevData.settings };
  }

  public async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`
          INSERT INTO site_settings (id, data, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW();
        `, ['global_settings', JSON.stringify(updated)]);
        return updated;
      } catch (e) {
        console.error('[MultiDbManager] updateSettings error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.settings = updated;
    return updated;
  }

  // ==========================================
  // POPUPS
  // ==========================================

  public async getPopups(activeOnly = false): Promise<Popup[]> {
    for (const conn of this.connections) {
      if (conn.pool && conn.status === 'connected') {
        try {
          const queryStr = activeOnly
            ? `SELECT * FROM popups WHERE active = TRUE ORDER BY priority ASC`
            : `SELECT * FROM popups ORDER BY priority ASC`;
          const res = await conn.pool.query(queryStr);
          if (res.rows.length > 0) {
            return res.rows.map(r => ({
              id: r.id,
              title: r.title,
              message: r.message,
              btn1Text: r.btn1_text,
              btn1Url: r.btn1_url,
              btn1Enabled: r.btn1_enabled,
              btn2Text: r.btn2_text,
              btn2Url: r.btn2_url,
              btn2Enabled: r.btn2_enabled,
              bgImageUrl: r.bg_image_url,
              type: r.type,
              position: r.position,
              frequency: r.frequency,
              delaySeconds: r.delay_seconds,
              showOn: r.show_on,
              pagePaths: r.page_paths,
              startDate: r.start_date,
              endDate: r.end_date,
              active: r.active,
              priority: r.priority,
              showCloseBtn: r.show_close_btn,
              showOverlay: r.show_overlay,
              closeOnOverlay: r.close_on_overlay,
              cooldownEnabled: r.cooldown_enabled,
              cooldownHours: r.cooldown_hours,
              createdAt: r.created_at,
              updatedAt: r.updated_at
            }));
          }
        } catch (e) {
          console.error('[MultiDbManager] getPopups error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    let list = [...this.localDevData.popups];
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

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`
          INSERT INTO popups (
            id, title, message, btn1_text, btn1_url, btn1_enabled,
            btn2_text, btn2_url, btn2_enabled, bg_image_url, type,
            position, frequency, delay_seconds, show_on, page_paths,
            start_date, end_date, active, priority, show_close_btn,
            show_overlay, close_on_overlay, cooldown_enabled, cooldown_hours,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
          )
        `, [
          p.id, p.title, p.message, p.btn1Text || null, p.btn1Url || null, p.btn1Enabled ?? true,
          p.btn2Text || null, p.btn2Url || null, p.btn2Enabled ?? false, p.bgImageUrl || null, p.type || 'announcement',
          p.position || 'center', p.frequency || 'once_per_session', p.delaySeconds || 2, p.showOn || 'all', p.pagePaths || null,
          p.startDate ? new Date(p.startDate) : null, p.endDate ? new Date(p.endDate) : null, p.active ?? true, p.priority || 1,
          p.showCloseBtn ?? true, p.showOverlay ?? true, p.closeOnOverlay ?? true, p.cooldownEnabled ?? false, p.cooldownHours || 24,
          new Date(p.createdAt), new Date(p.updatedAt)
        ]);
        return p;
      } catch (e) {
        console.error('[MultiDbManager] createPopup error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.popups.push(p);
    return p;
  }

  public async updatePopup(id: string, updates: Partial<Popup>): Promise<Popup | null> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        const existing = await primary.pool.query(`SELECT * FROM popups WHERE id = $1`, [id]);
        if (existing.rows.length === 0) return null;
        const cur = existing.rows[0];
        const now = new Date();

        await primary.pool.query(`
          UPDATE popups SET
            title = $1, message = $2, btn1_text = $3, btn1_url = $4, btn1_enabled = $5,
            btn2_text = $6, btn2_url = $7, btn2_enabled = $8, bg_image_url = $9, type = $10,
            position = $11, frequency = $12, delay_seconds = $13, show_on = $14, page_paths = $15,
            start_date = $16, end_date = $17, active = $18, priority = $19, show_close_btn = $20,
            show_overlay = $21, close_on_overlay = $22, cooldown_enabled = $23, cooldown_hours = $24,
            updated_at = $25
          WHERE id = $26
        `, [
          updates.title ?? cur.title, updates.message ?? cur.message, updates.btn1Text ?? cur.btn1_text,
          updates.btn1Url ?? cur.btn1_url, updates.btn1Enabled ?? cur.btn1_enabled, updates.btn2Text ?? cur.btn2_text,
          updates.btn2Url ?? cur.btn2_url, updates.btn2Enabled ?? cur.btn2_enabled, updates.bgImageUrl ?? cur.bg_image_url,
          updates.type ?? cur.type, updates.position ?? cur.position, updates.frequency ?? cur.frequency,
          updates.delaySeconds ?? cur.delay_seconds, updates.showOn ?? cur.show_on, updates.pagePaths ?? cur.page_paths,
          updates.startDate ? new Date(updates.startDate) : cur.start_date,
          updates.endDate ? new Date(updates.endDate) : cur.end_date,
          updates.active ?? cur.active, updates.priority ?? cur.priority,
          updates.showCloseBtn ?? cur.show_close_btn, updates.showOverlay ?? cur.show_overlay,
          updates.closeOnOverlay ?? cur.close_on_overlay, updates.cooldownEnabled ?? cur.cooldown_enabled,
          updates.cooldownHours ?? cur.cooldown_hours, now, id
        ]);

        const updatedRes = await primary.pool.query(`SELECT * FROM popups WHERE id = $1`, [id]);
        return updatedRes.rows[0];
      } catch (e) {
        console.error('[MultiDbManager] updatePopup error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');

    const idx = this.localDevData.popups.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localDevData.popups[idx], ...updates, updatedAt: new Date().toISOString() };
    this.localDevData.popups[idx] = updated;
    return updated;
  }

  public async deletePopup(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`DELETE FROM popups WHERE id = $1`, [id]);
        return true;
      } catch (e) {
        console.error('[MultiDbManager] deletePopup error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.popups = this.localDevData.popups.filter(p => p.id !== id);
    return true;
  }

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  public async verifyAdmin(email: string, passwordPlain: string, env: Record<string, any> = {}): Promise<AdminUser | null> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check database for existing admin users
    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        const res = await primary.pool.query(`SELECT * FROM admin_users WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
        if (res.rows.length > 0) {
          const user = res.rows[0];
          const isValid = await bcrypt.compare(passwordPlain, user.password_hash);
          if (isValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'superadmin',
              createdAt: user.created_at
            };
          }
          return null;
        }
      } catch (err) {
        console.error('[MultiDbManager] Error querying admin user from database:', err);
      }
    }

    // 2. Check environment credentials (ADMIN_EMAIL, ADMIN_PASSWORD)
    const adminEmail = (env.ADMIN_EMAIL || '')?.trim().toLowerCase();
    const adminPassword = (env.ADMIN_PASSWORD || '')?.trim();

    if (adminEmail && adminPassword && cleanEmail === adminEmail) {
      if (passwordPlain === adminPassword) {
        const adminObj: AdminUser = {
          id: 'admin-master',
          email: adminEmail,
          name: 'SKx Movies Chief Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString()
        };

        // If database is connected, persist this verified admin with a hashed password
        if (primary && primary.pool) {
          try {
            const hash = await bcrypt.hash(passwordPlain, 10);
            await primary.pool.query(`
              INSERT INTO admin_users (id, email, password_hash, name, role, created_at)
              VALUES ($1, $2, $3, $4, $5, NOW())
              ON CONFLICT (email) DO NOTHING
            `, [adminObj.id, adminObj.email, hash, adminObj.name, adminObj.role]);
          } catch {}
        }

        return adminObj;
      }
    }

    return null;
  }

  public async changeAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
    const hash = await bcrypt.hash(newPasswordPlain, 10);

    const primary = this.connections.find(c => c.pool && c.status === 'connected');
    if (primary && primary.pool) {
      try {
        await primary.pool.query(`UPDATE admin_users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
        return true;
      } catch (e) {
        console.error('[MultiDbManager] changeAdminPassword error:', e);
        throw e;
      }
    }

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

    const categories = await this.getCategories().catch(() => []);
    const genres = await this.getGenres().catch(() => []);
    const tags = await this.getTags().catch(() => []);

    return {
      totalContent: all.length,
      published,
      drafts,
      totalCategories: categories.length,
      totalGenres: genres.length,
      totalTags: tags.length,
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
