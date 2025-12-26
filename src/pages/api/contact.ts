export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (!name || !email || !subject || !message) {
      return new Response("Missing fields", { status: 400 });
    }

    await sendMail({
      to: ADMIN_TO,
      subject: `[Contact] ${subject}`,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n`,
    });

    await sendMail({
      to: email,
      subject: `We received your message: ${subject}`,
      text: `Hi ${name},\n\nThanks for contacting ChexLizardDecor. We’ve received your message and will reply within 24 hours.\n\n— ChexLizardDecor\n`,
    });

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    return new Response(`Send failed: ${err?.message ?? String(err)}`, {
      status: 500,
    });
  }
};
