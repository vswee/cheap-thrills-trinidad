"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const reportSourceStorageKey = "cheap-thrills-report-source";

export function ReportIssueLink({ children, className }: { children: ReactNode; className?: string }) {
  return <Link href="/report" className={className} data-signal-label="report_issue_open" onClick={() => {
    try {
      const source = { url: window.location.href, title: document.title };
      window.sessionStorage.setItem(reportSourceStorageKey, JSON.stringify(source));
    } catch { /* navigation should still work when browser storage is disabled */ }
  }}>{children}</Link>;
}
