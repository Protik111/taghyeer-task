const ICON_PATHS: Record<string, React.ReactNode> = {
  Facebook: (
    <path d="M13 9H11V8c0-.6.4-1 1-1h1V4.5h-1.7C9.6 4.5 8.5 5.6 8.5 7.3V9H7v2.5h1.5V19H11v-7.5h1.8L13 9Z" />
  ),
  "X (Twitter)": (
    <path
      d="M6 6l12 12M18 6 6 18"
      strokeWidth="1.4"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
    />
  ),
  Instagram: (
    <>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="16" cy="8" r="0.9" />
    </>
  ),
  LinkedIn: (
    <>
      <rect x="5" y="10" width="2.6" height="9" />
      <circle cx="6.3" cy="6.5" r="1.5" />
      <path d="M10.5 10h2.5v1.4c.5-.9 1.6-1.6 3-1.6 2.6 0 3.5 1.6 3.5 4V19h-2.7v-4.6c0-1.1-.4-1.9-1.5-1.9-1.1 0-1.6.7-1.6 1.9V19h-2.7v-9Z" />
    </>
  ),
  YouTube: (
    <>
      <rect
        x="4.5"
        y="7"
        width="15"
        height="10"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="m10.5 9.5 4 2.5-4 2.5Z" />
    </>
  ),
  TikTok: (
    <path d="M15.5 4c.3 1.8 1.4 3 3.2 3.2v2.4c-1.2 0-2.3-.4-3.2-1.1v5.6a4.9 4.9 0 1 1-4.9-4.9c.2 0 .4 0 .6.03v2.5a2.4 2.4 0 1 0 1.7 2.3V4Z" />
  ),
};

export default function SocialIcon({ label }: { label: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {ICON_PATHS[label] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}
