import { Link } from "react-router-dom";
import { Globe, BookOpen, Users, Database, Heart, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { motion } from "framer-motion";

const dataSources = [
  { name: "Wikipedia", url: "https://en.wikipedia.org", description: "Encyclopedic articles, summaries, and images for civilizations, figures, and topics via the REST API." },
  { name: "Wikidata", url: "https://www.wikidata.org", description: "Structured knowledge graph data for historical entities — dates, coordinates, relationships, and classifications via SPARQL." },
  { name: "Wikimedia Commons", url: "https://commons.wikimedia.org", description: "90M+ freely usable media files including historical photographs, maps, artwork reproductions, and archaeological site photos." },
  { name: "Metropolitan Museum of Art", url: "https://metmuseum.github.io", description: "Over 470,000 artworks with high-res images from one of the world's largest art museums. Free, no key required." },
  { name: "Art Institute of Chicago", url: "https://api.artic.edu/docs", description: "300,000+ artworks spanning 5,000 years of creativity. Free IIIF image access, no key required." },
  { name: "Smithsonian Open Access", url: "https://www.si.edu/openaccess", description: "Millions of digital items from 21 museums including American history, natural history, and air & space artifacts." },
  { name: "Harvard Art Museums", url: "https://harvardartmuseums.org", description: "230,000+ objects with academic-quality metadata. Strong in Asian and European art collections." },
  { name: "Rijksmuseum", url: "https://data.rijksmuseum.nl", description: "Dutch Golden Age masterworks and European collection. Key-free Linked Art API with full open data access." },
  { name: "Muffinlabs History API", url: "https://history.muffinlabs.com", description: "Wikipedia-sourced daily history data powering the 'This Day in History' feature." },
];

const values = [
  { icon: Globe, title: "Open Access", description: "All content is freely available. We believe knowledge about human history belongs to everyone." },
  { icon: BookOpen, title: "Educational Focus", description: "Designed for students, educators, and curious minds seeking to understand our shared past." },
  { icon: Users, title: "Community Driven", description: "Built on open data and community contributions from around the world." },
  { icon: Database, title: "Data Integrity", description: "Information is sourced from peer-reviewed and established public knowledge bases." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <Breadcrumbs items={[{ label: "About" }]} />
            <ScrollReveal>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                About Cultural Explorer
              </h1>
              <p className="font-body text-muted-foreground max-w-3xl text-lg leading-relaxed">
                Cultural Explorer is an open-source interactive platform for exploring human cultural history.
                We bring together data from public APIs, academic sources, and AI-driven insights to create
                an engaging way to discover civilizations, key figures, and pivotal events that shaped our world.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 md:py-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="font-body text-muted-foreground text-lg leading-relaxed">
                  To make the richness of human cultural history accessible, interactive, and engaging for everyone.
                  We believe that understanding our past is essential to building a better future, and that technology
                  can transform how we learn about and connect with history.
                </p>
              </div>
            </ScrollReveal>

            {/* Values */}
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <motion.div key={v.title} variants={staggerItem}>
                  <div className="rounded-xl border border-border bg-card p-6 h-full">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <v.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground mb-2">{v.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Data Sources */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-primary/[0.02]">
          <div className="container">
            <ScrollReveal>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Data Sources</h2>
            </ScrollReveal>
            <StaggerContainer className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {dataSources.map((src) => (
                <motion.div key={src.name} variants={staggerItem}>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all h-full">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">{src.name}</h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{src.description}</p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Credits */}
        <section className="py-12 md:py-20">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <Heart className="h-8 w-8 text-destructive mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Built with Love</h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  Cultural Explorer is built with React, TypeScript, and Tailwind CSS. It uses Wikipedia's REST API
                  for content and is powered by AI for the cultural assistant feature. The project is designed to be
                  fast, accessible, and beautiful.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Wikipedia API", "AI Assistant"].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-muted text-xs font-heading font-medium text-muted-foreground">
                      {tech}
                    </span>
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
