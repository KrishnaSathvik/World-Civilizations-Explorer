"use client";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "@/lib/router";
import { Search, Menu, X, Sun, Moon, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { civilizations } from "@/data/civilizations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const eras = [
  { label: "Ancient Era", slug: "ancient" },
  { label: "Medieval Era", slug: "medieval" },
  { label: "Modern Era", slug: "modern" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const isActive = (href: string) => location.pathname === href;

  const linkClass = (href: string) =>
    cn(
      "px-3 py-2 rounded-md text-sm font-heading font-medium transition-colors",
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">CE</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground hidden sm:block">
            Cultural Explorer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={linkClass("/")}>Explore</Link>

          {/* Civilizations dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-heading font-medium transition-colors",
                  location.pathname.startsWith("/civilizations") || location.pathname.startsWith("/era")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Civilizations <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-heading text-xs text-muted-foreground">By Era</DropdownMenuLabel>
              {eras.map((era) => (
                <DropdownMenuItem key={era.slug} asChild>
                  <Link to={`/era/${era.slug}`} className="font-heading text-sm cursor-pointer">
                    {era.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-heading text-xs text-muted-foreground">All Civilizations</DropdownMenuLabel>
              {civilizations.slice(0, 6).map((civ) => (
                <DropdownMenuItem key={civ.id} asChild>
                  <Link to={`/civilizations/${civ.slug}`} className="font-heading text-sm cursor-pointer">
                    <span
                      className="h-2 w-2 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }}
                    />
                    {civ.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              {civilizations.length > 6 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/#civilizations" className="font-heading text-sm text-primary cursor-pointer">
                      View all {civilizations.length} civilizations →
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/timeline" className={linkClass("/timeline")}>Timeline</Link>
          <Link to="/map" className={linkClass("/map")}>Map</Link>
          <Link to="/compare" className={linkClass("/compare")}>Compare</Link>
          <Link to="/museums" className={linkClass("/museums")}>Museums</Link>
          <Link to="/ask" className={linkClass("/ask")}>AI Assistant</Link>
        </nav>

        {/* Search + actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search civilizations, figures, events..."
              className="pl-9 w-64 h-9 font-heading text-sm bg-muted/50 border-border/50"
            />
          </form>

          <Link to="/search" className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleDark} className="h-9 w-9">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/ask">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 font-heading text-sm"
            />
          </form>
          {[
            { label: "Explore", href: "/" },
            { label: "Timeline", href: "/timeline" },
            { label: "Map", href: "/map" },
            { label: "Compare", href: "/compare" },
            { label: "Museums", href: "/museums" },
            { label: "AI Assistant", href: "/ask" },
            { label: "Search", href: "/search" },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-heading font-medium transition-colors",
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Era links in mobile */}
          <div className="pt-2 border-t border-border/60">
            <p className="px-3 text-xs font-heading text-muted-foreground uppercase tracking-wider mb-1">Eras</p>
            {eras.map((era) => (
              <Link
                key={era.slug}
                to={`/era/${era.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {era.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}