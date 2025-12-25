export const prerender = false;
import type { APIRoute } from "astro";

const MAILCHANNELS_ENDPOINT = "https://api.mailchannels.net/tx/v1/send";
const ADMIN_TO = "yyds2023007@outlook.com";
const FROM_EMAIL = "support@chexlizarddecor.com";
const FROM_NAME = "ChexLizardDecor";

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  // 1) 发给你（管理员）
  await sendMail({
    to: ADMIN_TO,
    subject: `[Contact] ${subject}`,
    text:
`New contact form submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`,
  });

  // 2) 自动回信给用户
  await sendMail({
    to: email,
    subject: `We received your message: ${subject}`,
    text:
`Hi ${name},

Thanks for contacting ChexLizardDecor. We’ve received your message and will reply within 24 hours.

— ChexLizardDecor
`,
  });

  return new Response(
    `<p>Thanks! Your message has been sent.</p><p><a href="/">Back to home</a></p>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
};

async function sendMail(opts: { to: string; subject: string; text: string }) {
  const res = await fetch(MAILCHANNELS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: opts.to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: opts.subject,
      content: [{ type: "text/plain", value: opts.text }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Email failed: ${res.status} ${t}`);
  }
}
