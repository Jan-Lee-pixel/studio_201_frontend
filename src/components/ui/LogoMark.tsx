type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 10 C 12 2, 28 2, 38 10 S 64 18, 74 10 S 100 2, 118 10" />
      <path d="M2 20 C 12 12, 28 12, 38 20 S 64 28, 74 20 S 100 12, 118 20" />
      <path d="M2 30 C 12 22, 28 22, 38 30 S 64 38, 74 30 S 100 22, 118 30" />
    </svg>
  );
}
