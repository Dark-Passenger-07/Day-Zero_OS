export type InvitationEmailData = {
  workspaceName: string
  workspaceLogo?: string | null
  inviterName: string
  inviterEmail?: string
  role: string
  inviteUrl: string
  expiresAt: string
}

export function renderInvitationEmail(data: InvitationEmailData): { subject: string; html: string; text: string } {
  const subject = `You've been invited to join "${data.workspaceName}" on Day Zero OS`

  const formattedExpiration = new Date(data.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const text = `
You've been invited to join ${data.workspaceName} on Day Zero OS!

${data.inviterName} has invited you to collaborate in ${data.workspaceName} as a ${data.role.toUpperCase()}.

Click the link below to accept your invitation:
${data.inviteUrl}

This invitation will expire on ${formattedExpiration}.

If you weren't expecting this invitation, you can safely ignore this email.

---
Day Zero OS — Operating System for Builders
`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 560px; margin: 40px auto; padding: 32px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1f2937; margin-bottom: 28px; }
    .logo { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 12px; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
    .card { background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .ws-name { font-size: 18px; font-weight: 600; color: #818cf8; margin-bottom: 4px; }
    .role-badge { display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; margin-top: 6px; }
    .inviter { font-size: 14px; color: #cbd5e1; margin-top: 12px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); }
    .fallback { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; text-align: center; }
    .footer { border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Day Zero OS</h1>
      <p class="subtitle">Operating System for Builders & Teams</p>
    </div>

    <p style="font-size: 15px; color: #e2e8f0; margin-bottom: 16px;">Hello,</p>
    <p style="font-size: 14px; color: #cbd5e1;">You have been invited to join a collaborative workspace on Day Zero OS.</p>

    <div class="card">
      <div class="ws-name">${data.workspaceName}</div>
      <div class="role-badge">${data.role}</div>
      <div class="inviter">Invited by <strong>${data.inviterName}</strong></div>
    </div>

    <div class="btn-container">
      <a href="${data.inviteUrl}" class="btn" target="_blank">Accept Invitation</a>
    </div>

    <div class="fallback">
      Or copy and paste this URL into your browser:<br>
      <a href="${data.inviteUrl}" style="color: #818cf8;">${data.inviteUrl}</a>
    </div>

    <div class="footer">
      This invitation expires on ${formattedExpiration}.<br>
      If you weren't expecting this invitation, you can safely ignore this email.<br>
      &copy; ${new Date().getFullYear()} Day Zero OS. All rights reserved.
    </div>
  </div>
</body>
</html>
`

  return { subject, html, text }
}
