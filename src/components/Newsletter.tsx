import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/ScrollReveal";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Subscribed!",
      description: "Welcome to Cultural Explorer. Stay curious.",
    });
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-gold" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Stay Curious
            </h2>
            <p className="font-body text-muted-foreground mb-8">
              Get weekly cultural insights, newly discovered artifacts, and historical deep-dives delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 font-heading bg-card border-border/60"
              />
              <Button type="submit" className="h-12 px-6 font-heading gap-2">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
