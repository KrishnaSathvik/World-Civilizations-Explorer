import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { streamRAGChat, type Message, type RAGSource } from "@/services/ragService";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SUGGESTED_QUESTIONS = [
  "How did the Silk Road influence global trade?",
  "Compare Greek and Roman democracy",
  "What was the Islamic Golden Age?",
  "Tell me about ancient Egyptian pyramids",
  "How did feudal Japan's samurai culture develop?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
        mode: "chat",
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
      toast({ title: "Connection Error", description: "Could not reach the AI assistant.", variant: "destructive" });
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center animate-pulse-glow transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full sm:w-[400px] bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <div>
                  <h3 className="font-heading text-sm font-semibold text-foreground">Cultural Assistant</h3>
                  <p className="text-xs font-heading text-muted-foreground">RAG-powered historian</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link to="/ask">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Open full page">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-3 pt-4">
                  <p className="text-sm font-body text-muted-foreground text-center">
                    Ask me anything about world history and culture.
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="block w-full text-left px-3 py-2 rounded-lg border border-border/60 bg-card text-sm font-heading text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
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
                      "max-w-[85%] rounded-xl px-4 py-3",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-card border border-border/60"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground font-body [&_p]:mb-2 [&_p]:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm font-body">{msg.content}</p>
                    )}
                  </div>
                  {/* Source badges */}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                      {msg.sources.slice(0, 3).map((s, j) => (
                        <Badge key={j} variant="outline" className="text-[9px] font-heading gap-1">
                          <BookOpen className="h-2.5 w-2.5" />
                          {s.title.slice(0, 25)}{s.title.length > 25 ? "…" : ""}
                        </Badge>
                      ))}
                      {msg.sources.length > 3 && (
                        <Badge variant="outline" className="text-[9px] font-heading">
                          +{msg.sources.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="mr-auto bg-card border border-border/60 rounded-xl px-4 py-3 max-w-[85%]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2"
              >
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about any civilization..."
                  className="min-h-[44px] max-h-32 resize-none font-heading text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-11 w-11 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
