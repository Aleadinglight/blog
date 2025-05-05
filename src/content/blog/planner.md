---
title: 'Markdown Style Guide'
description: 'Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.'
pubDate: 'Jun 19 2024'
heroImage: '/blog-placeholder-1.jpg'
tags: 
  - guide
  - astro
---
## Layouts
The original motivation for the creation of Bloom filters is efficient set membership, using a probabilistic approach to significantly reduce the time and space required to reject items that are not members in a certain set.

The data structure was proposed by Burton Bloom in a 1970 paper titled "Space/Time Trade-offs in Hash Coding with Allowable Errors". It's a good paper that's worth reading.

### Base
- Contains Header, Footer and Navbar
- Used by index page, blog list, blog posts page,... 

### Blog Post
- Inherit from Base Layout
- Display the content of blog. Have a side navigation/ description table.
- Used by blog page.