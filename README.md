# Day Zero OS

**The unified digital workspace & operating system for builders.**

Day Zero OS is a multi-tenant project management, knowledge base, asset vault, and content engine workspace application that replicates the best features of **Notion**, **Linear**, and **Slack**. It features a dual-engine architecture (Supabase production cloud vs. local offline-first fallback mock engine), full PWA capability, multi-platform targets, and enterprise-grade security.

---

## 🏗️ Architecture & Platform Support

Day Zero OS is compiled and optimized to run as a native experience across multiple platforms:

```
                          ┌──────────────────────────┐
                          │       Day Zero OS        │
                          └─────────────┬────────────┘
                                        │
         ┌──────────────────┬───────────┴───────────┬──────────────────┐
         ▼                  ▼                       ▼                  ▼
  ┌──────────────┐   ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
  │     Web      │   │  Mobile App  │        │ Desktop App  │   │  MS Store    │
  │ (Vercel/PWA) │   │ (Capacitor)  │        │   (Tauri)    │   │ (PWABuilder) │
  └──────────────┘   └──────┬───────┘        └──────────────┘   └──────────────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
               ┌─────────┐     ┌─────────┐
               │ Android │     │   iOS   │
               └─────────┘     └─────────┘
```

### 1. Web & PWA
- Optimized for production deployment on Vercel.
- High-fidelity Progressive Web App configuration in `vite.config.ts` featuring automatic updates via a customized in-app PwaUpdater modal, offline caching strategies, background synchronization fallbacks, and Lighthouse PWA compliance.

### 2. Android & iOS (Capacitor)
- Native mobile wrapper via Capacitor (`capacitor.config.ts`).
- Set up for native safe areas, platform-specific status bar coloring, splash screen layouts, adaptive and maskable icons, deep-linking handling (via `public/.well-known/assetlinks.json`), and permissions configurations.

### 3. Desktop Packaging (Tauri v2)
- Lightweight desktop shell using Tauri (`src-tauri/Cargo.toml`, `tauri.conf.json`).
- Blazing-fast performance and memory footprint compared to Electron.
- Built-in multi-platform installer targets (Windows `.msi`/`.exe`, macOS `.dmg`/`.app`, Linux `.deb`).

### 4. Microsoft Store
- Pre-configured package manifests (`publish/windows/AppXManifest.xml`) and Partner Center metadata configurations (`publish/windows/PwaStoreMetadata.json`) for instant Microsoft Store submission.

---

## 📂 Project Structure

```
Day Zero OS/
├── .env.example              # Documented environment variables blueprint
├── capacitor.config.ts       # Capacitor native mobile configuration
├── package.json              # Script shortcuts for development, testing, and packaging
├── publish/
│   └── windows/
│       ├── AppXManifest.xml  # Windows App MSIX packaging configuration
│       └── PwaStoreMetadata.json # Microsoft Partner Center store metadata
├── src-tauri/
│   ├── Cargo.toml            # Rust dependency definition for desktop app
│   ├── tauri.conf.json       # Tauri window configuration and build pipeline
│   ├── build.rs              # Tauri compiler build hook
│   └── src/
│       ├── main.rs           # Rust execution entry point
│       └── lib.rs            # Desktop commands & window orchestration
└── src/
    ├── app/                  # Providers, routes, global hooks
    ├── components/           # Shell elements, general UI, legal, and modals
    ├── features/             # Feature domain modules (workspace, project, etc.)
    └── hooks/
        └── useRateLimit.ts   # Rate limiting & interaction throttle hooks
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root containing:

```ini
# App Environment
VITE_APP_ENV=production
VITE_APP_URL=https://day-zero-os.vercel.app

# Supabase Configurations
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key

# Email Provider Configuration
# Supported values: console, resend, smtp
VITE_EMAIL_PROVIDER=console
VITE_RESEND_API_KEY=re_yourApiKey
VITE_INVITATION_FROM_EMAIL=Day Zero OS <invites@dayzero.dev>
```

---

## 🛠️ CLI Workflow Commands

### 1. Web Development & Quality Checks
```bash
# Run local dev server (default port 8443)
npm run dev

# Run ESLint validation
npm run lint

# Run type checker
npm run typecheck

# Build optimized production bundle
npm run build
```

### 2. Desktop Packaging (Tauri)
```bash
# Start Tauri development environment
npm run tauri:dev

# Build native desktop installers (depends on runner OS)
npm run tauri:build
```

### 3. Mobile Synchronization (Capacitor)
```bash
# Sync web assets to native mobile assets
npm run cap:sync

# Open project in Android Studio
npm run cap:open:android

# Open project in Xcode
npm run cap:open:ios
```

---

## 🔒 Security Audit & RLS Configuration

All Supabase tables are guarded by strict Row Level Security (RLS) policies:
- **`workspaces`**: Select is limited to workspace members; insert is open to authenticated users; update/delete is restricted to the workspace owner.
- **`workspace_members`**: Checked by custom database triggers (`check_member_update_permissions`) to prevent self-escalation of roles. Only owners or admins can modify member roles or remove users.
- **`workspace_invitations`**: Guarded by unique SHA-256 hashed secret tokens to protect against brute-force token harvesting.
- **Client-Side Sanitization:** All user text input fields are sanitized through `src/lib/security/sanitize.ts` to strip dangerous HTML tags and mitigate XSS.
