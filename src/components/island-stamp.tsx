export function IslandStamp() {
  return (
    <svg
      className="island-stamp"
      viewBox="0 0 280 300"
      role="img"
      aria-label="Island finds, 10 degrees 31 minutes north"
    >
      <path className="stamp-frame" d="M22 18h236v264H22z" />
      <path className="stamp-frame-inner" d="M31 27h218v246H31z" />
      <text className="stamp-kicker" x="140" y="54">A FIELD GUIDE TO</text>
      <text className="stamp-word" x="140" y="87">ISLAND</text>
      <text className="stamp-word" x="140" y="116">FINDS</text>
      <path className="stamp-rule" d="M72 133h136" />
      <g className="stamp-map" transform="translate(94 147)">
        <path d="M49 1 62 8 67 17 76 22 73 31 80 39 75 49 79 56 72 64 75 73 68 82 72 91 65 100 67 109 60 118 62 128 55 137 52 150 44 155 39 148 41 137 35 128 38 118 30 109 35 98 27 89 33 78 25 69 32 59 25 50 31 42 26 33 34 27 34 19 41 15 42 8Z" />
        <path className="stamp-island-line" d="m9 35 27 3m-27 7 30 2m-29 7 31 2m-30 8 31 2m-28 8 26 2m-24 9 25 1m-21 9 22 1m-18 9 18 1m-15 10 15 1m-12 9 11 1m-8 9 7 1" />
        <circle className="stamp-island-dot" cx="72" cy="22" r="2.4" />
      </g>
      <text className="stamp-coordinates" x="140" y="256">10° 31′ N · TRINIDAD</text>
    </svg>
  );
}
