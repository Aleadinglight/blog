// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://aleadinglight.github.io',
  base: '/blog',
  integrations: [mdx(), sitemap()],
  
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'one-light', // Optional: add light mode support
        dark: 'github-dark'  // Optional: add dark mode support
      },
      defaultColor: 'light',
      wrap: true
    }
  },

  vite: {
    plugins: [tailwindcss()],
  },
});