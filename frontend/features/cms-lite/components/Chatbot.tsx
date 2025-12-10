"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackend } from "../shared/hooks/useBackend";

interface ContentReference {
  type: string;
  title: string;
  url: string;
  excerpt?: string;
}

export default function Chatbot() {
  const { locale } = useLanguage();
  const router = useRouter();
  const backend = useBackend();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string; references?: ContentReference[] }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await backend.ai.chat({ message: userMessage, locale });
      setMessages((prev) => [...prev, { role: "bot", content: res.reply, references: res.references }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: locale === "id"
            ? "Maaf, terjadi kesalahan. Silakan coba lagi."
            : locale === "ar"
              ? "عذرا، حدث خطأ. يرجى المحاولة مرة أخرى."
              : "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getReferenceIcon = (type: string) => {
    const typeLabels: Record<string, Record<string, string>> = {
      blog: { id: "Blog", en: "Blog", ar: "مدونة" },
      portfolio: { id: "Portfolio", en: "Portfolio", ar: "معرض الأعمال" },
      service: { id: "Layanan", en: "Service", ar: "خدمة" },
      product: { id: "Produk", en: "Product", ar: "منتج" },
      about: { id: "Tentang", en: "About", ar: "عن" },
    };
    return typeLabels[type]?.[locale] || type;
  };

  const handleReferenceClick = (ref: ContentReference) => {
    setIsOpen(false);

    if (ref.url.startsWith("/#")) {
      router.push("/");
      setTimeout(() => {
        const element = document.querySelector(ref.url.replace("/", ""));
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      router.push(ref.url);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-full bg-background border rounded-lg shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">
              {locale === "id"
                ? "Asisten Virtual"
                : locale === "ar"
                  ? "المساعد الافتراضي"
                  : "Virtual Assistant"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-foreground/60 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
                <p>
                  {locale === "id"
                    ? "Halo! Ada yang bisa saya bantu?"
                    : locale === "ar"
                      ? "مرحبا! كيف يمكنني مساعدتك؟"
                      : "Hello! How can I help you?"}
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.references && msg.references.length > 0 && (
                  <div className="flex justify-start mt-3">
                    <div className="max-w-[85%] space-y-2">
                      {msg.references.map((ref, refIdx) => (
                        <button
                          key={refIdx}
                          onClick={() => handleReferenceClick(ref)}
                          className="block w-full bg-card border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-md transition-all group text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                                {getReferenceIcon(ref.type)}
                              </div>
                              <div className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                {ref.title}
                              </div>
                              {ref.excerpt && (
                                <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                  {ref.excerpt.length > 100 ? ref.excerpt.substring(0, 100) + "..." : ref.excerpt}
                                </div>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  locale === "id"
                    ? "Ketik pesan..."
                    : locale === "ar"
                      ? "اكتب رسالة..."
                      : "Type a message..."
                }
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


