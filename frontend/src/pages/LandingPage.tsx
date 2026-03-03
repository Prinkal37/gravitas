import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { GravitasLogo } from "@/components/GravitasLogo";
import { PRICING_TIERS } from "@/services/api";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <GravitasLogo />
          <nav className="flex items-center gap-6">
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-28 pb-24">
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-6">
            LinkedIn Authority System
          </p>
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.1] mb-8 text-foreground">
            Build executive authority<br />on LinkedIn. Systematically.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
            Gravitas transforms your expertise into consistent, high-quality LinkedIn content — without the creative overhead. Built for senior B2B professionals.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2">
              Start building authority
              <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-outline">Sign in</Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="divider mb-16" />
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              title: "Authority-grade content",
              desc: "Every post is calibrated to position you as a domain expert — not a content marketer.",
            },
            {
              title: "Brand-aligned by default",
              desc: "Your niche, tone, and offer are embedded into every generation. No prompt engineering required.",
            },
            {
              title: "Built for senior professionals",
              desc: "No templates, no fluff. Clean, direct content that respects your audience's intelligence.",
            },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="text-base font-semibold mb-2 text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-8 pb-28">
        <div className="divider mb-16" />
        <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
        <p className="text-muted-foreground text-sm mb-10">
          Straightforward. No hidden fees.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`surface rounded-sm p-6 ${
                tier.id === "growth" ? "border-primary/50" : ""
              }`}
            >
              {tier.id === "growth" && (
                <p className="text-xs text-primary font-medium mb-3 tracking-wide uppercase">
                  Most popular
                </p>
              )}
              <h3 className="text-base font-semibold mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={tier.id === "growth" ? "btn-primary w-full text-center block" : "btn-outline w-full text-center block"}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-8 py-8 flex items-center justify-between">
          <GravitasLogo />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Gravitas. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
