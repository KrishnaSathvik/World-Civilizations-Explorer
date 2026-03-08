import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AskPage from "./pages/AskPage";
import CivilizationHub from "./pages/CivilizationHub";
import MapPage from "./pages/MapPage";
import TimelinePage from "./pages/TimelinePage";
import ComparePage from "./pages/ComparePage";
import EraPage from "./pages/EraPage";
import FigurePage from "./pages/FigurePage";
import TopicPage from "./pages/TopicPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import { ChatWidget } from "@/components/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/civilizations/:slug" element={<CivilizationHub />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/era/:slug" element={<EraPage />} />
          <Route path="/figures/:slug" element={<FigurePage />} />
          <Route path="/topics/:slug" element={<TopicPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
