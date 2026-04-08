# 🔐 Auth Configuration - Developer Setup

This project uses asymmetric JWT authentication with RSA key pairs (`.pem` files).

## 📁 Directory structure

The `.pem` files are located in the `apps/backend/keys` directory. The private key is named `private.pem`, and the public key is named `public.pem`.


## ⚙️ Local Development

In **development**, the app expects the following key files to exist in: `apps/backend/keys`



- `private.pem`: your RSA private key (used to sign auth tokens)
- `public.pem`: your RSA public key (used to verify auth tokens)

If these files are missing, the application will throw an error on startup.

👉 To generate a key pair locally:

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
```

## 🔒 Production
In production, keys are not loaded from the file system. Instead, they must be provided via environment variables:

JWT_PRIVATE_KEY: contents of your private key (as a string)

JWT_PUBLIC_KEY: contents of your public key (as a string)

Make sure they are injected securely using environment variables, Docker secrets, or a secrets manager.

## 🧪 Test Environment
The test environment uses the same development file-based strategy. Ensure keys are available in:

```bash
apps/backend/keys/
```

Keep the keys/ folder out of version control:

```bash
# .gitignore
apps/backend/keys/
```

