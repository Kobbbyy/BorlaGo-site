import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { LandingLayout } from "@/layouts/landing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { wasteTypeMeta } from "@/lib/mock-data";
import type { WasteType } from "@/types";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — BorlaGo" },
      {
        name: "description",
        content:
          "From general waste to recycling, bulky items, hazardous and construction debris — BorlaGo collects every stream on demand or on schedule.",
      },
      { property: "og:title", content: "Services — BorlaGo" },
      {
        property: "og:description",
        content: "Every waste stream, collected on demand or on schedule.",
      },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

const plans = [
  {
    name: "On-demand",
    price: "Pay per pickup",
    desc: "Perfect for occasional clean-ups.",
    features: ["Book anytime", "Live tracking", "Choose any stream", "Secure card payment"],
    featured: false,
  },
  {
    name: "Weekly route",
    price: "from $24/mo",
    desc: "Set it once, never think about bins again.",
    features: ["Recurring schedule", "Priority dispatch", "Discounted rates", "Reschedule anytime"],
    featured: true,
  },
  {
    name: "Business",
    price: "Custom",
    desc: "For estates, offices and facilities.",
    features: ["Dedicated routes", "Volume pricing", "Compliance reports", "Account manager"],
    featured: false,
  },
];

function Services() {
  const streams = Object.entries(wasteTypeMeta) as [
    WasteType,
    (typeof wasteTypeMeta)[WasteType],
  ][];

  return (
    <LandingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Services
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Every waste stream, handled
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Pick what you need collected. We sort, route and divert responsibly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map(([key, meta]) => (
            <Card key={key} className="flex items-start justify-between gap-4 p-6">
              <div>
                <h3 className="font-display text-lg font-semibold">{meta.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{meta.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/12 px-3 py-1 text-sm font-semibold text-primary">
                ${meta.price}
              </span>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent plans
            </h2>
            <p className="mt-3 text-muted-foreground">
              No hidden fees. Cancel or reschedule anytime.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={
                  p.featured
                    ? "relative border-primary/50 p-7 shadow-glow"
                    : "p-7"
                }
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <p className="mt-4 font-display text-2xl font-bold">{p.price}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={p.featured ? "hero" : "outline"}
                  className="mt-6 w-full"
                >
                  <Link to="/register">
                    Choose {p.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
