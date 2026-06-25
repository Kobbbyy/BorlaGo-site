import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Leaf, Users, ArrowRight } from "lucide-react";
import { LandingLayout } from "@/layouts/landing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BorlaGo" },
      {
        name: "description",
        content:
          "BorlaGo is on a mission to make waste collection effortless, transparent and sustainable for every city.",
      },
      { property: "og:title", content: "About — BorlaGo" },
      {
        property: "og:description",
        content: "Our mission to make waste collection effortless and sustainable.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const values = [
  { icon: Target, title: "Reliability first", desc: "Every pickup is tracked, timed and accountable — no missed collections." },
  { icon: Leaf, title: "Eco at the core", desc: "We route by stream and divert recyclables and organics from landfill." },
  { icon: Users, title: "Fair for collectors", desc: "Transparent payouts and steady work for our collector network." },
];

const milestones = [
  { year: "2023", text: "BorlaGo founded to fix unreliable city collection." },
  { year: "2024", text: "Launched live tracking and the collector marketplace." },
  { year: "2025", text: "Scaled to 31 cities with a real-time operations console." },
  { year: "2026", text: "Crossed 120,000 completed pickups and growing." },
];

function About() {
  return (
    <LandingLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            About BorlaGo
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cleaner cities, built on trust and technology
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            We connect residents who need waste collected with vetted collectors
            ready to work — all coordinated by a smart operations platform that
            keeps everyone in sync.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <Card key={v.title} className="p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight">Our journey</h2>
          <div className="mt-8 space-y-6">
            {milestones.map((m) => (
              <div key={m.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="font-display text-sm font-bold text-primary">
                    {m.year}
                  </span>
                  <span className="mt-1 h-full w-px bg-border" />
                </div>
                <p className="pb-4 text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-center justify-between gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-display text-xl font-semibold">Want to collect with us?</h3>
            <p className="text-sm text-muted-foreground">
              Join the BorlaGo collector network and start earning.
            </p>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/register">
              Become a collector <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </LandingLayout>
  );
}
