---
title: "Why Instance-Level Caching in Serverless Doesn't Work (And What to Use Instead)"
description: "The premature optimization trap, where it just makes thing worse."
pubDate: '2025-10-26'
heroImage: '/blog-placeholder-1.jpg'
tags: ['nextjs', 'framework']
---

## The Problem I Found

I recently reviewed a codebase where someone had added "smart" caching to their service layer.

```typescript
export abstract class BaseService {
  // Cache for user organization data within a single request
  private userOrganizationCache: Map<string, UserOrganizationInfo> = new Map()

  protected async getCurrentUserOrganization(): Promise<UserOrganizationInfo> {
    const user = await this.getCurrentUser()
    const cacheKey = `org_${user.id}`

    // Check cache first
    if (this.userOrganizationCache.has(cacheKey)) {
      return this.userOrganizationCache.get(cacheKey)!
    }

    // Query database
    const org = await this.fetchOrgFromDatabase(user.id)
    
    // Cache the result
    this.userOrganizationCache.set(cacheKey, org)
    return org
  }
}
```
It looked professional, followed OOP best practices, and seemed like good engineering. What is the problem then? Well, this cache never gets hit. Not once. It provides zero performance benefit while adding complexity.

## Why It Doesn't Work: Understanding Request Lifecycle

### How Serverless/Next.js Actually Works

In Next.js API routes (and most serverless environments), here's what happens: 

```typescript
// API Route: /api/departments
export async function GET(request: Request) {
  // 1. Request comes in
  const departmentService = new DepartmentService()  // New instance created
  
  // 2. The service instance is used once
  const departments = await departmentService.getDepartmentsByOrganization(orgId)
  
  // 3. Return response
  return NextResponse.json({ departments })
  
  // 4. Instance is garbage collected and the cache is destroyed with it
}
```

**Each request creates a fresh instance.** The cache starts empty and gets destroyed when the request completes.

### The Lifecycle Timeline
So the timeline looks like this:

Request 1: `/api/departments`
1. Create DepartmentService instance
2. Cache: `{}` (empty)
3. Call `getCurrentUserOrganization()`
5. Cache: `{ "org_123": {...} }`
6. Return response and instance destroyed. 

=> The cache wasn't being used at all apart from being a place to write response to. Then in the next API call

Request 2: /api/departments  
1. Create a new DepartmentService instance
2. Cache: `{}`  (empty again!)
3. Same story...

The cache never survives between requests, and within a single request, methods are rarely called multiple times.

So we have a cache that doesn't persist between requests, but we waste time checking and writing to that cache, and finally we achive zero performance benefit.

## Why This Pattern Is So Common

This anti-pattern appears everywhere because:

1. **It looks professional**: Caching feels like "real" engineering. (Feeling strong proposing a new "performance boost" in your team meeting huh?)
2. **Enterprise patterns don't translate**: It works great in long-lived Java/C# servers, but not always.
3. **No measurement**: Sometimes developers don't check if it actually helps, since they are being swarmed with other things. This actually happens more than you think.

## Where This Pattern DOES Work

Instance-level caching makes perfect sense when:

### Your request is long-lived
```typescript
// Long-lived server (Express, traditional Node.js)
const app = express()
const userService = new UserService()  // ← Lives for hours/days

app.get('/api/users/:id', (req, res) => {
  // Same instance used across all requests
  // Cache persists and provides real value
  const user = await userService.getUser(req.params.id)
  res.json(user)
})
```

But since people are building mostly **serverless** these days. Instances are ephemeral, and stateful patterns fail.

### Methods are called multiple times in one request 
In practice, this almost never happens in reasonable code. Any scenario where you're calling the same method multiple times is likely a code smell that should be refactored.


## What To Do Instead

### 1. Database-Level Optimization

Often, the real solution isn't caching at all. If you are using Postgre - type Database, you can add something like this:

```sql
-- Add indexes for common queries
CREATE INDEX idx_user_orgs_user_id ON user_organizations(user_id);

-- Or use materialized views for expensive queries
CREATE MATERIALIZED VIEW org_stats AS
  SELECT org_id, COUNT(*) as member_count
  FROM user_organizations
  GROUP BY org_id;
```

**Impact:**
- Query time: 300ms reduces to 5ms
- No code complexity
- This will benefit all requests

### 2. Accept the Cost
Even with 300ms per auth request, it is perfectly fine Optimizing a 30ms query that runs once per request is **not** where your effort should go.

```typescript
// Just write a simple method to get the user org
async getCurrentUserOrganization(): Promise<UserOrganizationInfo> {
  const user = await this.getCurrentUser()
  
  const { data } = await db
    .from('user_organizations')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  return data
}
```

**Reality check:** Instagram does 5+ database queries per request. You're not at their scale.

If you're genuinely at the point where 300ms matters:
- You have bigger problems to solve first.
- You'll have a dedicated performance team
- You won't be reading blog posts about caching

So stop optimizing things that don't need optimizing.

### How to determine if you actually need the optimization?

Before adding caching to your service layer, ask yourself these question

1. **Is this instance long-lived?** (No in serverless)
2. **Will methods be called multiple times per request?** (Rarely)
3. **Have I measured the cost?** (Probably not)
4. **Is there a simpler solution?** (Usually yes)
5. **Does the platform already cache this?** (Often yes)

If you answer "no" to the first two questions, just **don't cache at the instance level.**

## Conclusion

Instance-level caching is a perfect example of how "best practices" can become anti-patterns when applied without understanding the context. What works in a traditional server doesn't work in serverless.

Often, the best cache is no cache at all.
