import { type ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function LandingLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild variant="hero" className="hidden sm:flex">
              <Link to="/register">Get started</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "overflow-hidden border-t border-border/60 md:hidden",
            open ? "max-h-96" : "max-h-0",
          )}
        >
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero" className="flex-1">
                <Link to="/register">Get started</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Changed md:grid-cols-4 to md:grid-cols-3 for perfect balancing */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <Logo />
              <p className="max-w-xs text-sm text-muted-foreground">
                Smart, on-demand waste collection. Request a pickup, track your
                collector, keep your city clean.
              </p>
            </div>
            <FooterCol
              title="Platform"
              links={[
                { label: "Services", to: "/services" },
                { label: "Book a pickup", to: "/register" },
                { label: "For collectors", to: "/register" },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "Sign in", to: "/login" },
              ]}
            />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} BorlaGo. All rights reserved.</p>
            <p>Built for cleaner cities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}