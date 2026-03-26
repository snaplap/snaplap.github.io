---
title: CSS 动画技巧：让界面动起来
date: 2024-02-10
category: 技术
tags: [CSS, 前端, 动画]
description: 总结常用的 CSS 动画技巧，包括过渡效果、关键帧动画和性能优化要点。
---

# CSS 动画技巧

CSS 动画是提升用户体验的重要手段，但用不好反而会适得其反。

## 过渡动画（Transition）

最简单的动画方式：

```css
.button {
  background: #6366f1;
  transition: all 0.2s ease;
}

.button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
```

### 常用缓动函数

| 值 | 描述 |
|---|---|
| `ease` | 默认，先快后慢 |
| `linear` | 匀速 |
| `ease-in` | 由慢到快 |
| `ease-out` | 由快到慢 |
| `cubic-bezier()` | 自定义贝塞尔曲线 |

## 关键帧动画（@keyframes）

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.5s ease forwards;
}
```

## ⚡ 性能优化

**只对这些属性做动画，以触发合成层而非重排：**

- `transform`
- `opacity`
- `filter`

避免动画 `width`、`height`、`top`、`left` 等触发重排的属性。

## 实用技巧

### 错开动画延迟，制造瀑布流入场效果

```css
.list-item:nth-child(1) { animation-delay: 0s; }
.list-item:nth-child(2) { animation-delay: 0.08s; }
.list-item:nth-child(3) { animation-delay: 0.16s; }
```

### 防止 FOUC（内容闪烁）

```css
.animated {
  animation: fadeInUp 0.5s ease both; /* both = forwards + backwards */
}
```

### 减少动画抖动

```css
.will-animate {
  will-change: transform;
  backface-visibility: hidden;
}
```

## 总结

合理使用 CSS 动画可以大幅提升页面的视觉体验：

1. 优先使用 `transform` 和 `opacity`
2. 动画时长通常在 `150ms ~ 500ms` 之间
3. 不要过度动画——克制才是美
