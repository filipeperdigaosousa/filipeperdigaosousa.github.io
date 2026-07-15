interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="12" fill="#0f1116" />
      <path
        d="M18 20 L34 32 L18 44"
        stroke="#007AFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="34" y="41" width="18" height="6" rx="3" fill="#32d74b" />
    </svg>
  );
}
