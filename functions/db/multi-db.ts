import postgres, { Sql } from 'postgres';
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

export interface DatabaseConnection {
  index: number;
  envKey: string;
  url: string;
  sql: Sql | null;
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
 * Optimized for Cloudflare Pages Functions and edge environments using postgres.js.
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
  private sqlCache = new Map<string, Sql>();

  constructor() {
    this.discoverDatabases({});
  }

  public isProduction(): boolean {
    const env = this.currentEnv;
    const nodeEnv = env.NODE_ENV || (typeof process !== 'undefined' ? process.env.NODE_ENV : '') || '';
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
    const primaryUrl = (
      hyperdriveUrl ||
      envSource.DATABASE_URL ||
      (typeof process !== 'undefined' ? process.env.DATABASE_URL : '') ||
      ''
    )?.trim();

    if (primaryUrl) {
      discovered.push({
        index: 1,
        envKey: hyperdriveUrl ? 'HYPERDRIVE (Primary)' : 'DATABASE_URL',
        url: primaryUrl,
        sql: null,
        isWriteActive: false,
        status: 'unreachable'
      });
    }

    // 2. Check DATABASE_URL_2 through DATABASE_URL_10
    for (let i = 2; i <= 10; i++) {
      const key = `DATABASE_URL_${i}`;
      const url = (
        envSource[key] ||
        (typeof process !== 'undefined' ? process.env[key] : '') ||
        ''
      )?.trim();
      if (url) {
        discovered.push({
          index: i,
          envKey: key,
          url,
          sql: null,
          isWriteActive: false,
          status: 'unreachable'
        });
      }
    }

    // If no real databases configured:
    if (discovered.length === 0) {
      if (this.lastDiscoveredKey === 'memory-only') return;
      this.lastDiscoveredKey = 'memory-only';

      if (this.isProduction()) {
        // In production, missing database URL is an error, not a silent in-memory fallback
        this.connections = [{
          index: 1,
          envKey: 'DATABASE_URL (Missing in Production)',
          url: '',
          sql: null,
          isWriteActive: false,
          status: 'unreachable'
        }];
        return;
      }

      // Local development only fallback
      discovered.push({
        index: 1,
        envKey: 'DATABASE_URL (Local Dev Memory)',
        url: 'memory://skxmovies-local-dev',
        sql: null,
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

    // Initialize or reuse postgres clients
    for (const conn of discovered) {
      try {
        let cachedSql = this.sqlCache.get(conn.url);
        if (!cachedSql) {
          cachedSql = postgres(conn.url, {
            ssl: 'require',
            max: 5,
            idle_timeout: 30,
            connect_timeout: 10,
            prepare: false
          });
          this.sqlCache.set(conn.url, cachedSql);
        }
        conn.sql = cachedSql;
        conn.status = 'connected';
      } catch (err) {
        console.error(`[MultiDbManager] Error configuring database connection for ${conn.envKey}:`, err);
        conn.sql = null;
        conn.status = 'unreachable';
      }
    }

    this.connections = discovered;
  }

  public getDbStatus(): MultiDbStatus {
    const connectedDatabases = this.connections.filter(c => c.status === 'connected').length;
    const writeConn = this.connections.find(c => c.index === this.activeWriteIndex);
    return {
      connectedDatabases,
      activeDatabaseIndex: this.activeWriteIndex,
      activeDatabaseName: writeConn ? writeConn.envKey : 'None',
      allDatabases: this.connections.map(c => ({
        index: c.index,
        name: c.envKey,
        isWriteActive: c.isWriteActive,
        status: c.status
      }))
    };
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      for (const conn of this.connections) {
        if (!conn.sql || conn.status === 'simulated') continue;
        try {
          await this.createTables(conn.sql);
          await this.seedInitialDataIfEmpty(conn.sql);
          conn.status = 'connected';
        } catch (e: any) {
          console.error(`[MultiDbManager] Failed to initialize tables on ${conn.envKey}:`, e.message || e);
          conn.status = 'unreachable';
          if (this.isProduction()) {
            throw new Error(`Database initialization failed on ${conn.envKey}: ${e.message || e}`);
          }
        }
      }
      this.isInitialized = true;
    })();

    return this.initPromise;
  }

  private async createTables(sql: Sql) {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        display_order VARCHAR(10) DEFAULT '1',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS genres (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS content (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        description TEXT,
        poster_url TEXT,
        backdrop_url TEXT,
        category_id VARCHAR(64),
        category_name VARCHAR(255),
        category_slug VARCHAR(255),
        genres JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '[]'::jsonb,
        release_date VARCHAR(64),
        duration VARCHAR(64),
        rating VARCHAR(16),
        language VARCHAR(64),
        featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(32) DEFAULT 'published',
        trailer_url TEXT,
        views BIGINT DEFAULT 0,
        db_source VARCHAR(64),
        tutorial_title VARCHAR(255),
        tutorial_url TEXT,
        tutorial_thumbnail TEXT,
        how_to_access_title VARCHAR(255),
        how_to_access_instructions TEXT,
        how_to_access_steps JSONB DEFAULT '[]'::jsonb,
        access_options JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS popups (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        btn1_text VARCHAR(100),
        btn1_url TEXT,
        btn1_enabled BOOLEAN DEFAULT TRUE,
        btn2_text VARCHAR(100),
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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'superadmin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  private async seedInitialDataIfEmpty(sql: Sql) {
    try {
      const countRes = await sql`SELECT COUNT(*)::int as count FROM categories`;
      const count = countRes[0]?.count ?? 0;
      if (count > 0) return;

      console.log('[MultiDbManager] Seeding initial database data...');

      // Seed categories
      for (const c of INITIAL_CATEGORIES) {
        await sql`
          INSERT INTO categories (id, name, slug, description, image_url, display_order, created_at)
          VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.description || null}, ${c.imageUrl || null}, ${c.displayOrder || '1'}, ${new Date(c.createdAt)})
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed genres
      for (const g of INITIAL_GENRES) {
        await sql`
          INSERT INTO genres (id, name, slug, description, created_at)
          VALUES (${g.id}, ${g.name}, ${g.slug}, ${g.description || null}, ${new Date(g.createdAt)})
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed tags
      for (const t of INITIAL_TAGS) {
        await sql`
          INSERT INTO tags (id, name, slug, created_at)
          VALUES (${t.id}, ${t.name}, ${t.slug}, ${new Date(t.createdAt)})
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed initial content
      for (const item of INITIAL_CONTENT) {
        await sql`
          INSERT INTO content (
            id, title, slug, description, poster_url, backdrop_url,
            category_id, category_name, category_slug, genres, tags,
            release_date, duration, rating, language, featured, status,
            trailer_url, views, db_source, tutorial_title, tutorial_url,
            tutorial_thumbnail, how_to_access_title, how_to_access_instructions,
            how_to_access_steps, access_options, created_at, updated_at
          ) VALUES (
            ${item.id}, ${item.title}, ${item.slug}, ${item.description || null}, ${item.posterUrl || null}, ${item.backdropUrl || null},
            ${item.categoryId || null}, ${item.categoryName || null}, ${item.categorySlug || null},
            ${JSON.stringify(item.genres || [])}, ${JSON.stringify(item.tags || [])},
            ${item.releaseDate || null}, ${item.duration || null}, ${item.rating || null}, ${item.language || null},
            ${item.featured ?? false}, ${item.status || 'published'}, ${item.trailerUrl || null},
            ${item.views || 0}, ${item.dbSource || 'Primary'}, ${item.tutorialTitle || null}, ${item.tutorialUrl || null},
            ${item.tutorialThumbnail || null}, ${item.howToAccessTitle || null}, ${item.howToAccessInstructions || null},
            ${JSON.stringify(item.howToAccessSteps || [])}, ${JSON.stringify(item.accessOptions || [])},
            ${new Date(item.createdAt)}, ${new Date(item.updatedAt)}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed popups
      for (const p of INITIAL_POPUPS) {
        await sql`
          INSERT INTO popups (
            id, title, message, btn1_text, btn1_url, btn1_enabled,
            btn2_text, btn2_url, btn2_enabled, bg_image_url, type,
            position, frequency, delay_seconds, show_on, page_paths,
            start_date, end_date, active, priority, show_close_btn,
            show_overlay, close_on_overlay, cooldown_enabled, cooldown_hours,
            created_at, updated_at
          ) VALUES (
            ${p.id}, ${p.title}, ${p.message}, ${p.btn1Text || null}, ${p.btn1Url || null}, ${p.btn1Enabled ?? true},
            ${p.btn2Text || null}, ${p.btn2Url || null}, ${p.btn2Enabled ?? false}, ${p.bgImageUrl || null},
            ${p.type || 'announcement'}, ${p.position || 'center'}, ${p.frequency || 'once_per_session'},
            ${p.delaySeconds || 2}, ${p.showOn || 'all'}, ${p.pagePaths || null},
            ${p.startDate ? new Date(p.startDate) : null}, ${p.endDate ? new Date(p.endDate) : null},
            ${p.active ?? true}, ${p.priority || 1}, ${p.showCloseBtn ?? true},
            ${p.showOverlay ?? true}, ${p.closeOnOverlay ?? true}, ${p.cooldownEnabled ?? false}, ${p.cooldownHours || 24},
            ${new Date(p.createdAt)}, ${new Date(p.updatedAt)}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed site settings
      await sql`
        INSERT INTO site_settings (id, data, updated_at)
        VALUES ('global_settings', ${JSON.stringify(INITIAL_SETTINGS)}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;

      console.log('[MultiDbManager] Database seeded successfully.');
    } catch (err) {
      console.error('[MultiDbManager] Seed initial data error:', err);
    }
  }

  // ==========================================
  // CONTENT CRUD & QUERIES
  // ==========================================

  public async getAllContent(params: SearchFilterParams = {}): Promise<PaginatedResult<ContentItem>> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const sql = primary.sql;
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 24));
        const offset = (page - 1) * limit;

        const conditions: any[] = [];

        if (params.status && params.status !== 'all') {
          conditions.push(sql`status = ${params.status}`);
        }
        if (params.categoryId) {
          conditions.push(sql`category_id = ${params.categoryId}`);
        }
        if (params.featured !== undefined) {
          conditions.push(sql`featured = ${Boolean(params.featured)}`);
        }
        if (params.search) {
          const q = `%${params.search}%`;
          conditions.push(sql`(title ILIKE ${q} OR description ILIKE ${q})`);
        }
        if (params.genreId) {
          conditions.push(sql`genres::text ILIKE ${'%' + params.genreId + '%'}`);
        }
        if (params.tag) {
          conditions.push(sql`tags::text ILIKE ${'%' + params.tag + '%'}`);
        }

        const whereClause = conditions.length > 0
          ? sql`WHERE ${conditions.reduce((prev, curr) => sql`${prev} AND ${curr}`)}`
          : sql``;

        let orderBy = sql`ORDER BY created_at DESC`;
        if (params.sortBy === 'views') {
          orderBy = params.sortOrder === 'asc' ? sql`ORDER BY views ASC` : sql`ORDER BY views DESC`;
        } else if (params.sortBy === 'rating') {
          orderBy = params.sortOrder === 'asc' ? sql`ORDER BY rating ASC` : sql`ORDER BY rating DESC`;
        } else if (params.sortBy === 'releaseDate') {
          orderBy = params.sortOrder === 'asc' ? sql`ORDER BY release_date ASC` : sql`ORDER BY release_date DESC`;
        } else if (params.sortBy === 'title') {
          orderBy = params.sortOrder === 'desc' ? sql`ORDER BY title DESC` : sql`ORDER BY title ASC`;
        } else if (params.sortBy === 'createdAt') {
          orderBy = params.sortOrder === 'asc' ? sql`ORDER BY created_at ASC` : sql`ORDER BY created_at DESC`;
        }

        const countResult = await sql`SELECT COUNT(*)::int as total FROM content ${whereClause}`;
        const total = countResult[0]?.total ?? 0;

        const rows = await sql`
          SELECT * FROM content
          ${whereClause}
          ${orderBy}
          LIMIT ${limit} OFFSET ${offset}
        `;

        return {
          items: rows.map(r => this.mapContentRow(r, primary.envKey)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        };
      } catch (e: any) {
        console.error('[MultiDbManager] getAllContent error:', e);
        primary.status = 'unreachable';
        if (this.isProduction()) {
          throw new Error(`Database query error in getAllContent: ${e.message || e}`);
        }
      }
    }

    if (this.isProduction()) {
      throw new Error('Database error: No active database available to retrieve content.');
    }

    // Local dev memory fallback
    let list = [...this.localDevData.content];
    if (params.status && params.status !== 'all') {
      list = list.filter(c => c.status === params.status);
    }
    if (params.categoryId) {
      list = list.filter(c => c.categoryId === params.categoryId || c.categorySlug === params.categoryId);
    }
    if (params.genreId) {
      const targetGenre = params.genreId.toLowerCase();
      list = list.filter(c => c.genres.some((g: any) =>
        typeof g === 'string'
          ? g.toLowerCase().includes(targetGenre)
          : (g?.id === params.genreId || g?.slug === params.genreId)
      ));
    }
    if (params.tag) {
      const targetTag = params.tag.toLowerCase();
      list = list.filter(c => c.tags.some((t: any) =>
        typeof t === 'string'
          ? t.toLowerCase().includes(targetTag)
          : (t?.id === params.tag || t?.slug === params.tag)
      ));
    }
    if (params.featured !== undefined) {
      list = list.filter(c => c.featured === params.featured);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 24));
    const offset = (page - 1) * limit;
    const total = list.length;
    const items = list.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public async getContentById(id: string): Promise<ContentItem | null> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM content WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return null;
        return this.mapContentRow(rows[0], primary.envKey);
      } catch (e: any) {
        console.error('[MultiDbManager] getContentById error:', e);
        if (this.isProduction()) throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: Content lookup failed');
    return this.localDevData.content.find(c => c.id === id) || null;
  }

  public async getContentBySlug(slug: string, incrementView = false): Promise<ContentItem | null> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM content WHERE slug = ${slug} LIMIT 1`;
        if (rows.length === 0) return null;
        const item = this.mapContentRow(rows[0], primary.envKey);

        if (incrementView) {
          primary.sql`UPDATE content SET views = views + 1 WHERE id = ${item.id}`.catch(() => {});
          item.views = (item.views || 0) + 1;
        }

        return item;
      } catch (e: any) {
        console.error('[MultiDbManager] getContentBySlug error:', e);
        if (this.isProduction()) throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: Content lookup failed');
    const item = this.localDevData.content.find(c => c.slug === slug) || null;
    if (item && incrementView) {
      item.views = (item.views || 0) + 1;
    }
    return item;
  }

  public async createContent(input: Partial<ContentItem>): Promise<ContentItem> {
    const now = new Date().toISOString();
    const id = 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const slug = input.slug || generateSlug(input.title || id);

    const newItem: ContentItem = {
      id,
      title: input.title || 'Untitled',
      slug,
      description: input.description || '',
      posterUrl: input.posterUrl || '',
      backdropUrl: input.backdropUrl || '',
      categoryId: input.categoryId || '',
      categoryName: input.categoryName || '',
      categorySlug: input.categorySlug || '',
      genres: input.genres || [],
      tags: input.tags || [],
      releaseDate: input.releaseDate || '',
      duration: input.duration || '',
      rating: input.rating || '',
      language: input.language || 'English',
      featured: Boolean(input.featured),
      status: input.status || 'published',
      trailerUrl: input.trailerUrl || '',
      views: 0,
      dbSource: 'Primary',
      tutorialTitle: input.tutorialTitle || '',
      tutorialUrl: input.tutorialUrl || '',
      tutorialThumbnail: input.tutorialThumbnail || '',
      howToAccessTitle: input.howToAccessTitle || '',
      howToAccessInstructions: input.howToAccessInstructions || '',
      howToAccessSteps: input.howToAccessSteps || [],
      accessOptions: input.accessOptions || [],
      createdAt: now,
      updatedAt: now
    };

    // Save to active write database
    const writeConn = this.connections.find(c => c.index === this.activeWriteIndex && c.sql && c.status === 'connected')
      || this.connections.find(c => c.sql && c.status === 'connected');

    if (writeConn && writeConn.sql) {
      try {
        await writeConn.sql`
          INSERT INTO content (
            id, title, slug, description, poster_url, backdrop_url,
            category_id, category_name, category_slug, genres, tags,
            release_date, duration, rating, language, featured, status,
            trailer_url, views, db_source, tutorial_title, tutorial_url,
            tutorial_thumbnail, how_to_access_title, how_to_access_instructions,
            how_to_access_steps, access_options, created_at, updated_at
          ) VALUES (
            ${newItem.id}, ${newItem.title}, ${newItem.slug}, ${newItem.description || null},
            ${newItem.posterUrl || null}, ${newItem.backdropUrl || null},
            ${newItem.categoryId || null}, ${newItem.categoryName || null}, ${newItem.categorySlug || null},
            ${JSON.stringify(newItem.genres || [])}, ${JSON.stringify(newItem.tags || [])},
            ${newItem.releaseDate || null}, ${newItem.duration || null}, ${newItem.rating || null},
            ${newItem.language || null}, ${newItem.featured ?? false}, ${newItem.status || 'published'},
            ${newItem.trailerUrl || null}, ${newItem.views || 0}, ${writeConn.envKey},
            ${newItem.tutorialTitle || null}, ${newItem.tutorialUrl || null}, ${newItem.tutorialThumbnail || null},
            ${newItem.howToAccessTitle || null}, ${newItem.howToAccessInstructions || null},
            ${JSON.stringify(newItem.howToAccessSteps || [])}, ${JSON.stringify(newItem.accessOptions || [])},
            ${new Date(newItem.createdAt)}, ${new Date(newItem.updatedAt)}
          )
        `;
        newItem.dbSource = writeConn.envKey;
        return newItem;
      } catch (e: any) {
        console.error('[MultiDbManager] createContent error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: No writable database available');

    this.localDevData.content.unshift(newItem);
    return newItem;
  }

  public async updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const writeConn = this.connections.find(c => c.index === this.activeWriteIndex && c.sql && c.status === 'connected')
      || this.connections.find(c => c.sql && c.status === 'connected');

    if (writeConn && writeConn.sql) {
      try {
        const rows = await writeConn.sql`SELECT * FROM content WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return null;
        const cur = rows[0];
        const now = new Date();

        await writeConn.sql`
          UPDATE content SET
            title = ${updates.title ?? cur.title},
            slug = ${updates.slug ?? cur.slug},
            description = ${updates.description ?? cur.description},
            poster_url = ${updates.posterUrl ?? cur.poster_url},
            backdrop_url = ${updates.backdropUrl ?? cur.backdrop_url},
            category_id = ${updates.categoryId ?? cur.category_id},
            category_name = ${updates.categoryName ?? cur.category_name},
            category_slug = ${updates.categorySlug ?? cur.category_slug},
            genres = ${updates.genres ? JSON.stringify(updates.genres) : cur.genres},
            tags = ${updates.tags ? JSON.stringify(updates.tags) : cur.tags},
            release_date = ${updates.releaseDate ?? cur.release_date},
            duration = ${updates.duration ?? cur.duration},
            rating = ${updates.rating ?? cur.rating},
            language = ${updates.language ?? cur.language},
            featured = ${updates.featured ?? cur.featured},
            status = ${updates.status ?? cur.status},
            trailer_url = ${updates.trailerUrl ?? cur.trailer_url},
            tutorial_title = ${updates.tutorialTitle ?? cur.tutorial_title},
            tutorial_url = ${updates.tutorialUrl ?? cur.tutorial_url},
            tutorial_thumbnail = ${updates.tutorialThumbnail ?? cur.tutorial_thumbnail},
            how_to_access_title = ${updates.howToAccessTitle ?? cur.how_to_access_title},
            how_to_access_instructions = ${updates.howToAccessInstructions ?? cur.how_to_access_instructions},
            how_to_access_steps = ${updates.howToAccessSteps ? JSON.stringify(updates.howToAccessSteps) : cur.how_to_access_steps},
            access_options = ${updates.accessOptions ? JSON.stringify(updates.accessOptions) : cur.access_options},
            updated_at = ${now}
          WHERE id = ${id}
        `;

        const updatedRows = await writeConn.sql`SELECT * FROM content WHERE id = ${id} LIMIT 1`;
        return this.mapContentRow(updatedRows[0], writeConn.envKey);
      } catch (e: any) {
        console.error('[MultiDbManager] updateContent error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: Update content failed');

    const idx = this.localDevData.content.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localDevData.content[idx], ...updates, updatedAt: new Date().toISOString() };
    this.localDevData.content[idx] = updated;
    return updated;
  }

  public async deleteContent(id: string): Promise<boolean> {
    const writeConn = this.connections.find(c => c.index === this.activeWriteIndex && c.sql && c.status === 'connected')
      || this.connections.find(c => c.sql && c.status === 'connected');

    if (writeConn && writeConn.sql) {
      try {
        await writeConn.sql`DELETE FROM content WHERE id = ${id}`;
        return true;
      } catch (e: any) {
        console.error('[MultiDbManager] deleteContent error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: Delete content failed');

    this.localDevData.content = this.localDevData.content.filter(c => c.id !== id);
    return true;
  }

  // ==========================================
  // CATEGORIES
  // ==========================================

  public async getCategories(): Promise<Category[]> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM categories ORDER BY display_order ASC`;
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            imageUrl: r.image_url,
            displayOrder: r.display_order,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (e: any) {
        console.error('[MultiDbManager] getCategories error:', e);
        primary.status = 'unreachable';
      }
    }

    if (this.isProduction()) throw new Error('Database error retrieving categories');
    return [...this.localDevData.categories];
  }

  public async createCategory(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const now = new Date().toISOString();
    const id = 'cat-' + Date.now();
    const cat: Category = {
      ...input,
      id,
      slug: input.slug || generateSlug(input.name),
      createdAt: now
    };

    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`
          INSERT INTO categories (id, name, slug, description, image_url, display_order, created_at)
          VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description || null}, ${cat.imageUrl || null}, ${cat.displayOrder || '1'}, ${new Date(cat.createdAt)})
        `;
        return cat;
      } catch (e: any) {
        console.error('[MultiDbManager] createCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error creating category');
    this.localDevData.categories.push(cat);
    return cat;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM categories WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return null;
        const cur = rows[0];

        await primary.sql`
          UPDATE categories SET
            name = ${updates.name ?? cur.name},
            slug = ${updates.slug ?? cur.slug},
            description = ${updates.description ?? cur.description},
            image_url = ${updates.imageUrl ?? cur.image_url},
            display_order = ${updates.displayOrder ?? cur.display_order}
          WHERE id = ${id}
        `;

        const updatedRows = await primary.sql`SELECT * FROM categories WHERE id = ${id} LIMIT 1`;
        const r = updatedRows[0];
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          imageUrl: r.image_url,
          displayOrder: r.display_order,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        };
      } catch (e: any) {
        console.error('[MultiDbManager] updateCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error updating category');
    const idx = this.localDevData.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localDevData.categories[idx], ...updates };
    this.localDevData.categories[idx] = updated;
    return updated;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`DELETE FROM categories WHERE id = ${id}`;
        return true;
      } catch (e: any) {
        console.error('[MultiDbManager] deleteCategory error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error deleting category');
    this.localDevData.categories = this.localDevData.categories.filter(c => c.id !== id);
    return true;
  }

  // ==========================================
  // GENRES
  // ==========================================

  public async getGenres(): Promise<Genre[]> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM genres ORDER BY name ASC`;
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (e: any) {
        console.error('[MultiDbManager] getGenres error:', e);
        primary.status = 'unreachable';
      }
    }

    if (this.isProduction()) throw new Error('Database error retrieving genres');
    return [...this.localDevData.genres];
  }

  public async createGenre(input: Omit<Genre, 'id' | 'createdAt'>): Promise<Genre> {
    const now = new Date().toISOString();
    const id = 'gen-' + Date.now();
    const gen: Genre = {
      ...input,
      id,
      slug: input.slug || generateSlug(input.name),
      createdAt: now
    };

    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`
          INSERT INTO genres (id, name, slug, description, created_at)
          VALUES (${gen.id}, ${gen.name}, ${gen.slug}, ${gen.description || null}, ${new Date(gen.createdAt)})
        `;
        return gen;
      } catch (e: any) {
        console.error('[MultiDbManager] createGenre error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error creating genre');
    this.localDevData.genres.push(gen);
    return gen;
  }

  public async updateGenre(id: string, updates: Partial<Genre>): Promise<Genre | null> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM genres WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return null;
        const cur = rows[0];

        await primary.sql`
          UPDATE genres SET
            name = ${updates.name ?? cur.name},
            slug = ${updates.slug ?? cur.slug},
            description = ${updates.description ?? cur.description}
          WHERE id = ${id}
        `;

        const updatedRows = await primary.sql`SELECT * FROM genres WHERE id = ${id} LIMIT 1`;
        const r = updatedRows[0];
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
        };
      } catch (e: any) {
        console.error('[MultiDbManager] updateGenre error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error updating genre');
    const idx = this.localDevData.genres.findIndex(g => g.id === id);
    if (idx === -1) return null;
    const updated = { ...this.localDevData.genres[idx], ...updates };
    this.localDevData.genres[idx] = updated;
    return updated;
  }

  public async deleteGenre(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`DELETE FROM genres WHERE id = ${id}`;
        return true;
      } catch (e: any) {
        console.error('[MultiDbManager] deleteGenre error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error deleting genre');
    this.localDevData.genres = this.localDevData.genres.filter(g => g.id !== id);
    return true;
  }

  // ==========================================
  // TAGS
  // ==========================================

  public async getTags(): Promise<Tag[]> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM tags ORDER BY name ASC`;
        if (rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (e: any) {
        console.error('[MultiDbManager] getTags error:', e);
        primary.status = 'unreachable';
      }
    }

    if (this.isProduction()) throw new Error('Database error retrieving tags');
    return [...this.localDevData.tags];
  }

  public async createTag(input: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    const now = new Date().toISOString();
    const id = 'tag-' + Date.now();
    const tag: Tag = {
      ...input,
      id,
      slug: input.slug || generateSlug(input.name),
      createdAt: now
    };

    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`
          INSERT INTO tags (id, name, slug, created_at)
          VALUES (${tag.id}, ${tag.name}, ${tag.slug}, ${new Date(tag.createdAt)})
        `;
        return tag;
      } catch (e: any) {
        console.error('[MultiDbManager] createTag error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error creating tag');
    this.localDevData.tags.push(tag);
    return tag;
  }

  public async deleteTag(id: string): Promise<boolean> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`DELETE FROM tags WHERE id = ${id}`;
        return true;
      } catch (e: any) {
        console.error('[MultiDbManager] deleteTag error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error deleting tag');
    this.localDevData.tags = this.localDevData.tags.filter(t => t.id !== id);
    return true;
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  public async getSettings(): Promise<SiteSettings> {
    for (const conn of this.connections) {
      if (conn.sql && conn.status === 'connected') {
        try {
          const rows = await conn.sql`SELECT data FROM site_settings WHERE id = 'global_settings' LIMIT 1`;
          if (rows.length > 0 && rows[0].data) {
            const parsed = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
            return { ...INITIAL_SETTINGS, ...parsed };
          }
        } catch (e: any) {
          console.error('[MultiDbManager] getSettings error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    if (this.isProduction()) throw new Error('Database error retrieving site settings');
    return { ...this.localDevData.settings };
  }

  public async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings().catch(() => ({ ...INITIAL_SETTINGS }));
    const updated = { ...current, ...updates };

    const writeConn = this.connections.find(c => c.index === this.activeWriteIndex && c.sql && c.status === 'connected')
      || this.connections.find(c => c.sql && c.status === 'connected');

    if (writeConn && writeConn.sql) {
      try {
        await writeConn.sql`
          INSERT INTO site_settings (id, data, updated_at)
          VALUES ('global_settings', ${JSON.stringify(updated)}, NOW())
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;
        return updated;
      } catch (e: any) {
        console.error('[MultiDbManager] updateSettings error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database error: Cannot save settings');
    this.localDevData.settings = updated;
    return updated;
  }

  // ==========================================
  // POPUPS
  // ==========================================

  public async getPopups(activeOnly = false): Promise<Popup[]> {
    for (const conn of this.connections) {
      if (conn.sql && conn.status === 'connected') {
        try {
          const rows = activeOnly
            ? await conn.sql`SELECT * FROM popups WHERE active = TRUE ORDER BY priority ASC`
            : await conn.sql`SELECT * FROM popups ORDER BY priority ASC`;

          if (rows.length > 0) {
            return rows.map(r => ({
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
        } catch (e: any) {
          console.error('[MultiDbManager] getPopups error:', e);
          conn.status = 'unreachable';
        }
      }
    }

    if (this.isProduction()) throw new Error('Database error retrieving popups');

    let list = [...this.localDevData.popups];
    if (activeOnly) {
      list = list.filter(p => p.active);
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

    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`
          INSERT INTO popups (
            id, title, message, btn1_text, btn1_url, btn1_enabled,
            btn2_text, btn2_url, btn2_enabled, bg_image_url, type,
            position, frequency, delay_seconds, show_on, page_paths,
            start_date, end_date, active, priority, show_close_btn,
            show_overlay, close_on_overlay, cooldown_enabled, cooldown_hours,
            created_at, updated_at
          ) VALUES (
            ${p.id}, ${p.title}, ${p.message}, ${p.btn1Text || null}, ${p.btn1Url || null}, ${p.btn1Enabled ?? true},
            ${p.btn2Text || null}, ${p.btn2Url || null}, ${p.btn2Enabled ?? false}, ${p.bgImageUrl || null}, ${p.type || 'announcement'},
            ${p.position || 'center'}, ${p.frequency || 'once_per_session'}, ${p.delaySeconds || 2}, ${p.showOn || 'all'}, ${p.pagePaths || null},
            ${p.startDate ? new Date(p.startDate) : null}, ${p.endDate ? new Date(p.endDate) : null}, ${p.active ?? true}, ${p.priority || 1},
            ${p.showCloseBtn ?? true}, ${p.showOverlay ?? true}, ${p.closeOnOverlay ?? true}, ${p.cooldownEnabled ?? false}, ${p.cooldownHours || 24},
            ${new Date(p.createdAt)}, ${new Date(p.updatedAt)}
          )
        `;
        return p;
      } catch (e: any) {
        console.error('[MultiDbManager] createPopup error:', e);
        throw e;
      }
    }

    if (this.isProduction()) throw new Error('Database unavailable');
    this.localDevData.popups.push(p);
    return p;
  }

  public async updatePopup(id: string, updates: Partial<Popup>): Promise<Popup | null> {
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM popups WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) return null;
        const cur = rows[0];
        const now = new Date();

        await primary.sql`
          UPDATE popups SET
            title = ${updates.title ?? cur.title},
            message = ${updates.message ?? cur.message},
            btn1_text = ${updates.btn1Text ?? cur.btn1_text},
            btn1_url = ${updates.btn1Url ?? cur.btn1_url},
            btn1_enabled = ${updates.btn1Enabled ?? cur.btn1_enabled},
            btn2_text = ${updates.btn2Text ?? cur.btn2_text},
            btn2_url = ${updates.btn2Url ?? cur.btn2_url},
            btn2_enabled = ${updates.btn2Enabled ?? cur.btn2_enabled},
            bg_image_url = ${updates.bgImageUrl ?? cur.bg_image_url},
            type = ${updates.type ?? cur.type},
            position = ${updates.position ?? cur.position},
            frequency = ${updates.frequency ?? cur.frequency},
            delay_seconds = ${updates.delaySeconds ?? cur.delay_seconds},
            show_on = ${updates.showOn ?? cur.show_on},
            page_paths = ${updates.pagePaths ?? cur.page_paths},
            start_date = ${updates.startDate ? new Date(updates.startDate) : cur.start_date},
            end_date = ${updates.endDate ? new Date(updates.endDate) : cur.end_date},
            active = ${updates.active ?? cur.active},
            priority = ${updates.priority ?? cur.priority},
            show_close_btn = ${updates.showCloseBtn ?? cur.show_close_btn},
            show_overlay = ${updates.showOverlay ?? cur.show_overlay},
            close_on_overlay = ${updates.closeOnOverlay ?? cur.close_on_overlay},
            cooldown_enabled = ${updates.cooldownEnabled ?? cur.cooldown_enabled},
            cooldown_hours = ${updates.cooldownHours ?? cur.cooldown_hours},
            updated_at = ${now}
          WHERE id = ${id}
        `;

        const updatedRows = await primary.sql`SELECT * FROM popups WHERE id = ${id} LIMIT 1`;
        const r = updatedRows[0];
        return {
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
        };
      } catch (e: any) {
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
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`DELETE FROM popups WHERE id = ${id}`;
        return true;
      } catch (e: any) {
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
    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        const rows = await primary.sql`SELECT * FROM admin_users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
        if (rows.length > 0) {
          const user = rows[0];
          const isValid = await bcrypt.compare(passwordPlain, user.password_hash);
          if (isValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'superadmin',
              createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString()
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
        if (primary && primary.sql) {
          try {
            const hash = await bcrypt.hash(passwordPlain, 10);
            await primary.sql`
              INSERT INTO admin_users (id, email, password_hash, name, role, created_at)
              VALUES (${adminObj.id}, ${adminObj.email}, ${hash}, ${adminObj.name}, ${adminObj.role}, NOW())
              ON CONFLICT (email) DO NOTHING
            `;
          } catch {}
        }

        return adminObj;
      }
    }

    return null;
  }

  public async changeAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
    const hash = await bcrypt.hash(newPasswordPlain, 10);

    const primary = this.connections.find(c => c.sql && c.status === 'connected');
    if (primary && primary.sql) {
      try {
        await primary.sql`UPDATE admin_users SET password_hash = ${hash} WHERE id = ${userId}`;
        return true;
      } catch (e: any) {
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
