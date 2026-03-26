/* ─────────────────────────────────────────────
   app.js  — homepage logic
───────────────────────────────────────────── */

// Category color palette — assigned by hash so the same category always gets the same color
const PALETTE = [
  { bg: '#eef2ff', text: '#6366f1' },
  { bg: '#fdf4ff', text: '#a855f7' },
  { bg: '#fff7ed', text: '#f97316' },
  { bg: '#f0fdf4', text: '#16a34a' },
  { bg: '#eff6ff', text: '#3b82f6' },
  { bg: '#fff1f2', text: '#f43f5e' },
  { bg: '#f0fdfa', text: '#0d9488' },
  { bg: '#fefce8', text: '#ca8a04' },
];

function categoryColor(name) {
  const h = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[h % PALETTE.length];
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Apply config ──────────────────────────────
(function applyConfig() {
  if (typeof BLOG_CONFIG === 'undefined') return;
  const c = BLOG_CONFIG;
  if (c.logo)     document.getElementById('logo-icon').textContent = c.logo;
  if (c.title)    document.getElementById('logo-text').textContent = c.title;
  if (c.title)    document.title = c.title;
  if (c.subtitle) document.getElementById('hero-desc').textContent = c.subtitle;
  if (c.about)    document.getElementById('sidebar-about').textContent = c.about;
  if (c.title)    document.getElementById('hero-title').innerHTML =
    `Welcome, 我是<span style="color:var(--accent)">${escapeHtml(c.author || c.title)}</span> 👋`;
})();

// ── Blog class ────────────────────────────────
class Blog {
  constructor() {
    this.posts = [];
    this.currentCategory = 'all';
    this.init();
  }

  async init() {
    await this.loadPosts();
    this.renderSidebar();
    this.renderFilterBar();
    this.renderPosts('all');
    this.bindEvents();
  }

  async loadPosts() {
    try {
      const res = await fetch('posts/index.json');
      if (!res.ok) throw new Error('fetch failed');
      this.posts = await res.json();
      this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
      this.posts = [];
    }
  }

  // Group posts by category
  getCategories() {
    const map = {};
    this.posts.forEach(p => {
      const c = p.category || '未分类';
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }

  // ── Render helpers ────────────────────────
  renderFilterBar() {
    const bar = document.getElementById('filter-bar');
    // clear existing dynamic buttons
    bar.querySelectorAll('[data-category]:not([data-category="all"])').forEach(b => b.remove());

    const cats = this.getCategories();
    Object.entries(cats).forEach(([cat]) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat;
      btn.textContent = cat;
      bar.appendChild(btn);
    });
  }

  renderSidebar() {
    const cats = this.getCategories();

    // Stats
    const statsEl = document.getElementById('sidebar-stats');
    statsEl.innerHTML = `
      <div class="sidebar-stat"><span>文章总数</span><strong>${this.posts.length}</strong></div>
      <div class="sidebar-stat"><span>分类数</span><strong>${Object.keys(cats).length}</strong></div>
    `;

    // Category list
    const list = document.getElementById('category-list');
    list.innerHTML = '';

    const allLi = this.makeCategoryItem('all', '全部', this.posts.length, true);
    list.appendChild(allLi);

    // Sort categories by count descending
    Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        list.appendChild(this.makeCategoryItem(cat, cat, count, false));
      });
  }

  makeCategoryItem(value, label, count, active) {
    const li = document.createElement('li');
    li.className = 'category-item' + (active ? ' active' : '');
    li.dataset.category = value;
    li.innerHTML = `<span>${escapeHtml(label)}</span><span class="category-count">${count}</span>`;
    return li;
  }

  renderPosts(category) {
    const grid = document.getElementById('posts-grid');
    const list = category === 'all'
      ? this.posts
      : this.posts.filter(p => (p.category || '未分类') === category);

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state">
        <span class="empty-state-icon">📝</span>
        <p>${category === 'all' ? '暂无文章，快去写第一篇吧！' : `「${escapeHtml(category)}」分类下暂无文章`}</p>
      </div>`;
      return;
    }

    grid.innerHTML = list.map((post, i) => this.cardHtml(post, i)).join('');
  }

  cardHtml(post, index) {
    const delay = (Math.min(index, 6) * 0.07).toFixed(2);
    const cat = post.category || '未分类';
    const color = categoryColor(cat);
    const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];
    const tagsHtml = tags.map(t =>
      `<span class="post-tag">#${escapeHtml(t)}</span>`
    ).join('');

    return `
      <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="post-card" style="animation-delay:${delay}s">
        <div class="post-card-meta">
          <span class="post-category" style="background:${color.bg};color:${color.text}">${escapeHtml(cat)}</span>
          <span class="post-date">📅 ${formatDate(post.date)}</span>
        </div>
        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
        <p class="post-card-excerpt">${escapeHtml(post.description || '')}</p>
        <div class="post-card-footer">
          <div class="post-tags">${tagsHtml}</div>
          <span class="read-more">阅读全文 →</span>
        </div>
      </a>`;
  }

  // ── Events ───────────────────────────────
  bindEvents() {
    document.getElementById('filter-bar').addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (btn) this.switchCategory(btn.dataset.category);
    });

    document.getElementById('category-list').addEventListener('click', e => {
      const item = e.target.closest('.category-item');
      if (item) this.switchCategory(item.dataset.category);
    });
  }

  switchCategory(cat) {
    if (cat === this.currentCategory) return;
    this.currentCategory = cat;

    // Update active states
    document.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.category === cat));
    document.querySelectorAll('.category-item').forEach(i =>
      i.classList.toggle('active', i.dataset.category === cat));

    // Fade-swap the grid
    const grid = document.getElementById('posts-grid');
    grid.classList.add('fading');
    setTimeout(() => {
      this.renderPosts(cat);
      grid.classList.remove('fading');
    }, 220);
  }
}

new Blog();
