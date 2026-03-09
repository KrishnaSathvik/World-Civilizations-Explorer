import { Link } from "react-router-dom";

const navLinks = [
  { label: "Explore", href: "/" },
  { label: "Timeline", href: "/timeline" },
  { label: "Map", href: "/map" },
  { label: "Compare", href: "/compare" },
  { label: "AI Assistant", href: "/ask" },
  { label: "Search", href: "/search" },
];

const utilLinks = [
  { label: "About", href: "/about" },
  { label: "Contribute", href: "/contribute" },
  { label: "Contact", href: "/contact" },
  { label: "Newsletter", href: "/newsletter" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">CE</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Cultural Explorer
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-sm leading-relaxed">
              An open-source interactive platform for exploring human cultural history,
              powered by public APIs and AI-driven insights.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Navigate</h4>
            <ul className="space-y-2">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-heading text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Project</h4>
            <ul className="space-y-2">
              {utilLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-heading text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Data</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/sources"
                  className="font-heading text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Data Sources
                </Link>
              </li>
              <li>
                <Link
                  to="/museums"
                  className="font-heading text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Museum Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-heading text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cultural Explorer. Built with open data.
          </p>
          <Link
            to="/sources"
            className="font-heading text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all 12 data sources →
          </Link>
        </div>
      </div>
    </footer>
  );
}
