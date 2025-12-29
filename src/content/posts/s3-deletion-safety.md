---
title: 'Why You Should Make It Harder to Delete Your S3 Bucket'
description: 'Why manual intervention is the sweet spot for production data.'
pubDate: '2025-12-29'
heroImage: '/blog-placeholder-4.jpg'
tags: ['aws','security', 's3']
featured: true
---

When building cloud applications, it's tempting to optimize for convenience. Auto-delete everything, clean deployments, one-command teardowns. But when it comes to S3 buckets containing user data, a little friction can save you from catastrophic mistakes.

## The dangerous side of automation

It's just another Tuesday and the manager hands you a list of old AWS stacks that might be cleaned up. After some researches, you decided that nothing is worth keeping, and even if it is, you can just re-create the AWS stack again. So you run `cdk destroy` or `terraform destroy` and the command completes successfully. Minutes later, you get a message from another team informing that you just deleted an important S3 bucket with thousands of user files, because it was linked to your stack.

This has happened to experienced engineers. It will happen again.

## Manual intervention 

In AWS CDK, you have three options for S3 bucket deletion:

**Option 1: Full Automation**
```typescript
removalPolicy: cdk.RemovalPolicy.DESTROY,
autoDeleteObjects: true
```
Stack deletion works seamlessly. The bucket and all its contents vanish instantly. Great for development, dangerous for production.

**Option 2: Manual Safety (Recommended)**
```typescript
removalPolicy: cdk.RemovalPolicy.DESTROY,
// autoDeleteObjects intentionally omitted
```
Stack deletion fails if the bucket contains files. You must manually empty the bucket first, then retry the deletion. This forces you to pause and verify what you're deleting.

**Option 3: Maximum Protection**
```typescript
removalPolicy: cdk.RemovalPolicy.RETAIN
```
The bucket survives stack deletion entirely. You must manually delete it later through the AWS console or CLI.

## The Real Cost of Convenience

When you enable `autoDeleteObjects: true` (Option 1) for production buckets, you're trading safety for convenience. That trade might seem reasonable until you consider:

- Customer files lost permanently
- Compliance violations from premature data deletion  
- Hours of incident response and customer communication
- Potential revenue impact and reputation damage

Is saving 30 seconds of manual work worth that risk?

## The sweet spot for automation while still requiring minimal manual intervention

For most production applications storing user data, Option 2 provides the right balance. It prevents accidental deletion: that failed stack error is your safety net. When CloudFormation says "cannot delete non-empty bucket," you stop and think about what you're doing.

This, however, isn't a burden like you would think. You only deal with this once: when deliberately tearing down the stack. Unlike daily operations, this is a rare, intentional action. Unlike Option 3 (`RETAIN`), the bucket eventually gets deleted. You don't accumulate orphaned resources across AWS accounts.


## What to consider?

Here's the recommendation for S3 bucket deletion policies:

**Development/Test environments:** Data does not matter here. Just use `autoDeleteObjects: true`. Fast iteration matters more than data persistence in this state.

**Production environments with user data:** For most production case, this is enough. Omit `autoDeleteObjects`, and let the failed deletion be your safety check. More eyes, more safety.

**Critical data (backups, archives):** If your data is just too valuable, maybe a full review is required. Use `RemovalPolicy.RETAIN` so that it requires explicit, separate action to delete.

## Making your comments in the codes

When you choose manual intervention, document it. Future you (or your teammates) will appreciate understanding why the stack deletion "failed":

```typescript
const userFilesBucket = new s3.Bucket(this, 'UserFiles', {
  // RemovalPolicy.DESTROY without autoDeleteObjects requires 
  // manual bucket emptying before stack deletion to prevents accidental data loss.
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  lifecycleRules: [/* ... */],
});
```

## Conclusion

Good security isn't just about encryption and access control. Sometimes it's about adding just enough friction to prevent irreversible mistakes. When someone reviews your infrastructure code and points out that "stack deletion will fail with a non-empty bucket," you can confidently reply: "Yes, that's exactly what I want." 

Because the best disaster recovery plan is the one you never have to use.
