---
title: 'Handing User Session In Supabase'
description: "How to create and manage user profiles linked to authenticated users, with proper database structure and security implementation."
pubDate: '2025-07-25'
heroImage: '/blog-placeholder-1.jpg'
tags: ['database', 'system-design', 'authentication']
---

How Supabase Sessions Work

### The Two-Token System
Supabase uses a two-token system:

**ACCESS TOKEN (JWT)**           
- Short-lived (1 hour)          
- Used for API calls            
- Stored in browser             
- Expires quickly for security  

**REFRESH TOKEN**
- Long-lived (1 year)      
- Used to get new access   
- tokens when they expire  
- Stored securely 
Supabase uses JWT tokens for authentication:

### The Actual User Experience
What users experience:
- Login once → Get both tokens
- Use the app → Access token handles requests
- After 1 hour → Access token expires
- Automatic refresh → Refresh token gets new access token
- User stays logged in → Seamless experience
- After 1 year → Refresh token expires, user must log in again

Why This Design?
Security: Access tokens are short-lived (1 hour) - if stolen, they expire quickly
User Experience: Users don't have to log in every hour
Performance: No need to hit the database for every request
Flexibility: Can revoke refresh tokens if needed

4. The Session Lifecycle
User logs in → Supabase creates access token (1 hour) + refresh token (1 year)
User makes requests → Middleware checks access token
Token expires → Should use refresh token to get new access token
Refresh token expires → User needs to log in again
5. Your Original Problem
Your middleware was only checking:
}
But it should check:
}
6. Why This Fixes Your "Always Logged In" Issue
Scenario 1: Expired Session
User logs in → Gets valid session
User closes browser → Session expires (1 hour later)
User returns → Old cookies still exist
Before: Middleware sees user object, thinks authenticated
After: Middleware checks session expiration, clears expired cookies
Scenario 2: Incomplete Logout
User clicks logout → Server clears session
Before: Browser cookies still exist, middleware thinks authenticated
After: Logout API now clears cookies, middleware sees no valid session


The Problem with Your Original Approach:
Only checked if user exists - didn't validate if the session was still valid
Expired sessions would still show as "authenticated" because the user object exists
No cleanup of expired session cookies


Session Expiration Check:
```
   if (session && session.expires_at) {
     const now = Math.floor(Date.now() / 1000)
     if (now >= session.expires_at) {
       // Session is expired!
       user = null
       session = null
       // Clear the expired cookies
     }
   }
```
Cookie Cleanup:
```
  supabaseResponse.cookies.delete('sb-access-token')
  supabaseResponse.cookies.delete('sb-refresh-token')
```

Debugging:
```
  console.log('[Middleware] Auth check result:', {
    hasUser: !!user,
    userEmail: user?.email,
    sessionExpiresAt: session?.expires_at,
    currentTime: Math.floor(Date.now() / 1000),
    isExpired: session?.expires_at ? Math.floor(Date.now() / 1000) >= session.expires_at : false
  })
```

3. How Supabase Sessions Work
Supabase uses JWT tokens for authentication: