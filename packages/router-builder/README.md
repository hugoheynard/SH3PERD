# RIDER 🏇
> Dynamic, Hookable and Modular Router Builder for TypeScript APIs

---

## 🚀 Why RIDER?

RIDER is a powerful, extensible and hook-first router builder designed for modern TypeScript backends.  
It lets you compose clean, modular, and scalable Express routers – with full control over routing lifecycle.

✅ Fluent API  
✅ Lifecycle Hooks (beforeValidate, beforeRegister, beforeChildren, beforeMount)  
✅ Global Middlewares  
✅ Modular Composition (Recursive Routing)  
✅ Built for Express + TypeScript

---

## 📦 Installation

```bash
npm install rider-router
# or
pnpm add rider-router
# or
yarn add rider-router
```

## ✨Quick Start

```typescript
import { Rider } from "rider-router";

const rider = new Rider();

// Global Middleware
rider.useGlobalMiddleware((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

// Lifecycle Hooks
rider.useBeforeValidate((route) => {
  console.log(`[Hook] Validating route: ${route.path}`);
});

// Build your Router
const router = await rider.build({
  routeDefs: [
    {
      path: "/users",
      factory: async () => ({
        routes: {
          "GET:/": [(req, res) => res.send("Hello Users!")],
        }
      }),
      children: [
        {
          path: "/profile",
          factory: async () => ({
            routes: {
              "GET:/": [(req, res) => res.send("User Profile")],
            }
          }),
          children: []
        }
      ]
    }
  ]
});

// Then mount it into your Express app
import express from "express";

const app = express();
app.use(router);
app.listen(3000, () => console.log("Server running 🚀"));
```

🔥 Key Concepts
➡️ Route Definitions
Define your API structure with a clean JSON-like tree:

```typescript
{
  path: "/admin",
  factory: async () => ({
    routes: {
      "GET:/": [adminHandler],
      "POST:/create": [createAdminHandler],
    }
  }),
  children: [...]
}
```

➡️ Lifecycle Hooks
Hook into the router's lifecycle to add logic dynamically:


Hook Name	Trigger Moment
beforeValidate	Before validating a routeDef
beforeRegister	Before registering factory-generated routes
beforeChildren	Before recursing into children
beforeMount	Before mounting the final subrouter
Perfect for authentication, logging, permission checks, analytics, etc.

## 🛠️ API Reference

### `new Rider()`
Create a new Rider instance.

---

### `.useGlobalMiddleware(middleware: RequestHandler)`
Add an Express middleware that applies globally to all routes.

```typescript
rider.useGlobalMiddleware(loggerMiddleware);

