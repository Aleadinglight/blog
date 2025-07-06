---
title: 'Quick tips and tricks for Typescript'
description: 'Boost your productivity when working with Typescript'
pubDate: 'Jun 19 2024'
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
Sometimes the compilers
```typescript
// I want to see this error
  catch (error) {
    // this will fail with error below
    // "(local var) error: unknown" "Type 'string' has no properties in common with type 'bla bla'."
    console.log(error); 
}
```

## I fixed the error but the error message doesn't go away (with Eslint)
This is a very common case, mostly with missing packages. For example, you have installed the missing package but Eslint still shows the error? In this case, you need to restart the TS Server.

`image-here`

## Mismatch Typescript version
If you update your TypeScript versions, or switching between projects that use different versions of TypeScript while working, this error might show up. To fix this, you need to open the Command Palette (`Ctrl+Shift+P` on Windows, or `⌘+Shift+P` on a Mac) and type "Select TypeScript Version". 


## Dependencies import
