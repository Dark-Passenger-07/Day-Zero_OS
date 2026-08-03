import { FileText } from 'lucide-react'
import { LegalLayout } from './LegalLayout'

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Last updated: August 3, 2026 • Day Zero OS v1.0.0"
      icon={<FileText size={22} className="text-purple-400" />}
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">1. Agreement to Terms</h2>
        <p>
          By accessing or using Day Zero OS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">2. Use of Service</h2>
        <p>
          Day Zero OS provides a project-centric digital operating system for software engineers, creators, startup founders, and builders.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree not to use the service for illegal, harmful, or abusive activities.</li>
          <li>You retain full ownership of all intellectual property, projects, and content created using the platform.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">3. Service Availability & Modifications</h2>
        <p>
          While we strive for maximum uptime and reliability, Day Zero OS is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We reserve the right to modify, update, or enhance features to improve service quality.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">4. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Day Zero OS shall not be liable for any indirect, incidental, or consequential damages arising from your use of the application or loss of data.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">5. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable laws without regard to conflict of law principles.
        </p>
      </section>
    </LegalLayout>
  )
}
