import { multiDb } from './db/multi-db';
import { signAdminToken, verifyAdminToken, TokenPayload } from './auth';

export interface ApiRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: any;
}

export interface ApiResponse {
  status: number;
  headers?: Record<string, string>;
  body: any;
}

function getBearerToken(req: ApiRequest): string | null {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

function getJwtSecret(env: Record<string, any> = {}): string {
  return (env.JWT_SECRET || '')?.trim();
}

async function checkAdminAuth(req: ApiRequest, env: Record<string, any>): Promise<TokenPayload | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const secret = getJwtSecret(env);
  if (!secret) return null;
  return await verifyAdminToken(token, secret);
}

export async function handleApiRequest(req: ApiRequest, env: Record<string, any> = {}): Promise<ApiResponse> {
  // Ensure DB connection is configured from env
  multiDb.discoverDatabases(env);
  await multiDb.init().catch(err => {
    console.error('[API Router] multiDb.init() error:', err);
  });

  const method = (req.method || 'GET').toUpperCase();
  const fullPath = req.path || ((req as any).url ? new URL((req as any).url).pathname : '');
  const rawPath = fullPath.replace(/^\/api/, '');
  const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : (rawPath || '/');

  // 1. Health check
  if (path === '/health' && method === 'GET') {
    return {
      status: 200,
      body: {
        status: 'ok',
        runtime: 'Cloudflare Pages Functions',
        time: new Date().toISOString(),
        dbStatus: multiDb.getDbStatus()
      }
    };
  }

  // 2. Homepage Bundle (Ultra fast initial load)
  if (path === '/homepage' && method === 'GET') {
    try {
      const [featuredRes, trendingRes, latestRes, categories, genres, settings, popups] = await Promise.all([
        multiDb.getAllContent({ featured: true, limit: 6, status: 'published' }),
        multiDb.getAllContent({ sortBy: 'views', limit: 12, status: 'published' }),
        multiDb.getAllContent({ sortBy: 'createdAt', limit: 12, status: 'published' }),
        multiDb.getCategories(),
        multiDb.getGenres(),
        multiDb.getSettings(),
        multiDb.getPopups(true)
      ]);

      return {
        status: 200,
        body: {
          featured: featuredRes.items,
          trending: trendingRes.items,
          latest: latestRes.items,
          categories,
          genres,
          settings,
          popups
        }
      };
    } catch (err: any) {
      console.error('[API Router] /homepage error:', err);
      return {
        status: 500,
        body: { error: err.message || 'Failed to load homepage data' }
      };
    }
  }

  // 3. Settings
  if (path === '/settings' && method === 'GET') {
    try {
      const settings = await multiDb.getSettings();
      return { status: 200, body: settings };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to load settings' } };
    }
  }

  if (path === '/settings' && method === 'PUT') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const updated = await multiDb.updateSettings(req.body || {});
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update settings' } };
    }
  }

  // 4. Admin Auth
  if (path === '/admin/login' && method === 'POST') {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return { status: 400, body: { error: 'Email and password required' } };
    }
    const secret = getJwtSecret(env);
    if (!secret) {
      return { status: 500, body: { error: 'JWT_SECRET environment variable is not configured on Cloudflare.' } };
    }
    const admin = await multiDb.verifyAdmin(email, password, env);
    if (!admin) {
      return { status: 401, body: { error: 'Invalid admin credentials' } };
    }
    const token = await signAdminToken(admin, secret);
    return { status: 200, body: { token, user: admin } };
  }

  if (path === '/admin/me' && method === 'GET') {
    const payload = await checkAdminAuth(req, env);
    if (!payload) return { status: 401, body: { error: 'Unauthorized' } };
    return { status: 200, body: { user: payload } };
  }

  if (path === '/admin/change-password' && method === 'POST') {
    const payload = await checkAdminAuth(req, env);
    if (!payload) return { status: 401, body: { error: 'Unauthorized' } };
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return { status: 400, body: { error: 'Password must be at least 6 characters' } };
    }
    await multiDb.changeAdminPassword(payload.userId, newPassword);
    return { status: 200, body: { success: true, message: 'Password updated successfully' } };
  }

  if (path === '/admin/stats' && method === 'GET') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const stats = await multiDb.getStats();
      return { status: 200, body: stats };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to fetch admin stats' } };
    }
  }

  // 5. Content Management
  if (path === '/content' && method === 'GET') {
    const auth = await checkAdminAuth(req, env);
    const isAdmin = Boolean(auth);
    const params = {
      ...req.query,
      status: isAdmin ? (req.query.status as any || 'all') : 'published'
    };
    try {
      const result = await multiDb.getAllContent(params);
      return { status: 200, body: result };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to retrieve content' } };
    }
  }

  if (path.startsWith('/content/slug/') && method === 'GET') {
    const slug = path.replace('/content/slug/', '');
    try {
      const item = await multiDb.getContentBySlug(slug, true);
      if (!item) return { status: 404, body: { error: 'Content not found' } };
      return { status: 200, body: item };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to load content' } };
    }
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'GET') {
    const id = path.replace('/content/', '');
    try {
      const item = await multiDb.getContentById(id);
      if (!item) return { status: 404, body: { error: 'Content not found' } };
      return { status: 200, body: item };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to load content' } };
    }
  }

  if (path === '/content' && method === 'POST') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const created = await multiDb.createContent(req.body);
      return { status: 201, body: created };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to create content' } };
    }
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'PUT') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/content/', '');
    try {
      const updated = await multiDb.updateContent(id, req.body);
      if (!updated) return { status: 404, body: { error: 'Content not found' } };
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update content' } };
    }
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'DELETE') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/content/', '');
    try {
      await multiDb.deleteContent(id);
      return { status: 200, body: { success: true } };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to delete content' } };
    }
  }

  if (path.match(/^\/content\/[^/]+\/status$/) && method === 'PATCH') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[2];
    const { status } = req.body || {};
    try {
      const updated = await multiDb.updateContent(id, { status });
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update status' } };
    }
  }

  if (path.match(/^\/content\/[^/]+\/featured$/) && method === 'PATCH') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[2];
    const { featured } = req.body || {};
    try {
      const updated = await multiDb.updateContent(id, { featured: Boolean(featured) });
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update featured' } };
    }
  }

  // 6. Categories
  if (path === '/categories' && method === 'GET') {
    try {
      const categories = await multiDb.getCategories();
      return { status: 200, body: categories };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to get categories' } };
    }
  }

  if (path === '/categories' && method === 'POST') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const created = await multiDb.createCategory(req.body);
      return { status: 201, body: created };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to create category' } };
    }
  }

  if (path.match(/^\/categories\/[^/]+$/) && method === 'PUT') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/categories/', '');
    try {
      const updated = await multiDb.updateCategory(id, req.body);
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update category' } };
    }
  }

  if (path.match(/^\/categories\/[^/]+$/) && method === 'DELETE') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/categories/', '');
    try {
      await multiDb.deleteCategory(id);
      return { status: 200, body: { success: true } };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to delete category' } };
    }
  }

  // 7. Genres
  if (path === '/genres' && method === 'GET') {
    try {
      const genres = await multiDb.getGenres();
      return { status: 200, body: genres };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to get genres' } };
    }
  }

  if (path === '/genres' && method === 'POST') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const created = await multiDb.createGenre(req.body);
      return { status: 201, body: created };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to create genre' } };
    }
  }

  if (path.match(/^\/genres\/[^/]+$/) && method === 'DELETE') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/genres/', '');
    try {
      await multiDb.deleteGenre(id);
      return { status: 200, body: { success: true } };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to delete genre' } };
    }
  }

  // 8. Tags
  if (path === '/tags' && method === 'GET') {
    try {
      const tags = await multiDb.getTags();
      return { status: 200, body: tags };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to get tags' } };
    }
  }

  if (path === '/tags' && method === 'POST') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const created = await multiDb.createTag(req.body);
      return { status: 201, body: created };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to create tag' } };
    }
  }

  if (path.match(/^\/tags\/[^/]+$/) && method === 'DELETE') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/tags/', '');
    try {
      await multiDb.deleteTag(id);
      return { status: 200, body: { success: true } };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to delete tag' } };
    }
  }

  // 9. Popups
  if (path === '/popups' && method === 'GET') {
    try {
      const popups = await multiDb.getPopups(true);
      return { status: 200, body: popups };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to get popups' } };
    }
  }

  if (path === '/admin/popups' && method === 'GET') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const popups = await multiDb.getPopups(false);
      return { status: 200, body: popups };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to get popups' } };
    }
  }

  if (path === '/admin/popups' && method === 'POST') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    try {
      const created = await multiDb.createPopup(req.body);
      return { status: 201, body: created };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to create popup' } };
    }
  }

  if (path.match(/^\/admin\/popups\/[^/]+$/) && method === 'PUT') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/admin/popups/', '');
    try {
      const updated = await multiDb.updatePopup(id, req.body);
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to update popup' } };
    }
  }

  if (path.match(/^\/admin\/popups\/[^/]+$/) && method === 'DELETE') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/admin/popups/', '');
    try {
      await multiDb.deletePopup(id);
      return { status: 200, body: { success: true } };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to delete popup' } };
    }
  }

  if (path.match(/^\/admin\/popups\/[^/]+\/toggle$/) && method === 'PATCH') {
    const auth = await checkAdminAuth(req, env);
    if (!auth) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[3];
    try {
      const popups = await multiDb.getPopups(false);
      const existing = popups.find(p => p.id === id);
      if (!existing) return { status: 404, body: { error: 'Popup not found' } };
      const updated = await multiDb.updatePopup(id, { active: !existing.active });
      return { status: 200, body: updated };
    } catch (err: any) {
      return { status: 500, body: { error: err.message || 'Failed to toggle popup' } };
    }
  }

  return {
    status: 404,
    body: { error: `Endpoint not found: ${method} ${path}` }
  };
}
