import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Truck, Clock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import authBg from "@/assets/auth-bg.jpg";

interface AuthLayoutProps {
  children: ReactNode;
  /** "admin" renders the isolated, locked-down operations console styling */
  variant?: "public" | "admin";
}

const publicHighlights = [
  { icon: Truck, title: "On-demand pickups", desc: "Book a collection in under a minute." },
  { icon: Clock, title: "Live tracking", desc: "Follow your collector in real time." },
  { icon: ShieldCheck, title: "Trusted network", desc: "Vetted, rated collectors only." },
];

export function AuthLayout({ children, variant = "public" }: AuthLayoutProps) {
  const isAdmin = variant === "admin";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          width={1200}
          height={1400}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/85 to-background" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo size="md" onDark />
          {isAdmin ? (
            <div className="max-w-md space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" /> Restricted access
              </span>
              <h2 className="font-display text-4xl font-bold leading-tight text-white">
                Operations Console
              </h2>
              <p className="text-muted-foreground">
                Monitor fleets, manage collectors, oversee every booking and keep
                the city moving. This entrance is for authorised staff only.
              </p>
            </div>
          ) : (
            <div className="max-w-md space-y-6">
              <h2 className="font-display text-4xl font-bold leading-tight text-white">
                Cleaner cities,
                <br />
                one pickup at a time.
              </h2>
              <ul className="space-y-4">
                {publicHighlights.map((h) => (
                  <li key={h.title} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <h.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{h.title}</p>
                      <p className="text-sm text-muted-foreground">{h.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BorlaGo
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col bg-background">
        <div className="flex items-center justify-between p-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo size="md" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
