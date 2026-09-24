"use client";

export function ShareFindButton({ title }: { title: string }) {
  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url: location.href });
      return;
    }
    await navigator.clipboard.writeText(location.href);
  }

  return <button onClick={share}>Share this find ↗</button>;
}
