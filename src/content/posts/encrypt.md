---
title: 'Encryption details'
description: 'Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.'
pubDate: 'May 10 2025'
heroImage: '/blog-placeholder-1.jpg'
tags: ['ui-design','framework']
---

## Prewords

I watched Citizenfour back in 2023. The documentary fascinated me, particularly its emphasis on information security and the tools Snowden used to protect his communications.

> Test-driven development (TDD) is a software development process that relies on the repetition of a very short development cycle: requirements are turned into very specific test cases, then the software is improved to pass the new tests, only. 
>


Before watching this film, I had no intention of securing my information. Like Snowden described, I felt powerless against massive surveillance systems, so why even try? The documentary changed that perspective entirely.

## The need for encryption

I've recently been moving my data across platforms frequently - through email, messaging apps, cloud services. While I trust these platforms to function properly, I've grown wary of the humans behind them. System administrators, rogue employees, or hackers who gain access - people abuse power whenever they can.

"You cannot reason with a lion when your head is inside his mouth."

This realization pushed me to take control of my own data security. If I can't control who might access my data on these platforms, I can at least control what they see: encrypted files that are meaningless without my keys.


## Choosing Your Encryption Method
There are two main approaches to encryption, each with distinct use cases:

### Asymetric encrytion
Asymmetric encryption uses a pair of keys - one public, one private. Anyone can use your public key to encrypt messages that only you can decrypt with your private key. This is perfect for secure communication between parties who've never met.

Examples: GPG/PGP, RSA, Signal Protocol
Use when: You need to receive encrypted data from others, establish secure channels, or digitally sign documents.

### Symmetric Encryption
Symmetric encryption uses the same key for both encryption and decryption. It's simpler and faster than asymmetric encryption, but requires you to securely share the key with anyone who needs access.

Examples: AES, ChaCha20, age
Use when: You're encrypting files for yourself, creating backups, or sharing data with trusted parties through secure channels.

## Next Steps
In my next post, I'll demonstrate how to implement both types of encryption for everyday use. We'll explore practical scenarios like encrypting sensitive documents, creating secure backups, and even splitting encrypted files for extra security - techniques anyone can master with free, open-source tools.