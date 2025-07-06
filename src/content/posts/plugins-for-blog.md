---
title: 'Improving My Blog Interface With Some Cool Markdown Plugins'
description: "A guide to the plugins that transformed my blog's functionality and appearance"
pubDate: '2025-07-06'
heroImage: ''
tags: ['blog', 'markdown']
---

## Adding Math Support
Mathematical expressions are crucial for technical writing. Fortunately, adding LaTeX-style math to an Astro blog is surprisingly simple using [remark-math](https://remark.js.org/) and [rehype-katex](https://github.com/remarkjs/remark-math).

```bash
npm install rehype-katex remark-math
```

Update the  `astro.config.mjs` to include the math plugins:

```js
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  markdown: {
    // ...
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
```
Add this line to the `.css` file
```css
.katex-html {
  @apply hidden;
}
```

Once you've set it up, can you write mathematical expressions directly in your markdown:
```md title="example.md"
// Example math expression
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$
```
will be rendered as 
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

The setup integrates seamlessly with Tailwind Typography, making mathematical content both readable and aesthetically pleasing.

## Better Code Highlighter
Astro's built-in [Shiki](https://shiki.style/) highlighter is solid, but for complex code examples like terminal sessions, [Expressive Code](https://expressive-code.com/) provides better control and styling options

```bash
npx astro add astro-expressive-code
```

This opens up some new options for us. For example, we can add labels to sections of code blocks `bash {"output":2-8}`:
```bash {"output":2-8}
npm run dev

> astro-blog@0.0.1 dev
> astro dev

16:46:30 [types] Generated 1ms
16:46:30 [content] Syncing content
16:46:30 [content] Synced content
```

Line markers are also easy to add, for example using this config `js title="line-markers.js" del={2} ins={3-4} {6}`

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
  console.log('this line is marked as deleted')
  // This line and the next one are marked as inserted
  console.log('this is the second inserted line')

  return 'this line uses the neutral default marker type'
}
```