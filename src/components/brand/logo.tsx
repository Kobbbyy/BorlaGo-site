import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  to?: string;
  /** Adapts colors for dark backgrounds regardless of theme */
  onDark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { text: "text-lg", mark: "h-7 w-7", icon: "h-4 w-4" },
  md: { text: "text-2xl", mark: "h-9 w-9", icon: "h-5 w-5" },
  lg: { text: "text-3xl", mark: "h-11 w-11", icon: "h-6 w-6" },
};

function Mark({ className, iconClass }: { className: string; iconClass: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gradient-brand shadow-glow",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className={cn("text-primary-foreground", iconClass)}>
        <path
          d="M12 3c2.5 2.2 4 4.4 4 7a4 4 0 1 1-8 0c0-2.6 1.5-4.8 4-7Z"
          fill="currentColor"
        />
        <path
          d="M4 14c2.4 0 3.6 1 4.4 2.6M20 14c-2.4 0-3.6 1-4.4 2.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, to = "/", onDark, size = "md" }: LogoProps) {
  const s = sizes[size];
  const goColor = onDark ? "text-white" : "text-foreground";
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <Mark className={s.mark} iconClass={s.icon} />
      <span className={cn("font-display font-extrabold tracking-tight", s.text)}>
        <span className="italic text-primary">Borla</span>
        <span className={goColor}>Go</span>
      </span>
    </Link>
  );
}
