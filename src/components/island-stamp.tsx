import Image from "next/image";

export function IslandStamp() {
  return <div className="island-stamp" role="img" aria-label="Island Finds seal featuring the outline of Trinidad and Tobago">
    <svg className="stamp-seal" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <path id="stamp-top-arc" d="M 48 200 C 48 116 116 48 200 48 C 284 48 352 116 352 200" />
        <path id="stamp-bottom-arc" d="M 352 200 C 352 284 284 352 200 352 C 116 352 48 284 48 200" />
      </defs>
      <circle className="stamp-ring" cx="200" cy="200" r="190" />
      <circle className="stamp-inner-ring" cx="200" cy="200" r="180" />
      <circle className="stamp-center-ring" cx="200" cy="200" r="140" />
      <text className="stamp-arc-text"><textPath href="#stamp-top-arc" startOffset="50%" textAnchor="middle">TRINIDAD &amp; TOBAGO · GOOD FINDS</textPath></text>
      <text className="stamp-arc-text stamp-arc-bottom"><textPath href="#stamp-bottom-arc" startOffset="50%" textAnchor="middle">LOCAL PICKS · ISLAND WIDE</textPath></text>
      <path className="stamp-seal-mark" d="M200 12l4 8h9l-7 6 3 9-9-5-9 5 3-9-7-6h9zM200 365l3 6h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z" />
      <text className="stamp-center-island" x="200" y="285">ISLAND</text>
      <text className="stamp-center-finds" x="200" y="311">FINDS</text>
      <text className="stamp-center-coords" x="200" y="335">10° 31′ N</text>
    </svg>
    <Image className="stamp-map" src="/trinidad-outline.svg" width={104} height={82} alt="" />
  </div>;
}
