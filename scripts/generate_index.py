#!/usr/bin/env python3
"""
scripts/generate_index.py
Scan posts/*.md, parse YAML frontmatter, and write posts/index.json.
Run locally or via GitHub Actions after committing new markdown files.
"""

import json
import os
import re
from pathlib import Path


# ── helpers ────────────────────────────────────────────────────────────────

def parse_frontmatter(content: str) -> dict:
    """Return a dict of frontmatter fields, or {} if none found."""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not m:
        return {}
    fm: dict = {}
    for line in m.group(1).splitlines():
        if ':' not in line:
            continue
        key, _, value = line.partition(':')
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        # Simple array: [a, b, c]
        if value.startswith('[') and value.endswith(']'):
            value = [v.strip().strip('\'"') for v in value[1:-1].split(',') if v.strip()]
        elif value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        fm[key] = value
    return fm


def make_slug(filename: str) -> str:
    """Turn a filename stem into a URL-safe slug."""
    name = Path(filename).stem
    slug = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fff]+', '-', name)
    return slug.strip('-').lower()


def get_excerpt(content: str, max_len: int = 200) -> str:
    """Return a plain-text excerpt from markdown content."""
    # Strip frontmatter
    text = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
    # Strip markdown headings / formatting
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'!\[[^\]]*\]\([^\)]+\)', '', text)
    text = re.sub(r'\n+', ' ', text).strip()
    if len(text) > max_len:
        # Break at word boundary
        cut = text[:max_len].rsplit(' ', 1)[0]
        return cut + '…'
    return text


# ── main ────────────────────────────────────────────────────────────────────

def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    posts_dir = repo_root / 'posts'
    posts_dir.mkdir(exist_ok=True)

    posts = []
    for md_file in sorted(posts_dir.glob('*.md')):
        content = md_file.read_text(encoding='utf-8')
        fm = parse_frontmatter(content)

        title = fm.get('title') or md_file.stem.replace('-', ' ').title()
        slug  = fm.get('slug') or make_slug(md_file.name)
        desc  = fm.get('description') or get_excerpt(content)
        date  = fm.get('date') or '1970-01-01'
        cat   = fm.get('category') or '未分类'
        tags  = fm.get('tags') or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',') if t.strip()]

        posts.append({
            'file':        md_file.name,
            'slug':        slug,
            'title':       title,
            'date':        str(date),
            'category':    cat,
            'tags':        tags,
            'description': desc,
        })

    # Sort newest first
    posts.sort(key=lambda p: p['date'], reverse=True)

    out = posts_dir / 'index.json'
    out.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ Generated {out} with {len(posts)} post(s)')


if __name__ == '__main__':
    main()
