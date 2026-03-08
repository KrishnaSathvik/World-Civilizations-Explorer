import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { streamChat } from "@/services/chat";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const STARTER_QUESTIONS = [
  "How did the Silk Road influence global trade and cultural exchange?",
  "Compare and contrast Greek and Roman forms of democracy.",
  "What were the greatest achievements of the Islamic Golden Age?",
  "How did ancient Egyptian religion shape their architecture?",
  "What caused the fall of the Roman Empire?",
  "Tell me about the Mayan calendar and its significance.",
  "How did feudal Japan's warrior class evolve?",
  "What were the key trade routes of ancient India?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar - suggested questions */}
        <aside className="hidden lg:flex flex-col w-80 border-r border-border bg-card/50 p-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Explorer
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-heading text-sm font-semibold text-foreground">Suggested Questions</h2>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="block w-full text-left px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm font-heading text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="border-b border-border px-6 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Cultural Assistant</h1>
              <p className="text-xs font-heading text-muted-foreground">AI-powered cultural historian — ask anything about world history</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Sparkles className="h-12 w-12 text-gold/40 mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ask me anything</h2>
                <p className="font-body text-muted-foreground max-w-md mb-8">
                  I'm a cultural historian with knowledge spanning 10,000 years.
                  Ask about civilizations, key figures, cultural practices, or historical events.
                </p>
                {/* Mobile suggested questions */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  {STARTER_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left px-3 py-2 rounded-lg border border-border/60 bg-card text-sm font-heading text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
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
                placeholder="Ask about any civilization, historical event, or cultural practice..."
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
