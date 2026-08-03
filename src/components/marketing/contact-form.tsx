"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitContactInquiryAction } from "@/app/(marketing)/contact/actions";
import { contactInquirySchema, type ContactInquiryInput } from "@/lib/validations/contact";

const INQUIRY_TYPES: { value: ContactInquiryInput["inquiryType"]; label: string }[] = [
  { value: "candidate", label: "I'm a candidate" },
  { value: "employer", label: "I'm hiring (employer / client)" },
  { value: "general", label: "General enquiry" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ContactInquiryInput>({
    defaultValues: {
      inquiryType: "candidate",
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactInquiryInput) {
    const parsed = contactInquirySchema.safeParse(values);
    if (!parsed.success) {
      form.setError("root", {
        message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      });
      return;
    }

    const result = await submitContactInquiryAction(parsed.data);
    if (!result.ok) {
      form.setError("root", { message: result.message });
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        Thanks — we&apos;ll be in touch shortly.
      </p>
    );
  }

  return (
    <form
      className="not-prose space-y-4 rounded-xl border border-[var(--pp-border)] bg-white p-5 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <fieldset>
        <legend className="text-sm font-medium">I am reaching out as</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {INQUIRY_TYPES.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value={option.value}
                className="h-4 w-4"
                {...form.register("inquiryType")}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            className="field-input mt-1"
            autoComplete="name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="field-error">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="field-input mt-1"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="field-error">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-phone" className="text-sm font-medium">
            Phone (optional)
          </label>
          <input
            id="contact-phone"
            className="field-input mt-1"
            autoComplete="tel"
            {...form.register("phone")}
          />
        </div>
        <div>
          <label htmlFor="contact-company" className="text-sm font-medium">
            Company (optional)
          </label>
          <input
            id="contact-company"
            className="field-input mt-1"
            autoComplete="organization"
            {...form.register("company")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          className="field-input mt-1"
          rows={5}
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p className="field-error">{form.formState.errors.message.message}</p>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="field-error" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
