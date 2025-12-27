---
title: 'How to host your static frontend codes using AWS'
description: "Simple static hosting options from AWS, and which one should you choose"
pubDate: '2025-12-27'
heroImage: ''
tags: ['frontend', 'hosting', 'aws', 'cdn', 'security']
---

So you want to host a simple static website (with no hassle of APIs or heavy backend services), but you don't want to rely on online services like Vercel or Netlify and decided to dive in and do it yourself on AWS. This document outlines the two main approaches for hosting static frontend applications on AWS and explains our architectural decision.

### Option 1: Simple CloudFront + Public S3 Bucket
The user visits your website by typing in the URL and your browser connects to CloudFront, which then grabs the files from S3 and serves them to you. 

```shell
User -> CloudFront -> Public S3 Bucket (normal path)
```

This is a fast and simple setup. But here's the catch: because the S3 bucket is public, anyone can skip CloudFront entirely. If someone discovers your S3 bucket URL (like `http://your-bucket-url.s3-website-us-east-1.amazonaws.com`), they can access your website directly from S3. CloudFront is just sitting there as a performance boost, since it's not actually protecting anything.

```shell
User -> Public S3 Bucket directly (bypass path)
```

### Configuration
- S3 bucket with `publicReadAccess: true`
- Website hosting (`websiteIndexDocument`, `websiteErrorDocument` enabled)
- Public access is allowed (`BlockPublicAccess` disabled)
- CloudFront uses `S3StaticWebsiteOrigin`

Your S3 bucket is configured as a static website and is publicly accessible to anyone on the internet. CloudFront sits in front but doesn't control access. Its job is to cache your files and serve them faster to users around the world. Two URLs exist: the CloudFront URL (what you share with users) and the direct S3 website URL (which also works, but bypasses all the CloudFront benefits like caching and speed, but you would prefer to hide this).

### Pros
- **Simple setup**: Minimal configuration required
- **Fast initial deployment**: S3 website is available immediately
- **Easy debugging**: Can test S3 directly without CloudFront layer
- **Lower complexity**:  Fewer moving parts to understand
- **Good for prototypes**: Quick to get something working

### Cons
- **Security gap**: Bucket is fully public, accessible without CloudFront
- **No access control**: CloudFront security features don't apply
- **Bypass risk**:  Users can discover and use S3 URL directly (with some networking skills)
- **Cost exposure**: Direct S3 access bypasses CloudFront caching
- **Two entry points**: Harder to manage/monitor traffic. User shouldn't even use the S3 path in the first place.
- **Limited CloudFront features**: WAF, geo-blocking, rate limiting ineffective

Start with this first if you're learning, and then when you're confident that you know what you're doing, move on to the following option. 

## Option 2: CloudFront with Origin Access Control (OAC)

This is the AWS-recommended approach. Your S3 bucket is completely private - no public access at all. CloudFront is the only way in, using a special permission called Origin Access Control (OAC). If someone tries to access S3 directly, they get a `403 Forbidden error`.

```shell
User -> CloudFront (enforced entry point) -> Private S3 Bucket (OAC-controlled access)
```

### Configuration
- S3 bucket with `BlockPublicAccess.BLOCK_ALL`
- No website hosting enabled (regular S3 bucket)
- CloudFront uses `S3Origin` with Origin Access Control
- Bucket policy grants access only to CloudFront

In this option, your S3 bucket remains completely private. CloudFront has special permission (OAC) to read from bucket, so only CloudFront URL works. Any direct access to S3 returns 403 Forbidden, ensuring all traffic must flow through CloudFront.

### Pros
- **Secure by default**: Bucket is private, no public access
- **Single entry point**: Only CloudFront URL works
- **Full CloudFront features**: WAF, rate limiting, geo-restrictions work properly
- **Cost optimization**: All traffic benefits from CloudFront caching
- **Production best practice**: AWS-recommended architecture
- **Compliance ready**: Meets security standards for production apps
- **Better monitoring**: Single traffic source to monitor/log

### Cons
- **More complex setup**: Requires OAC configuration + bucket policy
- **Slower initial deployment**: CloudFront creation takes 15-20 minutes (only if you change Cloudfront configuration. Updating the website codes should work faster)
- **Cache invalidation needed**: Updates require CloudFront cache invalidation (~1-2 min)
- **Steeper learning curve**: More AWS concepts to understand

You should follow this if you're building production applications, or your app requires handling sensitive data and security compliance.

## Final Thoughts

Deciding which option to use depends entirely on your use case. I've learned over the years that not every project needs to be configured with production-level complexity or fully armed with robust security features.

Choose **Option 1 (Public S3 + CloudFront)** if:
- You're building a quick prototype for a project proposal and need something working fast to get approval from stakeholders.
- You're creating an internal tool that serves just a few teams (dashboards, internal guides, blogs) and the security hassle isn't worth it.
- You're in the early stages of a project and iterating rapidly (you can always upgrade to Option 2 in the later review cycle)

Choose **Option 2 (Private S3 + CloudFront with OAC)** if:
- You're deploying to production and need proper monitoring and security controls
- You're building an application for external users or customers that handling any kind of sensitive data or user information, at the same time preventing unauthorized access and keep costs predictable
- You're building something that will scale globally and need full CloudFront features

Hope this helps.