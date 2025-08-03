---
title: 'Implementing Organization Control for User Management'
description: "Database design and implementation for user organizations with proper access control and security."
pubDate: '2025-07-27'
heroImage: '/blog-placeholder-1.jpg'
tags: ['system-design', 'case-study','database']
---

For most (if not all) of the current application, there is a need to have team/organization where a group of users interact with each other within the platform. 

Why apps need organizations: Most users don't work in isolation - they collaborate within teams, departments, or entire companies. Without organizational structure, you can't properly model these real-world relationships in your application.

In this post we will try to understand how to implement this from a database perspective.

## What is an organization?
An organization groups users (identities) together. It can represent teams, business customers, or partner companies accessing your application.

This is an important entity that pave the way for: Role-Based Access Control (RBAC), User lifecycle management, Multi-tenant data isolation,...

I'm using Supabase in this post, but the idea here is very universal and can be translated to any other PostgreSQL system easily.

## Implementaion
Let's examine how to build organization control from a database perspective. This approach gives you complete control over data relationships and security policies.

### Adding Organization Structure
Assume you already have an authentication system with users (I'm using Supabase `auth.users` table in this example):

```sql
-- Example existing auth and profiles tables
-- auth.users (managed by authentication system like Supabase)
-- Contains: id, email, encrypted_password, etc.
```

In a real life scenario, you will be implementing from here forward. To introduce organizations, you need to create a relationship between users and their groups. This connection lets you control who can access what data.

First, create the organizations table:
```sql
-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
);
```

What this does:
- Creates a table organizations that stores all organizations in our system.
- Provides basic metadata like name, description, and logo for each organization.
- Uses UUID for unique identification.

### Create User-Organization Relationships
To control what actions users can perform within an organization, we need to assign different permission levels to different users. We will accomplish this by implementing a role-based access control system through a junction table:

```sql
-- Create user-organization junction table
CREATE TABLE user_organizations (
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, organization_id)
);
```

The `user_organizations` table acts as a bridge between users and organizations. Each row represents one user's membership in one organization. The composite primary key ensures a user can only have one role per organization, but they can belong to multiple organizations with different roles in each.

What This Does:
- Creates many-to-many relationship where users can belong to multiple organizations.
- Stores each user's role (owner/admin/member) within each organization.
- Uses composite primary key to ensure one role per user per organization.
- Enables data separation and role-based access control.


### Handle security features
To ensure organizational data remains private and only accessible to authorized members, we need to implement row-level security policies. 

We will do this by enabling RLS on our tables and creating policies that check user membership and roles in organizations.

```sql
-- Enable Row Level Security on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Organizations viewable by members
CREATE POLICY "Organizations viewable by members" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Organizations editable by owners and admins
CREATE POLICY "Organizations editable by owners and admins" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Organizations insertable by authenticated users
CREATE POLICY "Organizations insertable by authenticated users" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User-organization relationships viewable by organization members
CREATE POLICY "User orgs viewable by org members" ON user_organizations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- User-organization relationships editable by owners and admins
CREATE POLICY "User orgs editable by owners and admins" ON user_organizations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
```

What This Does:
- Enables row-level security on both organizations and user_organizations tables
- Restricts organization viewing to members only through junction table lookup
- Limits organization editing to owners and admins based on their roles
- Controls membership management so only owners and admins can add/remove users
- Ensures data isolation between different organizations

