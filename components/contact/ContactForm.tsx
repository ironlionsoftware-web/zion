"use client";

import { useState } from "react";
import { site } from "@/content/site";

export function ContactForm() {
  const form = site.contact.form;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, message, website }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? form.errorMessage);
        return;
      }

      setSent(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError(form.errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="card border-[var(--rasta-green)] p-5 text-sm leading-relaxed text-[var(--foreground)]" role="status">
        {form.successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-12 p-6 sm:p-8" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className="font-display text-xl font-medium text-[var(--foreground)]">
        {form.heading}
      </h2>
      <p className="prose-content mt-3 text-sm">{form.lead}</p>

      <div className="mt-8 space-y-5">
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-[var(--foreground)]">
            {form.nameLabel} <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="contact-name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="form-control mt-2"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-[var(--foreground)]">
            {form.emailLabel} <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mt-2"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="block text-sm font-semibold text-[var(--foreground)]">
            {form.phoneLabel} <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control mt-2"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-semibold text-[var(--foreground)]">
            {form.messageLabel} <span className="text-[var(--rasta-red)]">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={form.messagePlaceholder}
            className="form-control mt-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? form.submittingLabel : form.submitLabel}
      </button>

      {error ? (
        <p className="mt-4 text-sm text-[var(--rasta-red)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
