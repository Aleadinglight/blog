---
title: 'From Auth to Profiles: Extending User Data in Supabase'
description: "How to create and manage user profiles linked to authenticated users, with proper database structure and security implementation."
pubDate: '2025-07-25'
heroImage: '/blog-placeholder-1.jpg'
tags: ['case-study', 'database', 'system-design']
---
# Supabase Automatic Profile Creation

Supabase provides us with the `auth.users` table for authentication, but now we want to create a user profile in the `public.profiles` table whenever a new user is added to the system.

What are we trying to achieve:
- Create a secure table that is linked to authentication
- Add automatic profile creation on user signup
- Add proper security policies that allow users to manage only their own profiles

## Implementation

### Profiles Table

The first step is to create a profiles table that will store additional user information beyond what's in the auth system.

```sql
-- Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

Why this structure works well:
- The `id` field creates a direct link to `auth.users` using the same UUID, so each profile belongs to exactly one user
- `ON DELETE CASCADE` ensures that when a user account is deleted, their profile gets deleted automatically too
- The `username` field has a `UNIQUE` constraint to prevent duplicate usernames across the platform
- `updated_at` automatically tracks when the profile was last modified

### Security Policies

Next we need to set up Row Level Security to control who can access and modify profile data.

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can create their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

These policies create a secure but usable system:
- Row Level Security (RLS) is enabled, which means all access to the table goes through our security policies
- The SELECT policy allows anyone to view all profiles, which is perfect for social media apps or public directories
- The INSERT and UPDATE policies ensure that users can only create and modify their own profile data
- The `auth.uid()` function gets the currently authenticated user's ID, which we use to verify ownership

### Function and Trigger

This is the part that creates the automation for new user signup to automatically create a new profile.

```sql
-- Function that creates a blank profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger that runs the function when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

How this automation works:
1. A **trigger** is a special function that automatically runs when something specific happens in the database
2. When a new row is added to `auth.users` (meaning someone signed up), the trigger fires immediately
3. The trigger calls our `handle_new_user()` function, which creates a blank profile with the same ID as the newly created user
4. **SECURITY DEFINER** means the function runs with elevated permissions, which is necessary because it needs to insert data into the profiles table
5. The user now has both an authentication record and a profile record ready to be customized

## Summary

Summary of what we accomplished:
1. **Create profiles table** - Set up a table with foreign key relationship to auth.users and all the profile fields we need
2. **Enable Row Level Security** - Turn on database-level security to protect user data
3. **Create security policies** - Define exactly who can read and write profile data
4. **Auto-create function** - Build a function that creates an empty profile when a user signs up
5. **User creation trigger** - Set up automatic execution of the function whenever a new user is added

Here is the complete SQL setup that you can run in your Supabase SQL Editor:

```sql
-- Create the profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Auto-creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## What Happens Now

The workflow after implementing this setup:
1. When a user signs up through your application, Supabase creates an entry in the `auth.users` table
2. Our trigger automatically fires and creates a blank profile in the `profiles` table with the same ID
3. The user can then fill out their profile information like full name, username, bio, and avatar
4. Other users can view profiles throughout the application, but each user can only edit their own profile data

**End result:** Every user automatically gets a customizable profile with proper security controls in place, and you don't have to remember to create profiles manually in your application code.

## Future potential change

Future Organization Restrictions:
When you're ready to restrict by organization, you can:

Add organization fields to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN organization_id UUID;
```

Update the RLS policy to check organization membership:
```sql
CREATE POLICY "Profiles viewable by org members" ON profiles
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```
