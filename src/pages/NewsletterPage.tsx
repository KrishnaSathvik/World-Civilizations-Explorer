import { useState } from "react";
import { Mail, Sparkles, BookOpen, Clock, Globe, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);

const benefits = [
  { icon: BookOpen, title: "Weekly Discoveries", description: "Curated articles on civilizations, figures, and events you won't find elsewhere." },
  { icon: Clock, title: "This Week in History", description: "A digest of historical events that happened this week across all eras." },
  { icon: Globe, title: "New Civilizations", description: "Be the first to know when we add new civilizations and features to the platform." },
  { icon: Sparkles, title: "AI Insights", description: "Exclusive AI-generated deep dives into historical connections and patterns." },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setSubscribed(true);
    toast({ title: "Subscribed!", description: "You'll receive our next newsletter at your inbox." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <Breadcrumbs items={[{ label: "Newsletter" }]} />
            <ScrollReveal>
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs font-heading font-medium text-primary">Newsletter</span>
                </div>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  History in Your Inbox
                </h1>
                <p className="font-body text-muted-foreground text-lg leading-relaxed">
                  Join thousands of history enthusiasts who receive our weekly newsletter.
                  Get curated stories, new civilization additions, and AI-powered historical insights.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Subscribe form */}
        <section className="py-12 md:py-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-lg mx-auto text-center">
                {subscribed ? (
                  <div className="rounded-xl border border-border bg-card p-10">
                    <CheckCircle className="h-14 w-14 text-primary mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">You're In!</h2>
                    <p className="font-body text-muted-foreground mb-6">
                      Welcome aboard. You'll receive our next newsletter with the latest historical discoveries and insights.
                    </p>
                    <Button variant="outline" onClick={() => { setSubscribed(false); setEmail(""); }} className="font-heading">
                      Subscribe Another Email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-8 space-y-4">
                    <Mail className="h-10 w-10 text-primary mx-auto" />
                    <h2 className="font-display text-xl font-bold text-foreground">Subscribe Now</h2>
                    <p className="font-body text-sm text-muted-foreground">Free, weekly, unsubscribe anytime.</p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="font-heading flex-1"
                        maxLength={255}
                      />
                      <Button type="submit" className="font-heading shrink-0">Subscribe</Button>
                    </div>
                    {error && <p className="text-xs text-destructive font-heading">{error}</p>}
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/[0.02]">
          <div className="container">
            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                What You'll Get
              </h2>
            </ScrollReveal>
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <motion.div key={b.title} variants={staggerItem}>
                  <div className="rounded-xl border border-border bg-card p-6 text-center h-full">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground mb-2">{b.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
