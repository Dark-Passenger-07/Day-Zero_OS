# Day Zero OS — App Store Listing Documentation

This document contains all verified metadata, store copy, keywords, categorizations, and asset requirements for publishing **Day Zero OS (v1.0.0)** to the **Microsoft Store** and **Google Play Store**.

---

## 1. General Product Information

- **App Name**: Day Zero OS
- **Package Name**: `com.dayzeroos.twa` / `day-zero-os`
- **Short Name**: Day Zero
- **Publisher / Organization**: Day Zero OS
- **Support Email**: `support@dayzeroos.com`
- **Privacy Policy URL**: `https://dayzeroos.com/privacy`
- **Terms of Service URL**: `https://dayzeroos.com/terms`
- **Website URL**: `https://dayzeroos.com`

---

## 2. Store Copy & Descriptions

### Short Description (Max 80 Characters - Google Play / Microsoft Store)
The unified digital workspace & operating system for builders and creators.

### Full Description
Day Zero OS is a next-generation operating system for builders—a unified digital workspace designed to help software engineers, AI builders, freelancers, startup founders, and creators manage the complete lifecycle of building products.

Unlike traditional productivity tools that focus on isolated tasks or notes, Day Zero OS is centered around the journey of creating something meaningful. It connects every stage of the process—from an initial idea to research, planning, design, development, deployment, documentation, content creation, and continuous learning—into a single, integrated workflow.

#### Key Features:
- **Mission Control**: Central command dashboard featuring focus timer, quick actions, recent updates, and high-level project metrics.
- **Project Workspace**: Interactive Kanban board, project specifications, milestone tracking, and task lifecycle management.
- **Knowledge Base**: Structured markdown note-taking, architecture decision records (ADRs), tag filtering, and code snippet storage.
- **Asset Vault**: File asset storage, design asset links, and multi-version tracking (`v1`, `v2`).
- **Content Engine**: Content repurposing workflow transforming technical milestones into documentation, blog posts, and social updates.
- **Weekly Debrief**: Reflection logs, weekly performance metrics, and continuous builder progress tracking.
- **Global Command Palette**: Instant navigation and workspace search (`Ctrl+K` / `Cmd+K`).
- **Offline First & PWA Support**: Work seamlessly online or offline with automatic local caching.

---

## 3. Keywords & Categories

### Keywords (Comma Separated)
`builder os`, `developer productivity`, `project workspace`, `knowledge base`, `kanban board`, `asset vault`, `weekly debrief`, `content engine`, `pwa`, `offline workspace`, `software engineer tools`

### Categories:
- **Microsoft Store**: Developer Tools > Utilities & Tools / Productivity
- **Google Play**: Productivity / Developer Tools
- **Content Rating**: Everyone (PEGI 3 / ESRB Everyone)

---

## 4. Required Store Assets Checklist

### A. Microsoft Store (PWABuilder / Partner Center)
- [x] **1024x1024 High-Res Logo** (`public/store/icon-1024x1024.png` or `public/pwa-512x512.png`)
- [x] **44x44 App Icon**
- [x] **150x150 Medium Tile Logo**
- [ ] **Desktop Screenshots** (Min 1366x768 or 1920x1080):
  1. *Mission Control Overview*
  2. *Project Workspace Kanban & Specs*
  3. *Knowledge Base Markdown Editor*
  4. *Asset Vault & Versioning*
  5. *Weekly Debrief Analytics*

### B. Google Play (Bubblewrap TWA / Play Console)
- [x] **512x512 High-Res Icon** (`public/pwa-512x512.png`)
- [x] **1024x500 Feature Graphic** (`public/store/feature-graphic-1024x500.png`)
- [x] **Digital Asset Links**: `https://dayzeroos.com/.well-known/assetlinks.json`
- [ ] **Phone Screenshots** (Min 2, 1080x1920 portrait)
- [ ] **7-inch & 10-inch Tablet Screenshots** (Min 2 each)

---

## 5. Release Notes (v1.0.0 Initial Release)

```text
Welcome to Day Zero OS v1.0.0 — The Operating System for Builders!

What's New in v1.0.0:
• Full workspace suite: Mission Control, Projects, Knowledge Base, Asset Vault, Content Engine, and Weekly Debrief.
• Command Palette (Ctrl+K) for instant global search and fast navigation.
• Seamless online/offline sync with Supabase and local mock storage.
• Mobile responsive layout with PWA installation support.
• Comprehensive legal and support documentation.
```
