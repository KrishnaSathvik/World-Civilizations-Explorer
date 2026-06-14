"use client";
import { Link } from "@/lib/router";
import { GitPullRequest, FileText, MessageSquare, Globe, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ways = [
  {
    icon: FileText,
    title: "Improve Content",
    description: "Help us refine civilization descriptions, timelines, and key figure biographies. Spot an error? Let us know!",
    steps: ["Identify inaccurate or incomplete content", "Describe the correction needed", "Submit via the contact form"],
  },
  {
    icon: Globe,
    title: "Suggest Civilizations",
    description: "Know of a civilization or culture we haven't covered? We'd love to expand our collection.",
    steps: ["Provide the civilization name and region", "Include date range and key figures", "Share reliable source links"],
  },
  {
    icon: MessageSquare,
    title: "Report Issues",
    description: "Found a bug, broken link, or display issue? Help us keep the platform running smoothly.",
    steps: ["Describe what you experienced", "Include the page URL if possible", "Mention your browser and device"],
  },
  {
    icon: GitPullRequest,
    title: "Technical Contributions",
    description: "Developers can help improve the platform's features, performance, and accessibility.",
    steps: ["Review our technology stack", "Identify areas for improvement", "Reach out with your proposal"],
  },
];

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <Breadcrumbs items={[{ label: "Contribute" }]} />
            <ScrollReveal>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                Contribute
              </h1>
              <p className="font-body text-muted-foreground max-w-3xl text-lg leading-relaxed">
                Cultural Explorer is a community effort. Whether you're a historian, student, developer, or simply
                passionate about history, there are many ways to help improve this platform.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Ways to contribute */}
        <section className="py-12 md:py-20">
          <div className="container">
            <StaggerContainer className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {ways.map((way) => (
                <motion.div key={way.title} variants={staggerItem}>
                  <div className="rounded-xl border border-border bg-card p-6 h-full">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <way.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{way.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">{way.description}</p>
                    <ul className="space-y-2">
                      {way.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="font-heading text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>

            <ScrollReveal delay={0.2}>
              <div className="text-center mt-10">
                <Link to="/contact">
                  <Button className="font-heading gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Guidelines */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/[0.02]">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Contribution Guidelines</h2>
                <div className="space-y-4">
                  {[
                    "Cite reliable, peer-reviewed, or well-established sources for any factual claims.",
                    "Be respectful and culturally sensitive when describing civilizations and historical events.",
                    "Avoid personal opinions or speculative interpretations — stick to documented history.",
                    "Ensure all content is original or properly attributed to its source.",
                    "Follow accessibility best practices for any design or code contributions.",
                  ].map((guideline, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border/60">
                      <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-heading font-bold text-primary">{i + 1}</span>
                      </span>
                      <p className="font-body text-sm text-muted-foreground">{guideline}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}