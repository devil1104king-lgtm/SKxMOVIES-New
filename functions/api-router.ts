import { multiDb } from './db/multi-db';
import { signAdminToken, verifyAdminToken } from './auth';

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

function checkAdminAuth(req: ApiRequest): boolean {
  const token = getBearerToken(req);
  if (!token) return false;
  const payload = verifyAdminToken(token);
  return payload !== null;
}

export async function handleApiRequest(req: ApiRequest): Promise<ApiResponse> {
  // Ensure DB initialized
  await multiDb.init();

  const method = req.method.toUpperCase();
  const rawPath = req.path.replace(/^\/api/, '');
  const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;

  // 1. Health check
  if (path === '/health' && method === 'GET') {
    return { status: 200, body: { status: 'ok', time: new Date().toISOString() } };
  }

  // 2. Homepage Bundle (Ultra fast initial load)
  if (path === '/homepage' && method === 'GET') {
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
  }

  // 3. Settings
  if (path === '/settings' && method === 'GET') {
    const settings = await multiDb.getSettings();
    return { status: 200, body: settings };
  }

  if (path === '/settings' && method === 'PUT') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const updated = await multiDb.updateSettings(req.body || {});
    return { status: 200, body: updated };
  }

  // 4. Admin Auth
  if (path === '/admin/login' && method === 'POST') {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return { status: 400, body: { error: 'Email and password required' } };
    }
    const admin = await multiDb.verifyAdmin(email, password);
    if (!admin) {
      return { status: 401, body: { error: 'Invalid admin credentials' } };
    }
    const token = signAdminToken(admin);
    return { status: 200, body: { token, user: admin } };
  }

  if (path === '/admin/me' && method === 'GET') {
    const token = getBearerToken(req);
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) return { status: 401, body: { error: 'Unauthorized' } };
    return { status: 200, body: { user: payload } };
  }

  if (path === '/admin/change-password' && method === 'POST') {
    const token = getBearerToken(req);
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) return { status: 401, body: { error: 'Unauthorized' } };
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return { status: 400, body: { error: 'Password must be at least 6 characters' } };
    }
    await multiDb.changeAdminPassword(payload.userId, newPassword);
    return { status: 200, body: { success: true, message: 'Password updated successfully' } };
  }

  if (path === '/admin/stats' && method === 'GET') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const stats = await multiDb.getStats();
    return { status: 200, body: stats };
  }

  // 5. Content Management
  if (path === '/content' && method === 'GET') {
    const isAdmin = checkAdminAuth(req);
    const params = {
      ...req.query,
      status: isAdmin ? (req.query.status as any || 'all') : 'published'
    };
    const result = await multiDb.getAllContent(params);
    return { status: 200, body: result };
  }

  if (path.startsWith('/content/slug/') && method === 'GET') {
    const slug = path.replace('/content/slug/', '');
    const item = await multiDb.getContentBySlug(slug, true);
    if (!item) return { status: 404, body: { error: 'Content not found' } };
    return { status: 200, body: item };
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'GET') {
    const id = path.replace('/content/', '');
    const item = await multiDb.getContentById(id);
    if (!item) return { status: 404, body: { error: 'Content not found' } };
    return { status: 200, body: item };
  }

  if (path === '/content' && method === 'POST') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const created = await multiDb.createContent(req.body);
    return { status: 201, body: created };
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'PUT') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/content/', '');
    const updated = await multiDb.updateContent(id, req.body);
    if (!updated) return { status: 404, body: { error: 'Content not found' } };
    return { status: 200, body: updated };
  }

  if (path.match(/^\/content\/[^/]+$/) && method === 'DELETE') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/content/', '');
    await multiDb.deleteContent(id);
    return { status: 200, body: { success: true } };
  }

  if (path.match(/^\/content\/[^/]+\/status$/) && method === 'PATCH') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[2];
    const { status } = req.body || {};
    const updated = await multiDb.updateContent(id, { status });
    return { status: 200, body: updated };
  }

  if (path.match(/^\/content\/[^/]+\/featured$/) && method === 'PATCH') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[2];
    const { featured } = req.body || {};
    const updated = await multiDb.updateContent(id, { featured: Boolean(featured) });
    return { status: 200, body: updated };
  }

  // 6. Categories
  if (path === '/categories' && method === 'GET') {
    const categories = await multiDb.getCategories();
    return { status: 200, body: categories };
  }

  if (path === '/categories' && method === 'POST') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const created = await multiDb.createCategory(req.body);
    return { status: 201, body: created };
  }

  if (path.match(/^\/categories\/[^/]+$/) && method === 'PUT') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/categories/', '');
    const updated = await multiDb.updateCategory(id, req.body);
    return { status: 200, body: updated };
  }

  if (path.match(/^\/categories\/[^/]+$/) && method === 'DELETE') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/categories/', '');
    await multiDb.deleteCategory(id);
    return { status: 200, body: { success: true } };
  }

  // 7. Genres
  if (path === '/genres' && method === 'GET') {
    const genres = await multiDb.getGenres();
    return { status: 200, body: genres };
  }

  if (path === '/genres' && method === 'POST') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const created = await multiDb.createGenre(req.body);
    return { status: 201, body: created };
  }

  if (path.match(/^\/genres\/[^/]+$/) && method === 'DELETE') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/genres/', '');
    await multiDb.deleteGenre(id);
    return { status: 200, body: { success: true } };
  }

  // 8. Tags
  if (path === '/tags' && method === 'GET') {
    const tags = await multiDb.getTags();
    return { status: 200, body: tags };
  }

  if (path === '/tags' && method === 'POST') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const created = await multiDb.createTag(req.body);
    return { status: 201, body: created };
  }

  if (path.match(/^\/tags\/[^/]+$/) && method === 'DELETE') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/tags/', '');
    await multiDb.deleteTag(id);
    return { status: 200, body: { success: true } };
  }

  // 9. Popups
  if (path === '/popups' && method === 'GET') {
    const popups = await multiDb.getPopups(true);
    return { status: 200, body: popups };
  }

  if (path === '/admin/popups' && method === 'GET') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const popups = await multiDb.getPopups(false);
    return { status: 200, body: popups };
  }

  if (path === '/admin/popups' && method === 'POST') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const created = await multiDb.createPopup(req.body);
    return { status: 201, body: created };
  }

  if (path.match(/^\/admin\/popups\/[^/]+$/) && method === 'PUT') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/admin/popups/', '');
    const updated = await multiDb.updatePopup(id, req.body);
    return { status: 200, body: updated };
  }

  if (path.match(/^\/admin\/popups\/[^/]+$/) && method === 'DELETE') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.replace('/admin/popups/', '');
    await multiDb.deletePopup(id);
    return { status: 200, body: { success: true } };
  }

  if (path.match(/^\/admin\/popups\/[^/]+\/toggle$/) && method === 'PATCH') {
    if (!checkAdminAuth(req)) return { status: 401, body: { error: 'Unauthorized' } };
    const id = path.split('/')[3];
    const existing = (await multiDb.getPopups(false)).find(p => p.id === id);
    if (!existing) return { status: 404, body: { error: 'Popup not found' } };
    const updated = await multiDb.updatePopup(id, { active: !existing.active });
    return { status: 200, body: updated };
  }

  return {
    status: 404,
    body: { error: `Endpoint not found: ${method} ${path}` }
  };
}
