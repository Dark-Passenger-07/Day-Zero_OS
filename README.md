# Day Zero OS

Operating System for Builders & Teams.

Day Zero OS is a multi-tenant project management, knowledge base, asset vault, and content engine workspace application that replicates the best features of **Notion**, **Linear**, and **Slack**.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router
- **Backend & Database**: Supabase, PostgreSQL, Row Level Security (RLS)
- **Deployment**: Vercel
- **Features**: Progressive Web App (PWA) supporting offline access and auto-updating service workers.

---

## Environment Variables Configuration

Copy `.env.example` to `.env` and fill in the required variables:

```ini
# App Environment
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:8443

# Supabase Configurations
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Provider Configuration
# Supported values: console, resend, smtp
VITE_EMAIL_PROVIDER=console
VITE_RESEND_API_KEY=your_resend_api_key
VITE_INVITATION_FROM_EMAIL=Day Zero OS <invites@dayzero.dev>
```

---

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will run locally on `http://localhost:8443`.

3. **Verify Build & Types**
   ```bash
   npm run typecheck
   npm run build
   ```
