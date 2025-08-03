---
title: 'Quick tips and tricks for Typescript'
description: 'Boost your productivity when working with Typescript'
pubDate: '2025-06-01'
heroImage: '/blog-placeholder-1.jpg'
tags: ['coding','typescript']
---

Typescript is a good, it's nice. It helps with a lot of problems. Your codes are organized and are much more pleasant to read. It reduces the errors (and potentially the future error). It is well-known, well-behaved, updated regularly and is backed by the giants. 

But there are downsides to this. Sometimes it's just a pain to work with. For example, the compiler keeps stucking it beek into your developing process with annoying errors. The configs file is mythical forest. It's hard to get a fast prototype, and sometimes you have to make extra steps just to run a few simple lines of codes. Then you end up trying to solve complex puzzles, instead of working on your new unicorn startup idea. 

This guide is supposed to ease out the most common issues.

## When you want to test something real quick
The fun of scripting lies in its ability to run whatever you want without requiring a complex compiler set up. Typescript taks away the fun in that, however, we can get around this buy using [tsx](https://www.npmjs.com/package/tsx)

```shell
$ npx tsx your-file.ts

Need to install the following packages:
tsx@4.20.3
Ok to proceed? (y) y
```

Just run this in your terminal. On the first time, `npm` will prompt you to install the package. 

## Type casting errors
Sometimes the compiler doesn't know what type your variable is, especially in catch blocks or when working with external APIs:

```typescript
  // Common error scenario
  try {
    // some code that might fail
  } catch (error) {
    // This will fail with: "(local var) error: unknown"
    console.log(error.message); // Property 'message' does not exist on type 'unknown'
  }
```
Quick fixes:

```typescript 
  // Option 1: Type assertion (use carefully)
  catch (error) {
    console.log((error as Error).message);
  }

  // Option 2: Type guard (safer)
  catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }

  // Option 3: Unknown handling
  catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
  }
```

## I fixed the error but the error message doesn't go away (with Eslint)
This is a very common case, mostly with missing packages. For example, you have installed the missing package but Eslint still shows the error? In this case, you need to restart the TS Server.

**Steps:**
- Open Command Palette (`Ctrl+Shift+P` or `⌘+Shift+P`)
- Type "TypeScript: Restart TS Server"
- Press `Enter`

This forces VS Code to reload TypeScript and pick up any new packages or configuration changes.

## Mismatch Typescript version
If you update your TypeScript versions, or switching between projects that use different versions of TypeScript while working, this error might show up. To fix this, you need to open the Command Palette (`Ctrl+Shift+P` on Windows, or `⌘+Shift+P` on a Mac) and type "Select TypeScript Version". 

Choose between:

Use VS Code's Version: Uses the globally installed TypeScript
Use Workspace Version: Uses the TypeScript installed in your project's node_modules

Always prefer the workspace version to match your project's requirements.

## Dependencies import issues
When importing packages, you might encounter these common problems:


```typescript
// Wrong - if package doesn't have default export
import moment from 'moment';

// Correct - use named import or require syntax
import * as moment from 'moment';
// or
const moment = require('moment');
```

## Quick type definitions for third-party libraries
When a package doesn't have TypeScript definitions, create a quick declaration file:
Create `types/index.d.ts` in your project:
```typescript
// For packages without types
declare module 'some-package' {
  export function someFunction(param: string): void;
}

// For packages with any type
declare module 'legacy-package' {
  const content: any;
  export default content;
}
```

## Skip type checking for rapid prototyping
Sometimes you just want to move fast and ignore TypeScript temporarily:
```typescript
// @ts-nocheck at the top of file
// @ts-ignore for single lines
const result = someComplexFunction(); // @ts-ignore


// or use "any"
const data: any = await fetchFromAPI();
// Later, when you have time, properly type it
```

## Conclusion
TypeScript doesn't have to slow you down. These quick fixes handle the most common frustrations developers face. It's fine to use some tricks during rapid prototyping if it improves your productivity. Just make sure to come back and properly type things before shipping to production.

The key is finding the balance between type safety and development speed that works for your project.