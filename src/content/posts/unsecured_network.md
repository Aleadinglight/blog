---
title: 'Building my own blog page'
description: 'Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.'
pubDate: '2025-06-30'
heroImage: '/blog-placeholder-1.jpg'
tags: ['ui-design','framework']
---

### Why does some network says: unsecured network?

Yes, you should definitely care about this, especially on a work laptop. "Unsecured network" means the WiFi connection isn't encrypted, so anyone else on that network can potentially see the data flowing between your device and the router.
With a work laptop, this is particularly risky because:

Sensitive work data could be intercepted if you're accessing company systems, emails, or files
Login credentials for work accounts might be visible to attackers
Your company's security policies likely prohibit connecting to unsecured networks
Compliance requirements in your industry might be violated

Here's what you can do:
Best option: Use your phone's hotspot instead, or ask if there's a secured guest network available.
If you must use it: Make sure you're only accessing HTTPS websites (look for the lock icon), avoid logging into sensitive accounts, and consider using a VPN if your company provides one.
Check with IT: Your workplace might have specific policies about public WiFi use that you should follow.
The risk isn't just theoretical - public WiFi attacks are common and relatively easy to execute. It's worth the extra caution, especially when work data is involved.

### If I only do https (also I think this is the standard nowadays, no?) Then im fine right? I use Okta login and such

Edit
HTTPS is indeed standard nowadays for most major websites, but you're not completely safe even with HTTPS-only browsing on unsecured WiFi.

Here's why:

What HTTPS protects:

The actual content of your web traffic (including Okta logins)
Passwords and form data
API calls and responses
What it doesn't protect on unsecured WiFi:

DNS requests - attackers can see which websites you're visiting
Metadata - timing, frequency, and patterns of your connections
Man-in-the-middle attacks - sophisticated attackers can try to intercept your connection before HTTPS kicks in
Evil twin networks - fake WiFi networks that mimic legitimate ones
Specific risks with work systems:

Even knowing which company systems you're accessing can be valuable intelligence
Some older internal company tools might not use HTTPS properly
Your company's security monitoring might flag the connection as suspicious
Bottom line: While HTTPS significantly reduces the risk, it doesn't eliminate it entirely. For occasional personal browsing, HTTPS on public WiFi is probably acceptable risk for most people. But for work activities, especially with corporate SSO like Okta, most IT security teams would recommend avoiding unsecured networks entirely.

Your company might even have monitoring in place that alerts them when work devices connect to unsecured networks. Worth checking what their policy says.

### How to get away with this
If you're turning on a VPN (Virtual Private Network), that's a great move! A VPN will encrypt all your traffic between your laptop and the VPN server, which solves most of the security concerns we just discussed about unsecured WiFi.
Just make sure:

It's a VPN service your company approves of (some companies have policies about which VPNs can be used with work devices)
You're connecting to a server in an appropriate location
The VPN is actually connected before you start accessing work systems

Once your VPN is running, you'll have much better protection even on that unsecured network. Your traffic will be encrypted end-to-end, and the WiFi network won't be able to see what you're doing.