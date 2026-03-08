import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { civilizations } from "@/data/civilizations";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-sm uppercase tracking-[0.2em] text-gold mb-6"
          >
            Interactive Cultural History Platform
          </motion.p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground mb-6">
            Explore{" "}
            <span className="text-primary">10,000 Years</span>
            <br />
            of Human Civilization
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Journey through the world's greatest civilizations with live data from Wikipedia,
            museum collections, and AI-powered cultural insights.
          </p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative max-w-xl mx-auto mb-12"
            action="/search"
            method="get"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search civilizations, key figures, events..."
              className="pl-12 pr-28 h-12 sm:h-14 text-sm sm:text-base font-body rounded-xl border-border/80 bg-card shadow-lg shadow-primary/5"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 sm:h-10 px-3 sm:px-4 bg-primary text-primary-foreground rounded-lg font-heading text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              Explore
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </motion.form>

          {/* Civilization quick-links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {civilizations.slice(0, 6).map((civ) => (
              <Link
                key={civ.id}
                to={`#${civ.slug}`}
                className="px-3 py-1.5 rounded-full border border-border/60 bg-card/50 text-xs font-heading font-medium text-muted-foreground hover:text-foreground hover:border-gold/40 hover:bg-gold/5 transition-all"
              >
                {civ.name}
              </Link>
            ))}
            <span className="px-3 py-1.5 text-xs font-heading text-muted-foreground">
              +{civilizations.length - 6} more
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
