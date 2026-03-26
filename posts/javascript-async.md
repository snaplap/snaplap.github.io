---
title: JavaScript 异步编程：从回调到 async/await
date: 2024-03-05
category: 技术
tags: [JavaScript, 异步, Promise]
description: 从回调函数到 Promise，再到 async/await，梳理 JavaScript 异步编程的演进历程与最佳实践。
---

# JavaScript 异步编程

JavaScript 是单线程语言，异步编程是其核心特性之一。

## 回调函数时代

```javascript
// 经典的回调地狱
fetchUser(userId, function(err, user) {
  if (err) return handleError(err);
  fetchPosts(user.id, function(err, posts) {
    if (err) return handleError(err);
    renderPosts(posts, function(err) {
      if (err) return handleError(err);
      console.log('Done!');
    });
  });
});
```

层层嵌套，可读性极差 😩

## Promise 的出现

```javascript
fetchUser(userId)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .then(() => console.log('Done!'))
  .catch(err => handleError(err));
```

链式调用，清晰多了！

## async/await：让异步像同步

```javascript
async function loadUserPosts(userId) {
  try {
    const user  = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    await renderPosts(posts);
    console.log('Done!');
  } catch (err) {
    handleError(err);
  }
}
```

看起来就像同步代码，但底层依然是异步的。

## 并发执行

当多个异步操作**互不依赖**时，并发执行可以大幅节省时间：

```javascript
// ❌ 串行：总时间 = t1 + t2 + t3
const user          = await fetchUser(id);
const settings      = await fetchSettings(id);
const notifications = await fetchNotifications(id);

// ✅ 并行：总时间 = max(t1, t2, t3)
const [user, settings, notifications] = await Promise.all([
  fetchUser(id),
  fetchSettings(id),
  fetchNotifications(id),
]);
```

## 错误处理最佳实践

```javascript
// 包装函数：统一返回 [error, data]
async function safe(fn) {
  try {
    return [null, await fn()];
  } catch (err) {
    return [err, null];
  }
}

const [err, data] = await safe(() => fetchUser(id));
if (err) {
  // 处理错误
}
```

## 总结

- 用 `async/await` 写异步代码，更直观
- 多个独立操作用 `Promise.all` 并发
- 统一错误处理，避免遗漏
- 避免在 `forEach` 中直接 `await`，应用 `for...of` 或 `Promise.all`
