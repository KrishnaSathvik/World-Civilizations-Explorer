"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowLeft, BookOpen, FileText, GitCompare, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { streamRAGChat, type Message, type RAGSource, type ChatMode } from "@/services/ragService";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const STARTER_QUESTIONS: Record<ChatMode, string[]> = {
  chat: [
    "How did the Silk Road influence global trade and cultural exchange?",
    "Compare and contrast Greek and Roman forms of democracy.",
    "What were the greatest achievements of the Islamic Golden Age?",
    "How did ancient Egyptian religion shape their architecture?",
    "What caused the fall of the Roman Empire?",
  ],
  summarize: [
    "Summarize the history of Ancient Egypt",
    "Give me an overview of the Roman Republic",
    "Summarize the key achievements of the Inca Empire",
    "Overview of the Ottoman Empire's golden age",
  ],
  compare: [
    "Compare the Greek and Roman empires",
    "How did Chinese and Japanese feudalism differ?",
    "Compare Egyptian and Mesopotamian writing systems",
    "Contrast Aztec and Inca governance",
  ],
  narrative: [
    "Tell the story of Alexander the Great's conquests",
    "Narrate the rise and fall of the Roman Empire",
    "The journey of Marco Polo along the Silk Road",
    "The founding of ancient Athens",
  ],
};

const MODE_LABELS: Record<ChatMode, { label: string; icon: typeof Sparkles; description: string }> = {
  chat: { label: "Chat", icon: Sparkles, description: "Ask questions and explore history" },
  summarize: { label: "Summarize", icon: FileText, description: "Get article summaries from multiple sources" },
  compare: { label: "Compare", icon: GitCompare, description: "Compare civilizations, figures, or events" },
  narrative: { label: "Narrative", icon: Clock, description: "Transform events into flowing stories" },
};

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    let currentSources: RAGSource[] = [];

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar, sources: currentSources } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar, sources: currentSources }];
      });
    };

    try {
      await streamRAGChat({
        messages: [...messages, userMsg],
        mode,
        onDelta: upsertAssistant,
        onSources: (sources) => {
          currentSources = sources;
        },
        onDone: () => setIsLoading(false),
        onError: (err) => {
          setIsLoading(false);
          toast({ title: "AI Error", description: err, variant: "destructive" });
        },
      });
    } catch {
      setIsLoading(false);
    }
  };

  const currentQuestions = STARTER_QUESTIONS[mode];
  const ModeIcon = MODE_LABELS[mode].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-r border-border bg-card/50 p-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Explorer
          </Link>

          {/* Mode selector */}
          <div className="mb-6">
            <p className="text-xs font-heading text-muted-foreground mb-2 uppercase tracking-wider">Mode</p>
            <div className="space-y-1">
              {(Object.keys(MODE_LABELS) as ChatMode[]).map((m) => {
                const { label, icon: Icon, description } = MODE_LABELS[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all",
                      mode === m
                        ? "bg-primary/10 border border-primary/30 text-foreground"
                        : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-heading font-semibold">{label}</p>
                      <p className="text-[11px] font-body leading-snug opacity-70">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <ModeIcon className="h-4 w-4 text-primary" />
            <h2 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider">
              Suggestions
            </h2>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {currentQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="block w-full text-left px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm font-heading text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Cultural Assistant</h1>
                <p className="text-xs font-heading text-muted-foreground">
                  RAG-powered historian — grounded in your knowledge base
                </p>
              </div>
            </div>
            {/* Mobile mode tabs */}
            <div className="lg:hidden">
              <Tabs value={mode} onValueChange={(v) => setMode(v as ChatMode)}>
                <TabsList className="w-full">
                  {(Object.keys(MODE_LABELS) as ChatMode[]).map((m) => {
                    const { label, icon: Icon } = MODE_LABELS[m];
                    return (
                      <TabsTrigger key={m} value={m} className="gap-1.5 text-xs font-heading flex-1">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <ModeIcon className="h-12 w-12 text-primary/40 mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {MODE_LABELS[mode].label} Mode
                </h2>
                <p className="font-body text-muted-foreground max-w-md mb-8">
                  {MODE_LABELS[mode].description}. Responses are grounded in your knowledge base for accuracy.
                </p>
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  {currentQuestions.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left px-3 py-2 rounded-lg border border-border/60 bg-card text-sm font-heading text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-5 py-4",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-card border border-border/60"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground font-body [&_p]:mb-2 [&_p]:leading-relaxed [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm font-body">{msg.content}</p>
                  )}
                </div>
                {/* Sources */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-1 max-w-[75%]">
                    <span className="text-[10px] font-heading text-muted-foreground mr-1">Sources:</span>
                    {msg.sources.map((s, j) => (
                      <Badge key={j} variant="secondary" className="text-[10px] font-heading gap-1">
                        <BookOpen className="h-2.5 w-2.5" />
                        {s.title.slice(0, 30)}{s.title.length > 30 ? "…" : ""}
                        <span className="text-muted-foreground">({s.type})</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="mr-auto bg-card border border-border/60 rounded-xl px-5 py-4 max-w-[75%]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2 max-w-3xl mx-auto"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`${MODE_LABELS[mode].label}: Ask about any civilization, event, or figure...`}
                className="min-h-[48px] max-h-32 resize-none font-heading text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-12 w-12 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}