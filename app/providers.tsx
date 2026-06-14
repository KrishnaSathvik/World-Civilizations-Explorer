"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ChatWidget } from "@/components/ChatWidget";

export function Providers({ children }: { children: ReactNode }) {
  // Create the client once per browser session (not per render / per request).
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
        <ChatWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
