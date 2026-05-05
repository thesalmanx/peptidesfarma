interface EmailOptions {
  preview: string
  content: string
}

export function buildEmail({ preview, content }: EmailOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${preview}</title>
  <style>
    body { margin: 0; padding: 0; background: #F6F7FB; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0E1A33; }
    table { border-spacing: 0; }
    td { padding: 0; }
  </style>
</head>
<body style="margin:0;padding:24px;background:#F6F7FB;font-family:Helvetica,Arial,sans-serif;color:#0E1A33;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #DDE2EC;">
    <tr>
      <td style="padding:24px;text-align:center;border-bottom:1px solid #DDE2EC;">
        <span style="font-size:20px;font-weight:700;color:#14213D;letter-spacing:-0.02em;">Peptidesfarma</span>
      </td>
    </tr>
    ${content}
    <tr>
      <td style="padding:24px;text-align:center;background:#F6F7FB;border-top:1px solid #DDE2EC;">
        <p style="margin:0;font-size:12px;color:#6B7790;">&copy; ${new Date().getFullYear()} Peptidesfarma. All rights reserved.</p>
        <p style="margin:6px 0 0;font-size:12px;color:#6B7790;">For research purposes only.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
