// src/services/newsService.js
import { MOCK_NEWS_RESPONSE } from '../mocks/newsMock';

const USE_MOCK_DATA = true; // Toggle this to switch between Mock and Real API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'; // Adjust env var as needed
const API_PATH = '/api/news';

// --- Normalization Logic (The "Resolve" function from legacy) ---
function resolve(item, path) {
  if (!item) return undefined;
  if (item[path] !== undefined) return item[path];
  if (item.attributes && item.attributes[path] !== undefined) return item.attributes[path];
  
  // Handle nested paths like 'cover_picture.url'
  if (path.includes('.')) {
    const parts = path.split('.');
    const first = parts[0];
    const rest = parts.slice(1);
    const candidate = item[first] ?? item.attributes?.[first] ?? item[first]?.data ?? item.attributes?.[first]?.data;
    if (candidate) {
      const attrs = candidate.attributes ?? (candidate.data ? candidate.data.attributes : undefined) ?? candidate;
      return rest.reduce((acc, k) => acc?.[k], attrs);
    }
  }
  return undefined;
}

// Convert raw API item to clean React prop object
function normalizeNewsItem(item) {
  const id = item.id ?? item.documentId ?? resolve(item, 'id');
  const title = resolve(item, 'title') ?? resolve(item, 'headline') ?? 'Untitled';
  
  // Date logic
  const dateStr = resolve(item, 'date') ?? resolve(item, 'published_at') ?? resolve(item, 'createdAt');
  const dateObj = new Date(dateStr);
  const formattedDate = isNaN(dateObj.getTime()) 
    ? '—' 
    : dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // Excerpt logic
  const rawExcerpt = resolve(item, 'description') ?? resolve(item, 'excerpt') ?? resolve(item, 'summary') ?? resolve(item, 'content');
  const cleanExcerpt = typeof rawExcerpt === 'string' ? rawExcerpt.replace(/\s+/g, ' ').trim() : '';
  const excerpt = cleanExcerpt.length > 160 ? cleanExcerpt.slice(0, 157) + '…' : cleanExcerpt;

  // Image logic
  let imgUrl = resolve(item, 'cover_picture.url') ?? resolve(item, 'cover_picture.data.attributes.url');
  if (imgUrl && imgUrl.startsWith('/')) imgUrl = `${BASE_URL}${imgUrl}`;
  if (!imgUrl) imgUrl = 'https://placehold.co/600x400?text=No+Image';

  return {
    id,
    title,
    date: formattedDate,
    excerpt,
    imageUrl: imgUrl,
    link: `/news/${id}` // internal routing link
  };
}

// --- Fetch Logic ---
export const newsService = {
  async fetchNews({ page = 1, limit = 8, title = '' }) {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 500));
      
      // Basic mock filtering
      let data = MOCK_NEWS_RESPONSE.data;
      if (title) {
        data = data.filter(item => {
           const t = (item.attributes.title || '').toLowerCase();
           return t.includes(title.toLowerCase());
        });
      }
      
      return {
        items: data.map(normalizeNewsItem),
        meta: MOCK_NEWS_RESPONSE.meta.pagination
      };
    }

    // Real API Call
    const qs = new URLSearchParams();
    qs.set('pagination[page]', page);
    qs.set('pagination[pageSize]', limit);
    if (title) qs.set('filters[title][$contains]', title); // Adjust filter syntax to your specific Strapi version
    
    // Note: Legacy code used 'mode=list' or 'mode=searching'. 
    // Modern REST APIs usually just take params. I implemented standard query params above.
    // If you strictly need the legacy format:
    // qs.set('mode', title ? 'searching' : 'list');
    // if (title) qs.set('title', title);
    // qs.set('limit', limit);
    // qs.set('page', page);

    const res = await fetch(`${BASE_URL}${API_PATH}?${qs.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const payload = await res.json();
    const rawItems = Array.isArray(payload) ? payload : (payload.data || []);
    
    return {
      items: rawItems.map(normalizeNewsItem),
      meta: payload.meta?.pagination || { page: 1, pageCount: 1, total: rawItems.length }
    };
  }
};