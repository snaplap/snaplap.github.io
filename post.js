/* ─────────────────────────────────────────────
   post.js  — post detail page logic
───────────────────────────────────────────── */

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
  if (c.logo)  document.getElementById('logo-icon').textContent = c.logo;
  if (c.title) document.getElementById('logo-text').textContent = c.title;
})();

// ── Post page ─────────────────────────────────
class PostPage {
  async init() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) return this.showError('文章未找到');

    try {
      const indexRes = await fetch('posts/index.json');
      if (!indexRes.ok) throw new Error('index not found');
      const posts = await indexRes.json();
      const post = posts.find(p => p.slug === slug);
      if (!post) return this.showError('文章未找到');

      const mdRes = await fetch(`posts/${post.file}`);
      if (!mdRes.ok) throw new Error('markdown not found');
      const raw = await mdRes.text();
      const body = this.stripFrontmatter(raw);

      document.title = `${post.title} — ${
        typeof BLOG_CONFIG !== 'undefined' ? BLOG_CONFIG.title : '个人博客'
      }`;
      this.render(post, body);
      this.buildToc();
    } catch (err) {
      console.error(err);
      this.showError('加载文章失败，请稍后重试');
    }
  }

  stripFrontmatter(raw) {
    return raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  }

  render(post, body) {
    // Configure marked with highlight.js
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
    });

    const html = marked.parse(body);
    const cat = post.category || '未分类';
    const color = categoryColor(cat);
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const readTime = Math.max(1, Math.ceil(body.split(/\s+/).length / 300));

    const tagsHtml = tags.length
      ? `<div class="post-header-tags">${tags.map(t =>
          `<span class="post-header-tag">#${escapeHtml(t)}</span>`).join('')}</div>`
      : '';

    document.getElementById('post-article').innerHTML = `
      <header class="post-header">
        <div class="post-breadcrumb">
          <a href="index.html">首页</a>
          <span>›</span>
          <span>${escapeHtml(cat)}</span>
          <span>›</span>
          <span>${escapeHtml(post.title)}</span>
        </div>
        <div class="post-meta-row">
          <span class="post-category" style="background:${color.bg};color:${color.text}">${escapeHtml(cat)}</span>
          <span class="post-meta-item">📅 ${formatDate(post.date)}</span>
          <span class="post-meta-item">⏱ 约 ${readTime} 分钟阅读</span>
        </div>
        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        ${post.description ? `<p class="post-description">${escapeHtml(post.description)}</p>` : ''}
        ${tagsHtml}
      </header>
      <div class="post-content" id="post-content">${html}</div>
      <div class="post-nav">
        <a href="index.html" class="post-nav-btn">← 返回首页</a>
      </div>`;

    // Re-run highlight.js on rendered blocks (fallback)
    document.querySelectorAll('#post-content pre code').forEach(block => {
      if (!block.dataset.highlighted) hljs.highlightElement(block);
    });
  }

  buildToc() {
    const headings = document.querySelectorAll('#post-content h1, #post-content h2, #post-content h3');
    if (headings.length < 2) {
      document.getElementById('post-toc').style.display = 'none';
      return;
    }

    const nav = document.getElementById('toc-nav');
    const items = [];

    headings.forEach((h, i) => {
      const id = `h-${i}`;
      h.id = id;
      items.push({ id, text: h.textContent, level: parseInt(h.tagName[1]) });
    });

    nav.innerHTML = items.map(({ id, text, level }) =>
      `<a href="#${id}" class="toc-item toc-level-${level}">${escapeHtml(text)}</a>`
    ).join('');

    // Highlight active heading on scroll
    const tocLinks = nav.querySelectorAll('.toc-item');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const active = nav.querySelector(`[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-15% 0% -70% 0%' });

    headings.forEach(h => observer.observe(h));
  }

  showError(msg) {
    document.getElementById('post-article').innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">😅</span>
        <p>${escapeHtml(msg)}</p>
        <br/>
        <a href="index.html" style="color:var(--accent);font-weight:500">← 返回首页</a>
      </div>`;
    document.getElementById('post-toc').style.display = 'none';
  }
}

new PostPage().init();
