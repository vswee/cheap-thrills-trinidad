"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function IslandStamp() {
  const artworkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const artwork = artworkRef.current;
    if (!artwork) return;

    let frame = 0;
    const updateTilt = () => {
      frame = 0;
      const progress = Math.min(Math.max(window.scrollY / 700, 0), 1);
      artwork.style.setProperty("--stamp-tilt-y", `${(-13 * progress).toFixed(2)}deg`);
      artwork.style.setProperty("--stamp-tilt-x", `${(4 * progress).toFixed(2)}deg`);
      artwork.style.setProperty("--stamp-tilt-z", `${(1.5 * progress).toFixed(2)}deg`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateTilt);
    };

    updateTilt();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="island-stamp" role="img" aria-label="Swiss-inspired Island Finds stamp featuring the outline of Trinidad">
    <div className="stamp-artwork" ref={artworkRef}>
    <svg className="stamp-seal" viewBox="0 0 400 400" aria-hidden="true">
      <rect className="stamp-square-frame" x="16" y="16" width="368" height="368" />
      <rect className="stamp-square-inner" x="25" y="25" width="350" height="350" />
      <path className="stamp-square-corner" d="M43 74V43h31M326 43h31v31M43 326v31h31M326 357h31v-31" />
      <text className="stamp-square-kicker" x="48" y="64">TRINIDAD &amp; TOBAGO</text>
      <text className="stamp-square-index" x="352" y="64" textAnchor="end">LOCAL FINDS · 001</text>
      <path className="stamp-square-rule" d="M48 83h304M48 276h304" />
      <text className="stamp-center-island" x="200" y="310">ISLAND FINDS</text>
      <text className="stamp-center-coords" x="200" y="338">10° 31′ N · TRINIDAD</text>
    </svg>
    <Image className="stamp-map" src="/trinidad-outline.svg" width={104} height={82} alt="" />
    </div>
  </div>;
}
