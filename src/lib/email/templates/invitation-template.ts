export type InvitationEmailData = {
  workspaceName: string
  workspaceLogo?: string | null
  inviterName: string
  role: string
  joinCode: string
  appUrl: string
}

export function renderInvitationEmail(data: InvitationEmailData): { subject: string; html: string; text: string } {
  const subject = `You've been invited to join ${data.workspaceName}`
  const formattedCode = `${data.joinCode.slice(0, 4)}-${data.joinCode.slice(4)}`

  const text = `
Hi,

${data.inviterName} invited you to join "${data.workspaceName}" on Day Zero OS as an ${data.role.toUpperCase()}.

Your Workspace Join Code:
${formattedCode}

How to join:
1. Open Day Zero OS: ${data.appUrl}
2. Sign up or log in.
3. Click "Join Workspace" in the workspace switcher menu.
4. Enter the join code: ${formattedCode}

Need help? Contact us at dayzeromedia.co@gmail.com
© Day Zero OS
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
    .container { max-width: 500px; margin: 40px auto; padding: 32px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1f2937; margin-bottom: 24px; }
    .logo { width: 44px; height: 44px; border-radius: 10px; margin-bottom: 10px; object-fit: contain; }
    .brand { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .salutation { font-size: 15px; color: #e2e8f0; margin-bottom: 12px; }
    .invite-text { font-size: 14px; color: #cbd5e1; margin-bottom: 20px; }
    .card { background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .ws-name { font-size: 20px; font-weight: 700; color: #818cf8; margin-bottom: 4px; }
    .role-badge { display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 10px; font-weight: 600; text-transform: uppercase; padding: 3px 10px; border-radius: 6px; margin-top: 4px; margin-bottom: 16px; }
    .code-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 8px; }
    .code-display { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; margin: 8px 0; padding: 8px; background-color: #0b0f19; border-radius: 8px; border: 1px solid #374151; text-align: center; }
    .instructions { font-size: 12px; color: #94a3b8; text-align: left; margin: 20px 0 0 0; padding-left: 16px; }
    .instructions li { margin-bottom: 8px; }
    .btn-container { text-align: center; margin: 28px 0 12px 0; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { border-top: 1px solid #1f2937; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 11px; color: #64748b; }
    .footer-link { color: #818cf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.workspaceLogo ? `<img src="${data.workspaceLogo}" class="logo" alt="logo" />` : ''}
      <h1 class="brand">Day Zero OS</h1>
    </div>

    <p class="salutation">Hi,</p>
    <p class="invite-text"><strong>${data.inviterName}</strong> has invited you to join their collaborative workspace on Day Zero OS.</p>

    <div class="card">
      <div class="ws-name">${data.workspaceName}</div>
      <div class="role-badge">${data.role}</div>
      <div class="code-label">Workspace Join Code</div>
      <div class="code-display">${formattedCode}</div>
      
      <ol class="instructions">
        <li>Open <a href="${data.appUrl}" style="color: #818cf8; text-decoration: none;">Day Zero OS</a> and sign up.</li>
        <li>Open the workspace switcher in the header or sidebar.</li>
        <li>Click <strong>"Join Workspace"</strong>.</li>
        <li>Enter the code above to gain access instantly.</li>
      </ol>
    </div>

    <div class="btn-container">
      <a href="${data.appUrl}" class="btn" target="_blank">Open Day Zero OS</a>
    </div>

    <div class="footer">
      Need help? <a href="mailto:dayzeromedia.co@gmail.com" class="footer-link">dayzeromedia.co@gmail.com</a><br>
      &copy; ${new Date().getFullYear()} Day Zero OS. All rights reserved.
    </div>
  </div>
</body>
</html>
`

  return { subject, html, text }
}
