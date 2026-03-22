---
title: "Dealing with Cross-Origin Resource Sharing"
description: "Decide which websites can talk to your API or access your resources."
pubDate: '2026-01-17'
heroImage: ''
tags: ['security', 'aws', 'system-design']
---

## What is CORS (Cross-Origin Resource Sharing)?
CORS (Cross-Origin Resource Sharing) is essentially a security feature built into browsers that controls which websites can talk to your API or access your resources.

Imagine your API is an internal building with a security guard. By default, the browser's security guard says "you can only receive deliveries from your own address". With CORS, the guard has a guest list - which tells  "hey, it's okay to accept requests from these specific addresses too."

And example of an API with CORS in AWS
```typescript
  // API Gateway
  const api = new apigateway.RestApi(this, 'FileAPI', {
    restApiName: 'File Share Service',
    description: 'API for file upload and download',
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'Authorization'],
    },
  });
```

## The common mistake
By default, browsers block all cross-origin requests. You don't have to configure anything for that protection. What we're actually configuring is making it LESS restrictive - we're telling the server "please send headers that tell the browser to allow these exceptions."

Usually, when a beginner encounters CORS errors and does not know what to do, they will set CORS policy to allow all traffics, like the example above `allowOrigins: apigateway.Cors.ALL_ORIGINS`, which means "accept requests from ANY website in the world." This is like telling the security guard to let anyone in, with no questions asked.

## Real life threats
Imagine this:
  1. You log into `yourbank.com`
  2. you get a session cookie that proves you're authenticated
  3. While still logged in, you visit `thief-site.com` in another tab
  4. `thief-site.com` has JavaScript that tries to call `yourbank.com/api/transfer-money`

**Without CORS protection**: The browser would automatically send your cookies to `yourbank.com` (browsers do this automatically for all requests to a domain) and `thief-site.com` could read the response. They just stole your money using your authenticated session.

**However, with CORS protection:** The request still goes through (cookies still sent), but the browser blocks `thief-site.com` from reading the response. The attack is prevented.

## What is the correct way to do this?

CORS prevents session [hijacking/CSRF-style attacks](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF). The problem is your frontend at `cloudfront-domain.com` and your API at `api-gateway-domain.com` are different origins. By default, the browser would block your own frontend from calling your own API.

So you need to configure CORS to say "allow my frontend domain", otherwise your app wouldn't work.

## Lock Down Your CORS

Instead of allowing all origins, restrict CORS to only your frontend domain:

```typescript
const api = new apigateway.RestApi(this, 'FileAPI', {
  restApiName: 'File Share Service',
  description: 'API for file upload and download',
  defaultCorsPreflightOptions: {
    allowOrigins: [`https://${distribution.distributionDomainName}`],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});
```

Similarly, if you have an S3 bucket, configure your S3 bucket CORS:
```typescript
cors: [
  {
    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
    allowedOrigins: [`https://${distribution.distributionDomainName}`],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3000,
  },
],
```

## Notes

CORS is a browser safety belt, not an API lock. Browsers enforce the same-origin policy. CORS is the server telling the browser “it’s OK for scripts from origin X to read this response.” Without CORS, the browser blocks a page from another origin from reading the response.

It does not authenticate or authorize. If someone calls your API with curl/Postman/server-side code, the request goes through; the browser isn’t involved, so CORS doesn’t run. You still need real auth/authorization (JWT/Cognito/API key/IAM/WAF/resource policy) to prevent arbitrary callers. CORS just governs which browser origins can read responses.
