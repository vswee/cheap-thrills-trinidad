"use client";

import Image from "next/image";
import { useState } from "react";

type BrandAssetProps = {
  src: string | null;
  source: "local" | "remote" | null;
  width: number;
  height: number;
  mode: "standard" | "dark";
  monogram: string;
};

/* eslint-disable @next/next/no-img-element -- Official brand CDNs are vetted by the content worker. */
export function BrandAsset({ src, source, width, height, mode, monogram }: BrandAssetProps) {
  const [failed, setFailed] = useState(false);
  const mark = !src || failed
    ? <span className="brand-monogram" aria-hidden="true">{monogram}</span>
    : source === "local"
    ? <Image className="brand-logo-image" src={src} alt="" width={width} height={height} unoptimized onError={() => setFailed(true)} />
    : <img className="brand-logo-image" src={src} alt="" width={width} height={height} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;

  return <span className={`brand-emblem ${mode === "dark" ? "brand-emblem-dark" : ""}`}>{mark}</span>;
}
