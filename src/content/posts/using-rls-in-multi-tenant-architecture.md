---
title: "Row Level Security And Its Application In Multi-tenant Applications"
description: "Manage your multi-tenant application better by using RLS in Postgre DB"
pubDate: '2025-09-11'
heroImage: '/blog-placeholder-1.jpg'
tags: ['system-design', 'case-study','database', 'security']
---
## 1. Why Multi-Tenancy Exists

In the world of Software as a Service (SaaS), the economics are simple: build once, serve many. Instead of deploying separate applications and databases for each customer, some companies use **multi-tenancy** - one application instance serving multiple customers (tenants).

**The Business Case:**
- **Cost Efficiency**: One server, one database, hundreds of customers
- **Maintenance Simplicity**: Deploy updates once, everyone gets them
- **Resource Optimization**: Shared infrastructure means better utilization
- **Faster Time-to-Market**: Onboard new customers instantly, no new deployments

**The Trade-off:**
Multi-tenancy is essentially trading technical complexity for business profit. You save money on infrastructure but inherit the responsibility of keeping customer data completely isolated. One mistake can expose all your customers' data to each other.

## 2. Understanding Your Multi-Tenant Setup

Let's say you are building a database for users in multiple organizations. Instead of a separate schema/table for each organization, the most common multi-tenant pattern uses a **junction table** to define which users belong to which organizations:

```sql
-- The core multi-tenant pattern
CREATE TABLE user_organization (
  -- Combining unique keys from "users" and "organizations" table
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  PRIMARY KEY (user_id, org_id)
);
```

**How It Works:**
- Users can belong to multiple organizations
- Organizations contain multiple users  
- The `user_organization` table defines these relationships
- All queries must respect these boundaries

Users and organizations can be managed separated in `users` and `organizations` table, with their independent logic. Then when a user is added to a new org, one new entry is added to the `user_organization` table.

This approach scales amazingly well, since you only need to define these tables once, and then all the entities can be added from time to time without any new additional database set up step.

## 3. The Multi-Tenant Security Problem
When multiple customers share the same database tables, you face a fundamental challenge: **how do you ensure Customer A never sees Customer B's data?**

The nightmare scenario is we missed business logic to prevent a user from browsing other organizations they don't belong to. For example, developer added a new search function, but they forgets to add security features that check user orgs - an API that triggers this piece or SQL in the database:

```sql
-- Shows which organizations a user belongs to across ALL tenants
SELECT uo.user_id, uo.org_id 
FROM user_organization uo 
WHERE uo.user_id = '{input-user-id}';
-- This could expose cross-tenant relationships!
```

**The Fundamental Problem:**
Every single query must remember to include the organization filter. Miss it once, and you've created a data leak. As your application grows, this becomes increasingly difficult to maintain and audit. For example, this is the codes behind and API that searches for a user with a given `name`

```javascript
// This looks safe...
function getUsers(orgId, searchTerm) {
  return db.query(`
    SELECT * FROM users 
    WHERE organization_id = ? AND name LIKE ?
  `, [orgId, searchTerm]);
}
```

But what about this path?
```js
function getUsers(searchTerm) {
  // Oops! Forgot the organization filter
  return db.query(`
    SELECT * FROM users WHERE name LIKE ?
  `, [searchTerm]);
}
```
The second function will list all users with that `name` in **every orgs even if the user does not belong to those orgs**. This requires developers always remembering setting the right filters in their codes, which adds an extra security vulnerability to our system.

## 4. Row Level Security: The Database Solution

To deal with this, people use a feature called **Row Level Security (RLS)**. RLS moves tenant isolation from your application code into the database itself. It's like an automatic firewall that filters every query based on rules you define.

**How RLS Works:**
1. You enable RLS on a table (this means the table is blocked unless you allow acccess through policies).
2. You create policies that define "who can do what".
3. The database automatically applies these filters to EVERY query.
4. Even direct SQL queries respect the policies.

Let's examine the case where a user search for another user in the chapter above. Before adding the RLS, you need to make sure your query is like this

```sql
-- The user is only allow to browse their own organization
SELECT * FROM user_organization WHERE org_id = 'current-user-org';
```

After adding the RLS, you can just write this
```sql
SELECT * FROM user_organization;
-- Database automatically adds: WHERE org_id IN (current-user-orgs)
```

**Why It's Better Than Application Filtering?**

Application-Level:
- Developers must remember 
- Can be bypassed by bugs 
- Inconsistent across queries 
- Hard to audit 

Database-Level (RLS):
- Automatic enforcement 
- Cannot be bypassed 
- Consistent everywhere 
- Centralized policies 


RLS is like having a security guard at the database level who checks every request. Even if your application code is buggy, even if there's a SQL injection attack, even if an admin runs a raw query, the database ensures users only see their organization's data.

This is the also the reason why you see people loves using Postgre. It has robust, mature RLS implementation, with policies that can filter rows based on user roles, session variables, or custom functions.

## 5. Example on implementing RLS with Supabase (similar to PostgreSQL)

If you read my blog, you know that I'm a big fan of [Supabase](https://supabase.com/). Let's see how to implement RLS step-by-step for the `user_organizations` pattern:

### Step 1: Enable RLS
```sql
-- Turn on Row Level Security
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
```

**What this does:** This will immediately blocks ALL access to the table until you create policies. 

### Step 2: Create Your First Policy
```sql
-- Policy: Users can only see memberships in their own organizations
CREATE POLICY "users_see_own_org_members" ON user_organizations
FOR SELECT USING (
  org_id IN (
    SELECT org_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

**Explanation:**
- `FOR SELECT` - Applies to read operations
- `auth.uid()` - Current authenticated user (Supabase function)
- Users can only see memberships in organizations they belong to


### Common Issue and How to Avoid Them

**Silent Policy Failures**: in some cases, you would want to tell the user about the situation. A real example can be like a Github Org where you can see the name, but when you click on the link you are not allowed to see more. If there are more action to be done (user needs to request for permission), then we should let the user know they are being restricted.

```javascript
// Bad: Silent failure, user will think the org is empty
const result = await db.query('SELECT * FROM user_organization');
// Returns empty array if RLS blocks access

// Good: Explicit access check, user now know they need to request a view permission
if (!userHasOrgAccess(userId, orgId)) {
  throw new Error('Access denied to organization');
}
```

**Complex Policies That Are Hard to Debug**
Nesting logic is a what a nightmare simulation looks like in real life
```sql
-- Bad: Overly complex policy
CREATE POLICY "complex_nightmare" ON profiles
FOR SELECT USING (
  (user_id = auth.uid()) OR 
  (manager_id = auth.uid()) OR
  (org_id IN (...complex subquery...)) OR
  (department_id IN (...another complex subquery...))
);
```
Instead, try to keep things as simple as you can. This will save you tons of headaches.
```sql
-- Good: Simple, focused policies
CREATE POLICY "own_profile" ON profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "managed_profiles" ON profiles  
FOR SELECT USING (manager_id = auth.uid());
```

**Not Testing Edge Cases**
Everytime we create something, we need to think around that situation: Is this good enough? What is the main purpose of my work, and is there any way for it to fail? What are the ways someone can use this against me?

For examplw, test these scenarios:
- User with no organization memberships.
- User belonging to multiple organizations.  
- Deactivated users & expired memberships (in some custom logic, they are still in the org, but with a flag "`active` = false").
- Users with admin roles (they are the one using our platform most actively).
```

## Conclusion

Row Level Security transforms your database from a passive data store into an active security enforcer. By moving tenant isolation from application code to database policies, you create a safety net that protects against human error, code bugs, and even malicious attacks.

**Key Takeaways:**
- Multi-tenancy saves money but creates security complexity
- Application-level filtering is error-prone and bypassable  
- RLS provides automatic, database-level tenant isolation
- Proper policies are your insurance against data breaches

In multi-tenant applications, a security mistake isn't just a bug, it's a business-ending catastrophe. I pray you never have to go through that situation, my friend.