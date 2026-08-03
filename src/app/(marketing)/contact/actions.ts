"use server";

import { createClient } from "@/lib/supabase/server";
import { logDbError, mapDbError } from "@/lib/errors/map-db-error";
import { logServerError } from "@/lib/logging/server-error";
import { contactInquirySchema } from "@/lib/validations/contact";
import { sendContactInquiryEmail } from "@/lib/email/contact-inquiry";

export type ContactActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitContactInquiryAction(
  input: unknown,
): Promise<ContactActionResult> {
  const parsed = contactInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    inquiry_type: parsed.data.inquiryType,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message,
  });

  if (error) {
    logDbError("contact.submitInquiry", error);
    return { ok: false, message: mapDbError(error).message };
  }

  try {
    await sendContactInquiryEmail(parsed.data);
  } catch (emailError) {
    logServerError("contact.submitInquiry.email", emailError);
  }

  return { ok: true, message: "Thanks — we'll be in touch shortly." };
}
