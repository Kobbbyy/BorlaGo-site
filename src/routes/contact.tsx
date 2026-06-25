import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { LandingLayout } from "@/layouts/landing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BorlaGo" },
      {
        name: "description",
        content:
          "Get in touch with the BorlaGo team for support, partnerships or to bring smart waste collection to your city.",
      },
      { property: "og:title", content: "Contact — BorlaGo" },
      {
        property: "og:description",
        content: "Reach the BorlaGo team for support and partnerships.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const channels = [
  { icon: Mail, label: "Email", value: "hello@borlago.app" },
  { icon: Phone, label: "Phone", value: "+233 20 000 0000" },
  { icon: MapPin, label: "Office", value: "Independence Ave, Accra" },
];

function Contact() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent", {
        description: "Our team will reply within one business day.",
      });
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <LandingLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Contact
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Let's keep your city clean
            </h1>
            <p className="text-lg text-muted-foreground">
              Questions, partnerships, or bringing BorlaGo to your area — we'd
              love to hear from you.
            </p>
            <div className="space-y-3 pt-2">
              {channels.map((c) => (
                <Card key={c.label} className="flex items-center gap-4 p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="font-semibold">{c.value}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-7">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} placeholder="Tell us more..." />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={sending}>
                {sending ? "Sending..." : (<>Send message <Send className="h-4 w-4" /></>)}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </LandingLayout>
  );
}
