import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchWikipediaSummary, fetchWikipediaImages } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Baby, Skull, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryEventPage() {
  const [params] = useSearchParams();
  const year = params.get("year") || "";
  const text = params.get("text") || "";
  const type = params.get("type") || "event"; // event, birth, death
  const wikiTitle = params.get("wiki") || "";

  // Try to get Wikipedia info for the event
  const { data: wikiData, isLoading: wikiLoading } = useQuery({
    queryKey: ["wiki-event", wikiTitle],
    queryFn: () => fetchWikipediaSummary(wikiTitle),
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const { data: wikiImages } = useQuery({
    queryKey: ["wiki-event-images", wikiTitle],
    queryFn: () => fetchWikipediaImages(wikiTitle),
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const typeIcon = type === "birth" ? <Baby className="h-5 w-5" /> : type === "death" ? <Skull className="h-5 w-5" /> : <Calendar className="h-5 w-5" />;
  const typeLabel = type === "birth" ? "Birth" : type === "death" ? "Death" : "Historical Event";
  const typeColor = type === "birth" ? "text-green-600" : type === "death" ? "text-red-500" : "text-primary";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "This Day in History", href: "/#history" },
            { label: `${year} — ${text.slice(0, 40)}...` },
          ]}
        />

        <Link to="/#history">
          <Button variant="ghost" size="sm" className="mb-6 font-heading text-xs gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to This Day in History
          </Button>
        </Link>

        <div className="max-w-3xl">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ${typeColor}`}>
              {typeIcon}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold mb-2">
                {year}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {text}
              </h1>
              <p className="text-sm font-heading text-muted-foreground mt-2">{typeLabel}</p>
            </div>
          </div>

          {/* Wikipedia content */}
          {wikiTitle && (
            <section className="mb-10">
              {wikiLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : wikiData ? (
                <div className="space-y-6">
                  {/* Thumbnail + extract */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {wikiData.thumbnail && (
                      <img
                        src={wikiData.thumbnail.source}
                        alt={wikiData.title}
                        className="w-full md:w-64 h-48 object-cover rounded-xl border border-border/60"
                      />
                    )}
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground mb-3">{wikiData.title}</h2>
                      <p className="font-body text-muted-foreground leading-relaxed">{wikiData.extract}</p>
                    </div>
                  </div>

                  {/* Additional images */}
                  {wikiImages && wikiImages.length > 0 && (
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Related Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {wikiImages.slice(0, 6).map((img, i) => (
                          <img
                            key={i}
                            src={img.source}
                            alt={img.title}
                            className="w-full h-32 object-cover rounded-lg border border-border/60"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wikipedia link */}
                  <a
                    href={`https://en.wikipedia.org/wiki/${wikiTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                  >
                    Read full article on Wikipedia <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  No additional information found for this event.
                </p>
              )}
            </section>
          )}

          {/* If no wiki title, show basic info */}
          {!wikiTitle && (
            <div className="p-6 rounded-xl border border-border/60 bg-card">
              <p className="font-body text-muted-foreground">
                This historical {typeLabel.toLowerCase()} occurred in {year}. Click the links below to learn more from external sources.
              </p>
              <a
                href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(`${year} ${text}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
              >
                Search on Wikipedia <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
