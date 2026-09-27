"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Destination = { href: string; label: string };

const defaultDestination: Destination = { href: "/#latest", label: "ALL FINDS" };

function getDestination(value: string | null): Destination {
  if (!value) return defaultDestination;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return defaultDestination;
    }

    const type = url.searchParams.get("type");
    const isFood = type ? type === "food" : url.pathname === "/food" || url.pathname.startsWith("/food-deals/");
    const isEvents = type ? type === "event" : url.pathname === "/events" || url.pathname.startsWith("/things-to-do/");
    if (url.pathname === "/" && !url.hash) url.hash = "latest";

    return {
      href: `${url.pathname}${url.search}${url.hash}`,
      label: isFood ? "ALL FOOD" : isEvents ? "ALL THINGS TO DO" : "ALL FINDS",
    };
  } catch {
    return defaultDestination;
  }
}

export function DetailBackLink() {
  const [destination, setDestination] = useState(defaultDestination);

  useEffect(() => {
    setDestination(getDestination(new URLSearchParams(window.location.search).get("from")));
  }, []);

  return <Link href={destination.href} className="back-link">← {destination.label}</Link>;
}
