---
title: 'Adding Pagefind Search to My Astro Blog'
description: "A simple guide to implementing static site search with Pagefind"
pubDate: '2025-01-15'
heroImage: ''
tags: ['blog', 'search', 'astro']
---

## Why Pagefind?
Static sites need search functionality, but traditional search solutions require server-side processing. [Pagefind](https://pagefind.app/) solves this by generating a static search index that works entirely on the client side - perfect for Astro blogs.

## Installing Pagefind
The easiest way to add Pagefind to Astro is using the official integration:

```bash
npm install astro-pagefind
```

## Configuration
Update your `astro.config.mjs` to include the Pagefind integration:

```js
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://yourdomain.com',
  base: '/blog/',
  integrations: [
    pagefind()
  ],
});
```

## Creating the Search Component
Create a search component that uses Pagefind's UI:

```astro title="src/components/Search.astro"
---
import SearchComponent from "astro-pagefind/components/Search";
---

<SearchComponent 
  id="search" 
  className="pagefind-ui" 
  uiOptions={{ 
    showImages: false,
    bundlePath: "/blog/pagefind/",
    processResult: (result: any) => {
      // Fix URLs to include the base path
      if (result.url && !result.url.startsWith('/blog')) {
        result.url = '/blog' + result.url;
      }
      return result;
    },
    translations: {
      placeholder: "Search posts...",
      clear_search: "Clear",
      load_more: "Load more results",
      search_result_label: "Search results for",
      filters_label: "Filters",
      zero_results: "No results for [SEARCH_TERM]",
      many_results: "[COUNT] results for [SEARCH_TERM]",
      one_result: "[COUNT] result for [SEARCH_TERM]",
      alt_search: "No results for [SEARCH_TERM]. Showing results for [DIFFERENT_TERM] instead",
      search_suggestion: "No results for [SEARCH_TERM]. Try one of the following searches:",
      searching: "Searching for [SEARCH_TERM]...",
    }
  }} 
/>
```

## Adding Modal Search to Homepage
Instead of a dedicated search page, I added a modal search to the homepage:

```astro title="src/pages/index.astro"
<!-- Search bar that opens modal -->
<div class="w-full flex justify-center mb-8 px-4">
  <button
    id="search-trigger"
    class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <input
      type="text"
      placeholder="Search posts..."
      class="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base min-w-0 cursor-pointer"
      readonly
    />
    <div class="p-2 text-gray-600 flex items-center justify-center">
      <Search size={18} stroke-width={2} />
    </div>
  </button>
</div>

<!-- Search Modal -->
<div id="search-modal" class="fixed inset-0 backdrop-blur-sm bg-white/30 hidden z-50">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200">
      <div class="flex items-center justify-between px-4 py-2">
        <h2 class="text-xl font-semibold text-gray-800">Search Posts</h2>
        <button id="close-search" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      <div class="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
        <SearchComponent />
      </div>
    </div>
  </div>
</div>
```

## Modal JavaScript
Add this script to handle the modal functionality:

```js
// Modal functionality
const searchTrigger = document.getElementById('search-trigger');
const searchModal = document.getElementById('search-modal');
const closeSearch = document.getElementById('close-search');

searchTrigger?.addEventListener('click', () => {
  searchModal?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
});

closeSearch?.addEventListener('click', () => {
  searchModal?.classList.add('hidden');
  document.body.style.overflow = '';
});

// Close modal when clicking outside
searchModal?.addEventListener('click', (e) => {
  if (e.target === searchModal) {
    searchModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !searchModal?.classList.contains('hidden')) {
    searchModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }
});
```

## Key Benefits
- **Static**: No server-side processing required
- **Fast**: Search happens entirely in the browser
- **Mobile-friendly**: Modal works great on all devices
- **Customizable**: Easy to style and configure
- **Accessible**: Keyboard navigation and screen reader support

The search now works seamlessly across all devices, providing a modern search experience without any backend complexity. 