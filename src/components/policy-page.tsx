import Link from "next/link";
import type { ReactNode } from "react";
import { BuiltBy } from "@/components/built-by";
import { ThemeToggle } from "@/components/theme-toggle";

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="site-shell">
    <header className="topbar"><Link href="/" className="wordmark"><span className="brand-mark">ct<span>.</span></span><span>Cheap Thrills <i>Trinidad</i></span></Link><nav><Link href="/about">About</Link><Link href="/report">Report an issue</Link></nav><ThemeToggle /></header>
    <article className="standalone-page policy-page"><Link href="/about" className="back-link">← ABOUT</Link><h1>{title}</h1><p className="policy-updated">Updated 30 September 2026</p><div className="standalone-copy">{children}</div></article>
    <footer className="footer"><span className="footer-copy">© 2026 Cheap Thrills Trinidad<BuiltBy /></span><nav className="footer-nav" aria-label="Site policies"><Link href="/about">About</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav></footer>
  </main>;
}
