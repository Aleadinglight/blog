---
title: 'Backend Architecture: Data Access Patterns'
description: "Understand business logic vs. CRUD, and how to design a good data access layer."
pubDate: '2025-07-25'
heroImage: '/blog-placeholder-1.jpg'
tags: ['system-design', 'database', 'backend']
---

When building an application, one of the first architectural decisions you'll face is how to organize your data access layer. With the help of a modern Database system (for example Supabase), you can write raw database queries directly in your API routes using the driver, or implement a more structured approach with repositories and services? This article explores these patterns and when to use each.

## Understanding CRUD vs Business Logic

Before diving into architectural patterns, it's crucial to distinguish between simple CRUD operations and business logic.

### CRUD Operations
CRUD (Create, Read, Update, Delete) represents basic database operations without additional rules or validation:

```typescript
// Pure CRUD examples
const users = await supabase.from('users').select('*')
const newUser = await supabase.from('users').insert({ name: 'John', email: 'john@example.com' })
const updatedUser = await supabase.from('users').update({ name: 'Jane' }).eq('id', userId)
const deletedUser = await supabase.from('users').delete().eq('id', userId)
```

### Business Logic
Business logic encompasses the rules, workflows, and domain-specific operations that make your application unique:

```typescript
// Business logic for user registration
async function registerUser(email: string, password: string) {
  // 1. Validate email format
  if (!isValidEmail(email)) throw new Error('Invalid email')
  
  // 2. Check for existing users
  const existingUser = await supabase.from('users').select('email').eq('email', email).single()
  if (existingUser.data) throw new Error('User already exists')
  
  // 3. Hash password
  const hashedPassword = await hashPassword(password)
  
  // 4. Create user record
  const user = await supabase.from('users').insert({
    email,
    password: hashedPassword,
    role: 'member',
    created_at: new Date()
  })
  
  // 5. Create default organization
  await supabase.from('organizations').insert({
    name: `${email}'s Organization`,
    owner_id: user.data.id
  })
  
  // 6. Send welcome email
  await sendWelcomeEmail(email)
  
  // 7. Log registration event
  await auditLog('user_registered', { user_id: user.data.id })
  
  return user
}
```

## Architectural Approaches

### 1. Direct Supabase in API Routes (Simple Approach)

This is the most straightforward approach where you write Supabase queries directly in your Next.js API route handlers.

**Structure:**
```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   └── signup/route.ts
│   ├── users/
│   │   ├── route.ts
│   │   └── [id]/route.ts
```

**Example:**
```typescript
// app/api/auth/signup/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { email, password } = await request.json()
  
  // Business logic mixed with data access
  const existingUser = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single()
    
  if (existingUser.data) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }
  
  const { data, error } = await supabase.auth.signUp({ email, password })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ user: data.user })
}
```

**Pros:**
- Simple and straightforward
- No additional abstraction layers
- Fast to implement
- Good for simple applications

**Cons:**
- Business logic scattered across route handlers
- Difficult to test individual operations
- Code duplication across similar operations
- Hard to maintain as complexity grows

### 2. Repository/Service Layer Pattern

This approach separates data access (repositories) from business logic (services), creating a more structured architecture.

**Structure:**
```
├── app/api/          # API route handlers
├── lib/
│   ├── repositories/ # Data access layer
│   ├── services/     # Business logic layer
│   └── types/        # Type definitions
```

**Repository Layer (Data Access):**
```typescript
// lib/repositories/userRepository.ts
export class UserRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async findByEmail(email: string) {
    return await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
  }
  
  async create(userData: CreateUserData) {
    return await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
  }
  
  async updateById(id: string, updates: Partial<User>) {
    return await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  }
}
```

**Service Layer (Business Logic):**
```typescript
// lib/services/userService.ts
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private orgRepo: OrganizationRepository,
    private emailService: EmailService
  ) {}
  
  async registerUser(email: string, password: string) {
    // Validation
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }
    
    // Check existing user
    const existingUser = await this.userRepo.findByEmail(email)
    if (existingUser.data) {
      throw new Error('User already exists')
    }
    
    // Create user
    const hashedPassword = await this.hashPassword(password)
    const user = await this.userRepo.create({
      email,
      password: hashedPassword,
      role: 'member'
    })
    
    // Create default organization
    await this.orgRepo.create({
      name: `${email}'s Organization`,
      owner_id: user.data.id
    })
    
    // Send welcome email
    await this.emailService.sendWelcome(email)
    
    return user
  }
  
  private isValidEmail(email: string): boolean {
    // Email validation logic
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  private async hashPassword(password: string): Promise<string> {
    // Password hashing logic
    return await bcrypt.hash(password, 10)
  }
}
```

**API Route (Thin Controller):**
```typescript
// app/api/auth/signup/route.ts
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const userService = new UserService(
      new UserRepository(supabase),
      new OrganizationRepository(supabase),
      new EmailService()
    )
    
    const user = await userService.registerUser(email, password)
    
    return NextResponse.json({ user: user.data })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

**Pros:**
- Clear separation of concerns
- Reusable business logic
- Easier to test individual components
- Better maintainability as app grows
- Consistent error handling

**Cons:**
- More initial setup and boilerplate
- Can be overkill for simple applications
- Requires more architectural planning

## When to Use Each Approach

### Use Direct Supabase Approach When:
- Building a simple application with basic CRUD operations
- Team is small and moves fast
- Most operations are straightforward database queries
- Limited business logic requirements

### Use Repository/Service Pattern When:
- Complex business workflows (user registration with multiple steps)
- Need to reuse business logic across different endpoints
- Planning to scale the application
- Multiple developers working on the codebase
- Need comprehensive testing coverage
- Business rules are likely to change frequently

## Migration Strategy

If you're starting with the direct approach, you can gradually migrate to a layered architecture:

1. **Start Simple**: Begin with direct Supabase queries in API routes
2. **Extract Common Operations**: When you notice repeated code, extract to utility functions
3. **Identify Business Logic**: Move complex workflows to service functions
4. **Create Repositories**: Abstract data access patterns into repository classes
5. **Refactor Gradually**: Update API routes one at a time

## Why Many Developers Skip Service/Repository Layers with Supabase

There's a common tendency in the Supabase ecosystem to write raw queries directly in API routes without implementing service or repository layers. This happens for several reasons:

### 1. **Supabase's Developer Experience**
Supabase makes database operations so simple that adding abstraction layers feels unnecessary:

```typescript
// Supabase query is already clean and readable
const users = await supabase.from('users').select('*').eq('role', 'admin')

// vs adding a repository layer that might look similar
const users = await userRepository.findByRole('admin')
```

The Supabase client API is already quite abstracted and type-safe, making additional layers feel redundant.

### 2. **TypeScript Integration**
Supabase generates TypeScript types directly from your database schema:

```typescript
// Auto-generated types mean less boilerplate
const { data }: { data: User[] } = await supabase
  .from('users')
  .select('*')
```

This reduces one of the main benefits of repository patterns (type safety), since you get it automatically.

### 3. **Real-time and Advanced Features**
Supabase features like real-time subscriptions, RLS policies, and database functions work best when used directly:

```typescript
// Real-time subscriptions work seamlessly with direct queries
const subscription = supabase
  .from('users')
  .on('INSERT', payload => {
    // Handle new user
  })
  .subscribe()
```

Abstracting these behind repository layers can complicate or break these features.

### 4. **Rapid Prototyping Culture**
Many developers using Supabase are:
- Building MVPs quickly
- Working on side projects
- Prioritizing speed over long-term maintainability
- Coming from serverless/JAMstack background where simplicity is valued

### 5. **Framework Influence**
Next.js API routes encourage co-locating logic with endpoints:

```typescript
// Everything in one place feels natural in Next.js
export async function GET() {
  const users = await supabase.from('users').select('*')
  // Some business logic here
  return NextResponse.json(users)
}
```

### 6. **Perceived Overhead**
Adding service layers can feel like unnecessary ceremony for simple operations:

```typescript
// Direct approach - 3 lines
const user = await supabase.from('users').select('*').eq('id', userId).single()
if (!user.data) throw new Error('User not found')
return user.data

// Service layer approach - Much more setup
const userService = new UserService()
const user = await userService.findById(userId)
return user
```

### When This Approach Works Well

The direct Supabase approach works fine when you have:
- Simple CRUD operations
- Minimal business logic
- Small team or solo developer
- MVP or prototype phase
- Operations that map 1:1 with database queries

### When It Becomes Problematic

Direct queries without abstraction become challenging when:
- Business logic becomes complex (multi-step processes)
- You need to coordinate multiple tables/operations
- Error handling needs to be consistent across endpoints
- You need to add caching, logging, or monitoring
- Multiple developers are working on the same codebase
- You need to write comprehensive tests

### The Hybrid Approach

Many successful Supabase applications end up with a hybrid approach:
- **Simple queries**: Direct Supabase calls in API routes
- **Complex operations**: Service functions for business logic
- **Reusable operations**: Utility functions or lightweight repositories
- **Database logic**: Leverage Supabase RLS, triggers, and functions where appropriate

```typescript
// Simple operation - direct query
export async function GET() {
  return await supabase.from('users').select('*')
}

// Complex operation - service function
export async function POST() {
  const userService = new UserService()
  return await userService.registerUserWithOrganization(data)
}
```

This allows you to start simple and add abstraction only where the complexity justifies it.

## Conclusion

Both approaches have their place in Next.js + Supabase applications. The direct approach is perfect for getting started quickly and building simple features. As your application grows in complexity and your team scales, migrating to a repository/service pattern will provide better maintainability and testing capabilities.

The key is to start simple and evolve your architecture as your needs become clearer. Remember that over-engineering early can slow you down, while under-engineering can create technical debt. Find the balance that works for your current needs while keeping future growth in mind.