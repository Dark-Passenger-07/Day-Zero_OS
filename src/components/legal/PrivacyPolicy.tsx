import { Shield } from 'lucide-react'
import { LegalLayout } from './LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Last updated: August 3, 2026 • Day Zero OS v1.0.0"
      icon={<Shield size={22} className="text-blue-400" />}
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
        <p>
          Day Zero OS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how your information is collected, used, and safeguarded when you use our digital workspace operating system for builders.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">2. Data We Collect</h2>
        <p>
          Day Zero OS operates with a privacy-first, project-centric data model. We collect only the data necessary to provide a unified workspace:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Data:</strong> Email address and authentication credentials managed securely via Supabase Auth.</li>
          <li><strong>Workspace Content:</strong> Projects, tasks, notes, knowledge base entries, content drafts, and asset metadata created within your workspace.</li>
          <li><strong>Local Storage:</strong> Preferences (such as theme and notifications settings) stored locally in your web browser.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
        <p>
          Your data is strictly used to power your workspace experience:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To authenticate your identity and synchronize your workspace across devices.</li>
          <li>To execute optional local AI workflows (AI features remain isolated and client-side controlled).</li>
          <li>To deliver push or email deadline notifications based on your explicit preferences.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">4. Data Ownership & Storage Security</h2>
        <p>
          You retain complete ownership of all data created inside Day Zero OS. Production data is stored using Supabase with Row Level Security (RLS) policies enforcing strict user-level isolation. We do not sell, rent, or monetize user data.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">5. Contact Us</h2>
        <p>
          If you have any questions or concerns regarding this Privacy Policy, please contact us at{' '}
          <a href="mailto:support@dayzeroos.com" className="text-primary hover:underline font-medium">
            support@dayzeroos.com
          </a>.
        </p>
      </section>
    </LegalLayout>
  )
}
