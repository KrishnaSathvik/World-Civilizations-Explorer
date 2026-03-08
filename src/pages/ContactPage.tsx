import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
    toast({ title: "Message sent!", description: "Thank you for reaching out. We'll get back to you soon." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-20 md:py-32 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Message Sent!</h1>
          <p className="font-body text-muted-foreground max-w-md mx-auto mb-6">
            Thank you for reaching out. We'll review your message and get back to you as soon as possible.
          </p>
          <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="font-heading">
            Send Another Message
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <Breadcrumbs items={[{ label: "Contact" }]} />
            <ScrollReveal>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl text-lg">
                Have a question, suggestion, or found an issue? We'd love to hear from you.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {/* Info cards */}
              <div className="space-y-6">
                <ScrollReveal>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <Mail className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-heading text-sm font-bold text-foreground mb-1">Email</h3>
                    <p className="font-body text-sm text-muted-foreground">hello@culturalexplorer.com</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <MapPin className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-heading text-sm font-bold text-foreground mb-1">Location</h3>
                    <p className="font-body text-sm text-muted-foreground">Open source — everywhere</p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Form */}
              <div className="md:col-span-2">
                <ScrollReveal delay={0.1}>
                  <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-heading text-sm">Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          className="font-heading"
                          maxLength={100}
                        />
                        {errors.name && <p className="text-xs text-destructive font-heading">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-heading text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@example.com"
                          className="font-heading"
                          maxLength={255}
                        />
                        {errors.email && <p className="text-xs text-destructive font-heading">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-heading text-sm">Subject</Label>
                      <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                        <SelectTrigger className="font-heading">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general" className="font-heading">General Inquiry</SelectItem>
                          <SelectItem value="content" className="font-heading">Content Correction</SelectItem>
                          <SelectItem value="suggestion" className="font-heading">Suggestion</SelectItem>
                          <SelectItem value="bug" className="font-heading">Bug Report</SelectItem>
                          <SelectItem value="contribution" className="font-heading">Contribution</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-xs text-destructive font-heading">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-heading text-sm">Message</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us what's on your mind..."
                        className="font-heading min-h-[140px]"
                        maxLength={2000}
                      />
                      <div className="flex justify-between">
                        {errors.message && <p className="text-xs text-destructive font-heading">{errors.message}</p>}
                        <p className="text-xs text-muted-foreground font-heading ml-auto">{form.message.length}/2000</p>
                      </div>
                    </div>

                    <Button type="submit" className="w-full font-heading gap-2">
                      <Send className="h-4 w-4" /> Send Message
                    </Button>
                  </form>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
