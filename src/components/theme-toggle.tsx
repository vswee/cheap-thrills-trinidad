"use client";

import { useSyncExternalStore } from "react";

const themeChanged = "ctt-theme-changed";
function subscribe(callback: () => void) {
  window.addEventListener(themeChanged, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(themeChanged, callback);
    window.removeEventListener("storage", callback);
  };
}
function getTheme() { return document.documentElement.dataset.theme ?? "light"; }
function getServerTheme() { return "light"; }

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const dark = theme === "dark";
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("ctt-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(themeChanged));
  }
  return <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`}>{dark ? "☼" : "◐"}<span>{dark ? "Light" : "Dark"}</span></button>;
}
