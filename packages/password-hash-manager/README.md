# 🔐 Password Strategy Manager

A secure, pluggable, and version-aware password management utility.  
This package allows you to **hash**, **compare**, and **verify** passwords with **automatic, transparent migration** when your password hashing strategy changes.

Built for progressive upgrades and ease of use, it's perfect for systems that need to evolve their security practices over time without breaking existing user logins.

---

## ✨ Features

- ✅ **Simple API** — Hash, compare, and verify passwords with minimal setup
- 🔁 **Transparent Hash Migration** — Automatically re-hash outdated hashes during login
- ⚙️ **Pluggable Strategy System** — Add or switch between hashing algorithms (e.g., Argon2, Bcrypt, PBKDF2)
- 📦 **Versioned Hash Format** — Every hash embeds its version & algorithm metadata
- 🧪 **Strategy Registry** — Clean separation of concerns and easy extensibility
- 🚀 **Production-Ready** — Designed for use in real authentication flows

---

## 🛠️ Installation

```bash
npm install password-strategy-manager