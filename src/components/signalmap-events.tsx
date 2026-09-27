"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    signal?: (type: "event" | "conversion", name: string, metadata?: Record<string, string | boolean>) => void;
    dataLayer?: IArguments[];
    gtag?: (...args: (string | Date | Record<string, string | boolean>)[]) => void;
  }
}

function sendEvent(label: string, metadata: Record<string, string | boolean> = {}) {
  const page = window.location.pathname;
  window.signal?.("event", "cta_click", { label, page, ...metadata });
  window.gtag?.("event", "cta_click", { cta_label: label, page_path: page, ...metadata });
}

export function SignalMapEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest<HTMLElement>("[data-signal-label]");
      if (control?.dataset.signalLabel) {
        sendEvent(control.dataset.signalLabel);
        return;
      }
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link?.pathname === "/map") sendEvent("map_open");
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const label = form.dataset.signalLabel;
      if (label) sendEvent(label);
    };

    let searchTimer: number | undefined;
    const onInput = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches("[data-signal-search]")) return;
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => sendEvent(input.dataset.signalSearch || "directory_search", { has_query: Boolean(input.value.trim()) }), 900);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("input", onInput, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("input", onInput, true);
      window.clearTimeout(searchTimer);
    };
  }, []);

  return null;
}
