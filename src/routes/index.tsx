import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Truck,
  MapPin,
  Recycle,
  ShieldCheck,
  Clock,
  Smartphone,
  CheckCircle2,
  Star,
} from "lucide-react";
import { LandingLayout } from "@/layouts/landing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroTruck from "@/assets/hero-truck.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BorlaGo — Smart Waste Collection On Demand" },
      {
        name: "description",
        content:
          "Request rubbish collection in seconds, track your collector live, and keep your city clean. BorlaGo connects residents, collectors and operators on one platform.",
      },
      { property: "og:title", content: "BorlaGo — Smart Waste Collection On Demand" },
      {
        property: "og:description",
        content: "On-demand waste collection with live tracking and trusted collectors.",
      },
      { property: "og:image", content: heroTruck },
      { name: "twitter:image", content: heroTruck },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const steps = [
  { icon: Smartphone, title: "Request", desc: "Pick your waste type, address and time window in under a minute." },
  { icon: Truck, title: "We dispatch", desc: "A nearby vetted collector accepts and heads your way." },
  { icon: MapPin, title: "Track live", desc: "Watch your collector approach in real time, end to end." },
  { icon: CheckCircle2, title: "Done", desc: "Pay securely, rate the service, and keep your space clean." },
];

const features = [
  { icon: Clock, title: "On-demand & scheduled", desc: "Book a one-off pickup or set a recurring weekly route." },
  { icon: Recycle, title: "Sorted by stream", desc: "General, recycling, organic, bulky, hazardous and construction." },
  { icon: ShieldCheck, title: "Vetted collectors", desc: "Every collector is verified, rated and tracked." },
  { icon: MapPin, title: "Live operations", desc: "Real-time tracking for residents and a control tower for ops." },
];

const stats = [
  { value: "120k+", label: "Pickups completed" },
  { value: "98%", label: "On-time rate" },
  { value: "2.4k", label: "Active collectors" },
  { value: "31", label: "Cities served" },
];

function Home() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Waste collection, reimagined
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Rubbish gone.
              <br />
              <span className="text-gradient">On your schedule.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              BorlaGo connects you to trusted trash collectors on demand. Book a
              pickup, track it live, and let the city breathe.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/register">
                  Book a pickup <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/services">Explore services</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-primary/20"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">4.9</span>
                <span>from 12k+ residents</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border shadow-elevated">
              <img
                src={heroTruck}
                alt="BorlaGo green and white waste collection truck"
                width={1600}
                height={1100}
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="absolute -bottom-5 -left-2 flex items-center gap-3 p-3.5 shadow-glow sm:-left-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Collector en route</p>
                <p className="text-sm font-semibold">Arriving in 6 min</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            From request to clean in four steps
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="relative p-6">
              <span className="absolute right-5 top-5 font-display text-4xl font-bold text-muted/40">
                0{i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Built for everyone
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                One platform. Three powerful experiences.
              </h2>
              <p className="text-muted-foreground">
                Residents request and track. Collectors run efficient routes and
                grow earnings. Operators get a real-time control tower over the
                whole network.
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/register">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <Card key={f.title} className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready for hassle-free collection?
            </h2>
            <p className="text-primary-foreground/85">
              Join thousands keeping their streets clean with BorlaGo. Your first
              pickup is only a tap away.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" variant="glass">
                <Link to="/register">Create free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
