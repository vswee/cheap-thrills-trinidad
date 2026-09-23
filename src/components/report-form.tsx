"use client";

import { FormEvent, useState } from "react";

export function ReportForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: form.get("message"), page: form.get("page"), website: form.get("website") }) });
      setState(response.ok ? "sent" : "error");
      if (response.ok) event.currentTarget.reset();
    } catch { setState("error"); }
  }
  return <form className="report-form" onSubmit={submit}>
    <label>What needs attention?<textarea name="message" required minLength={8} maxLength={700} placeholder="Wrong price, closed venue, expired event…" /></label>
    <label>Page link (optional)<input name="page" type="url" placeholder="https://…" /></label>
    <label className="honeypot" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="button-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send report ↗"}</button>
    <p className="form-status" aria-live="polite">{state === "sent" ? "Thanks — your report has reached us." : state === "error" ? "Couldn’t send that just now. Please try again later." : "We’ll check it as soon as we can."}</p>
  </form>;
}
