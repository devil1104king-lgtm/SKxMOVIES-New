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
  AdminUser
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('skx_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Public
  getHomepage: () => request<{
    featured: ContentItem[];
    trending: ContentItem[];
    latest: ContentItem[];
    categories: Category[];
    genres: Genre[];
    settings: SiteSettings;
    popups: Popup[];
  }>('/homepage'),

  getSettings: () => request<SiteSettings>('/settings'),
  updateSettings: (data: Partial<SiteSettings>) =>
    request<SiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  getContent: (params: SearchFilterParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const qs = searchParams.toString();
    return request<PaginatedResult<ContentItem>>(`/content${qs ? `?${qs}` : ''}`);
  },

  getContentBySlug: (slug: string) => request<ContentItem>(`/content/slug/${encodeURIComponent(slug)}`),
  getContentById: (id: string) => request<ContentItem>(`/content/${id}`),

  createContent: (data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>) =>
    request<ContentItem>('/content', { method: 'POST', body: JSON.stringify(data) }),

  updateContent: (id: string, data: Partial<ContentItem>) =>
    request<ContentItem>(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteContent: (id: string) =>
    request<{ success: boolean }>(`/content/${id}`, { method: 'DELETE' }),

  toggleContentStatus: (id: string, status: 'published' | 'draft') =>
    request<ContentItem>(`/content/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  toggleContentFeatured: (id: string, featured: boolean) =>
    request<ContentItem>(`/content/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Omit<Category, 'id' | 'createdAt'>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Genres
  getGenres: () => request<Genre[]>('/genres'),
  createGenre: (data: Omit<Genre, 'id' | 'createdAt'>) =>
    request<Genre>('/genres', { method: 'POST', body: JSON.stringify(data) }),
  deleteGenre: (id: string) =>
    request<{ success: boolean }>(`/genres/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request<Tag[]>('/tags'),
  createTag: (data: Omit<Tag, 'id' | 'createdAt'>) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify(data) }),
  deleteTag: (id: string) =>
    request<{ success: boolean }>(`/tags/${id}`, { method: 'DELETE' }),

  // Popups
  getPopups: () => request<Popup[]>('/popups'),
  getAdminPopups: () => request<Popup[]>('/admin/popups'),
  createPopup: (data: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Popup>('/admin/popups', { method: 'POST', body: JSON.stringify(data) }),
  updatePopup: (id: string, data: Partial<Popup>) =>
    request<Popup>(`/admin/popups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePopup: (id: string) =>
    request<{ success: boolean }>(`/admin/popups/${id}`, { method: 'DELETE' }),
  togglePopup: (id: string) =>
    request<Popup>(`/admin/popups/${id}/toggle`, { method: 'PATCH' }),

  // Auth & Admin
  adminLogin: (email: string, passwordPlain: string) =>
    request<{ token: string; user: AdminUser }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain })
    }),

  adminMe: () => request<{ user: AdminUser }>('/admin/me'),
  adminChangePassword: (newPassword: string) =>
    request<{ success: boolean; message: string }>('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    }),

  adminStats: () => request<AdminStats>('/admin/stats')
};
