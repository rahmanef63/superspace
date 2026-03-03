# ⚡ Quick Start Guide

> **Get SuperSpace running in 5 minutes**

---

## Prerequisites

Before you begin, ensure you have:

- [ ] **Node.js 18+** installed ([download](https://nodejs.org/))
- [ ] **pnpm** installed (`npm install -g pnpm`)
- [ ] **Clerk account** ([sign up](https://clerk.com/)) - for authentication
- [ ] **Convex account** ([sign up](https://convex.dev/)) - for database

---

## Step 1: Clone & Install (1 min)

```bash
# Clone the repository
git clone <repo-url> superspace
cd superspace

# Install dependencies
pnpm install
```

---

## Step 2: Environment Setup (2 min)

### 2.1 Create your `.env.local` file

```bash
cp .env.example .env.local
```

### 2.2 Get your Clerk keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use existing)
3. Go to **API Keys**
4. Copy these values to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2.3 Set up Clerk JWT Template (for Convex auth)

1. In Clerk Dashboard → **JWT Templates**
2. Create new template → Name it `convex`
3. Copy the **Issuer URL** (looks like `https://your-app.clerk.accounts.dev`)
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
```

---

## Step 3: Start Convex Backend (1 min)

```bash
# Initialize and start Convex
npx convex dev
```

On first run, it will:
1. Ask you to log in to Convex
2. Create a new project (or link existing)
3. Automatically set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`

> 💡 **Keep this terminal running!** Convex needs to sync your schema.

### 3.1 Add Clerk URL to Convex

In the [Convex Dashboard](https://dashboard.convex.dev/):
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` = your Clerk issuer URL

---

## Step 4: Start Next.js (30 sec)

Open a **new terminal** and run:

```bash
pnpm dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** - SuperSpace is running!

---

## Step 5: Set Up Webhooks (Optional - for production)

For user sync between Clerk and Convex:

### 5.1 Get your Convex HTTP endpoint

Your webhook URL is: `https://<your-convex-deployment>.convex.site/clerk-users-webhook`

### 5.2 Configure Clerk Webhooks

1. In Clerk Dashboard → **Webhooks**
2. Add endpoint: your Convex HTTP URL above
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the **Signing Secret**

### 5.3 Add to Convex Environment

In Convex Dashboard → Environment Variables:
```
CLERK_WEBHOOK_SECRET=whsec_...
```

---

## ✅ You're Ready!

### What's Next?

| Task | Command / Link |
|------|----------------|
| **Create your first feature** | `pnpm run create:feature my-feature` |
| **Understand the architecture** | [00_BASE_KNOWLEDGE.md](00_BASE_KNOWLEDGE.md) |
| **Learn key terms** | [GLOSSARY.md](GLOSSARY.md) |
| **See all features** | [PROJECT_STATUS.md](../PROJECT_STATUS.md) |
| **Run tests** | `pnpm test` |

---

## 🧩 Creating Your First Feature

```bash
# Interactive CLI guides you through
pnpm run create:feature hello-world
```

This creates:
- `frontend/features/hello-world/config.ts` - Feature configuration
- `frontend/features/hello-world/page.tsx` - Main page
- `frontend/features/hello-world/agents/` - AI agent folder
- `frontend/features/hello-world/settings/` - Settings folder
- `convex/features/helloWorld/queries.ts` - Backend queries
- `convex/features/helloWorld/mutations.ts` - Backend mutations

See the [example feature](../frontend/features/example/) for a fully commented reference.

---

## 🔧 Common Commands

```bash
# Development
pnpm dev                      # Start Next.js frontend
npx convex dev                # Start Convex backend

# Feature Management
pnpm run create:feature       # Create new feature
pnpm run sync:all             # Sync feature registry

# Testing
pnpm test                     # Run all tests
pnpm test:coverage            # With coverage report

# Validation
pnpm run validate:all         # Validate all schemas
pnpm run precommit            # Run before committing
```

---

## ❓ Troubleshooting

### "Cannot find module" errors

```bash
pnpm run sync:all
```

### Convex schema errors

```bash
# Reset and re-push schema
npx convex dev --once
```

### Clerk authentication not working

1. Verify JWT template is named `convex`
2. Check `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` matches in both:
   - `.env.local`
   - Convex Dashboard environment variables

### Port 3000 already in use

```bash
# Kill existing process
npx kill-port 3000

# Or use different port
pnpm dev -- -p 3001
```

---

## 📚 Continue Learning

| Document | What You'll Learn |
|----------|-------------------|
| [00_BASE_KNOWLEDGE.md](00_BASE_KNOWLEDGE.md) | Core concepts, patterns, architecture |
| [GLOSSARY.md](GLOSSARY.md) | Key terms and definitions |
| [rules/01-FEATURE-RULES.md](rules/01-FEATURE-RULES.md) | Feature development rules |
| [rules/02-MUTATION-GUIDE.md](rules/02-MUTATION-GUIDE.md) | Convex backend patterns |
| [guides/TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) | Common issues & fixes |

---

**Need help?** Check the [troubleshooting guide](guides/TROUBLESHOOTING.md) or open an issue.
