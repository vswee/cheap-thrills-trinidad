"use client";

import { FormEvent, useEffect, useState } from "react";
import { reportSourceStorageKey } from "@/components/report-issue-link";

type ReportSource = { url: string; title: string };

export function ReportForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [page, setPage] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  useEffect(() => {
    const pageFromQuery = new URLSearchParams(window.location.search).get("page");
    let source: ReportSource | null = null;
    try {
      const saved = window.sessionStorage.getItem(reportSourceStorageKey);
      if (saved) source = JSON.parse(saved) as ReportSource;
      window.sessionStorage.removeItem(reportSourceStorageKey);
    } catch { /* storage can be unavailable in strict privacy modes */ }
    const referrer = document.referrer;
    const sameSiteReferrer = (() => {
      try { return referrer && new URL(referrer).origin === window.location.origin ? referrer : ""; }
      catch { return ""; }
    })();
    const selected = source?.url ? source : sameSiteReferrer ? { url: sameSiteReferrer, title: "" } : null;
    const selectedUrl = pageFromQuery ?? selected?.url ?? "";
    setPage(selectedUrl);
    if (!pageFromQuery && selected?.title && selectedUrl) {
      try {
        const pathname = new URL(selectedUrl).pathname;
        if (/^\/(food|events)\/[^/]+\/?$/.test(pathname)) setSourceTitle(selected.title.replace(/\s*[·|—-]\s*Cheap Thrills Trinidad\s*$/i, ""));
      } catch { /* ignore malformed source links */ }
    }
  }, []);

  function clearPageContext() {
    setPage("");
    setSourceTitle("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: form.get("message"), page: form.get("page"), website: form.get("website") }) });
      setState(response.ok ? "sent" : "error");
      if (response.ok) {
        window.signal?.("conversion", "report_submitted", { form: "issue_report" });
        window.gtag?.("event", "generate_lead", { form_name: "issue_report" });
      }
      if (response.ok) event.currentTarget.reset();
    } catch { setState("error"); }
  }
  return <form className="report-form" onSubmit={submit}>
    <label>What needs attention?<textarea name="message" required minLength={8} maxLength={700} placeholder="Wrong price, closed venue, expired event…" /></label>
    <div className="report-page-context">
      {sourceTitle && <p className="report-source-preview">Reporting on <strong>{sourceTitle}</strong></p>}
      <label>Page link (optional)<span className="report-page-input"><input name="page" type="url" placeholder="https://…" value={page} onChange={(event) => { setPage(event.target.value); setSourceTitle(""); }} />{page && <button type="button" className="clear-report-page" aria-label="Clear page selection and report a general issue" onClick={clearPageContext}>Clear selection</button>}</span></label>
      {!page && <p className="report-general-note">General report · not linked to a specific page</p>}
    </div>
    <label className="honeypot" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="button-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send report ↗"}</button>
    <p className="form-status" aria-live="polite">{state === "sent" ? "Thanks — your report has reached us." : state === "error" ? "Couldn’t send that just now. Please try again later." : "We’ll check it as soon as we can."}</p>
  </form>;
}
