export function IslandStamp() {
  return (
    <svg
      className="island-stamp"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Island finds, 10 degrees 31 minutes north"
    >
      <circle className="stamp-ring" cx="50" cy="50" r="47" />
      <circle className="stamp-inner-ring" cx="50" cy="50" r="42" />
      <path className="stamp-tick" d="M50 3v5M97 50h-5M50 97v-5M3 50h5M17 17l4 4M83 17l-4 4M83 83l-4-4M17 83l4-4" />
      <text className="stamp-island" x="50" y="40">ISLAND</text>
      <text className="stamp-finds" x="50" y="55">FINDS</text>
      <path className="stamp-rule" d="M31 64h14m10 0h14" />
      <path className="stamp-diamond" d="m50 61.5 2.5 2.5-2.5 2.5-2.5-2.5z" />
      <text className="stamp-coordinates" x="50" y="76">10° 31′ N</text>
    </svg>
  );
}
