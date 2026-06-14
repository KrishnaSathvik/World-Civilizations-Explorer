import Index from "@/views/Index";

// Home page. SEO metadata + WebSite/Organization JSON-LD come from the root
// layout. The interactive hero, grid and map render as client islands.
export default function HomeRoute() {
  return <Index />;
}
