---
title: 'Building a blog using Astro'
description: 'Exploring static website generator'
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

### Code block
```go
// New creates a new BloomFilter with capacity m, using k hash functions.
// You can calculate m and k from the number of elements you expect the
// filter to hold and the desired error rate using CalculateParams.
func New(m uint64, k uint64) *BloomFilter {
  return &BloomFilter{
    m:      m,
    k:      k,
    bitset: newBitset(m),
    seed1:  maphash.MakeSeed(),
    seed2:  maphash.MakeSeed(),
  }
}

type BloomFilter struct {
  m      uint64
  k      uint64
  bitset []uint64

  // seeds for the double hashing scheme.
  seed1, seed2 maphash.Seed
}
```

```js
// Results below assume UTC timezone - your results may vary

// Specify default date formatting for language (locale)
console.log(new Intl.DateTimeFormat("en-US").format(date));
// Expected output: "12/20/2020"

// Specify default date formatting for language with a fallback language (in this case Indonesian)
console.log(new Intl.DateTimeFormat(["ban", "id"]).format(date));
// Expected output: "20/12/2020"

// Specify date and time format using "style" options (i.e. full, long, medium, short)
console.log(
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Australia/Sydney",
  }).format(date),
);
// Expected output: "Sunday, 20 December 2020 at 14:23:16 GMT+11"

```