import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Sage — a warm, wise, and deeply personal AI assistant built exclusively for Shawn (pen name S.T. Belmont), a Wisconsin-based author, entrepreneur, and intentional living advocate.

## Who Shawn Is
- Published author: children's series *Nyla's Piggy Bank* and *Nyla's Day at the Zoo*, plus *How to Start Homeschooling 101*
- ~15 years retail & store management experience at Walmart
- ~5 years as a nanny with homeschooling experience
- Licensed real estate agent in Wisconsin
- Active gardener, bread maker, jam maker, scratch cook — calls herself a "fake herbalist" with warmth and humor
- Currently building AI-powered income streams, with a flagship financial planning chatbot as her primary project
- Has a detailed 90-day action plan and build blueprint for her chatbot
- Learning Claude through Anthropic's free course; prior experience with ChatGPT

## Shawn's Core Philosophy: "Health & Wealth"
Everything connects to this framework:
- **Health**: brain health, physical wellness (inside and out), natural living, intentional food choices
- **Wealth**: residual income, financial independence, productized services, AI-powered tools, real estate

## Your Role as Sage
You are Shawn's all-in-one personal assistant. You help her:
- Build her AI-powered chatbot business and income streams
- Stay on track with goals and her 90-day plan
- Brainstorm, strategize, and problem-solve
- Navigate homeschooling, writing, and content creation
- Make decisions around health, wellness, food, and natural living
- Stay motivated, grounded, and aligned with her vision

## Your Tone
- Warm, encouraging, and genuinely invested in Shawn's success
- Practical and no-nonsense — you don't pad or fluff
- Educational and informative — you explain things clearly
- Conversational and fun — you feel like a brilliant best friend, not a corporate bot
- You may use light humor when appropriate
- You celebrate her wins, no matter how small
- You're direct when she needs a push

## Important
- You know Shawn personally. Reference her context naturally — not robotically.
- Never start responses with "Certainly!" or hollow filler phrases.
- Keep responses appropriately sized: short for simple questions, thorough for complex ones.
- You are exclusively for Shawn. You are her Sage.`;

const WaveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" fill="#5a7a5a" opacity="0.15"/>
    <path d="M6 14 Q8 10 10 14 Q12 18 14 14 Q16 10 18 14 Q20 18 22 14" stroke="#5a7a5a" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2 C11 2 18 6 18 13 C18 17.4 14.9 19 11 19 C7.1 19 4 17.4 4 13 C4 6 11 2 11 2Z" fill="#7a9f6e" opacity="0.8"/>
    <path d="M11 19 L11 8" stroke="#5a7a5a" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M11 13 L15 9" stroke="#5a7a5a" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    <path d="M11 11 L7 8" stroke="#5a7a5a" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9 L16 9 M10 3 L16 9 L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpinnerIcon = () => (
  <div style={{
    width: 18, height: 18, border: "2px solid #c8dbc0", borderTopColor: "#5a7a5a",
    borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block"
  }}/>
);

export default function SageAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 140) + "px"; }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "Something went quiet. Try again?";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setError("Couldn't reach Sage right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMessage = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
        p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p
      );
      return <span key={i}>{parts}{i < lines.length - 1 ? <br/> : null}</span>;
    });
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f0e8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 0 20px 0",
      backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(122,159,110,0.12) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 80%, rgba(185,155,100,0.10) 0%, transparent 60%)`
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
        .msg-bubble { animation: fadeUp 0.35s ease forwards; }
        .send-btn:hover { background: #4a6a4a !important; transform: translateY(-1px); }
        .send-btn:active { transform: translateY(0); }
        .send-btn { transition: all 0.15s ease; }
        textarea:focus { outline: none; }
        .dot { animation: pulse 1.4s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .greeting-chip { animation: fadeUp 0.5s ease forwards; }
        .greeting-chip:nth-child(2) { animation-delay: 0.1s; opacity: 0; }
        .greeting-chip:nth-child(3) { animation-delay: 0.2s; opacity: 0; }
      `}</style>

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 680,
        padding: "28px 24px 20px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid rgba(122,159,110,0.2)"
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #7a9f6e, #a8c49a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(90,122,90,0.25)"
        }}>
          <LeafIcon />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2d4a2d", letterSpacing: "-0.3px" }}>Sage</div>
          <div style={{ fontSize: 13, color: "#7a9070", fontStyle: "italic" }}>Your personal everything assistant</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7ac070" }}/>
          <span style={{ fontSize: 12, color: "#7a9070" }}>Ready</span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        width: "100%", maxWidth: 680, flex: 1,
        padding: "24px 20px",
        display: "flex", flexDirection: "column", gap: 18,
        minHeight: messages.length === 0 ? 320 : undefined
      }}>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>🌿</div>
            <div style={{ fontSize: 20, color: "#2d4a2d", fontWeight: 600, marginBottom: 8 }}>
              Good morning, Shawn.
            </div>
            <div style={{ fontSize: 15, color: "#7a9070", marginBottom: 28, fontStyle: "italic" }}>
              What are we building today?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {[
                "Where am I in my 90-day plan?",
                "Help me write my chatbot script",
                "Give me a garden tip for March",
                "What should I focus on today?"
              ].map((prompt) => (
                <button key={prompt} className="greeting-chip" onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                  style={{
                    background: "rgba(122,159,110,0.12)", border: "1px solid rgba(122,159,110,0.3)",
                    borderRadius: 20, padding: "8px 16px", fontSize: 13, color: "#4a6a4a",
                    cursor: "pointer", fontFamily: "inherit"
                  }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="msg-bubble" style={{
            display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: 10, alignItems: "flex-start"
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #7a9f6e, #a8c49a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 2, boxShadow: "0 2px 8px rgba(90,122,90,0.2)"
              }}>
                <span style={{ fontSize: 16 }}>🌿</span>
              </div>
            )}
            <div style={{
              maxWidth: "76%",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #5a7a5a, #4a6a4a)"
                : "#fff",
              color: msg.role === "user" ? "#f5f0e8" : "#2d3a2d",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "13px 17px",
              fontSize: 15, lineHeight: 1.6,
              boxShadow: msg.role === "user"
                ? "0 3px 12px rgba(74,106,74,0.3)"
                : "0 2px 12px rgba(0,0,0,0.07)",
              border: msg.role === "assistant" ? "1px solid rgba(122,159,110,0.15)" : "none"
            }}>
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #7a9f6e, #a8c49a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(90,122,90,0.2)"
            }}>
              <span style={{ fontSize: 16 }}>🌿</span>
            </div>
            <div style={{
              background: "#fff", borderRadius: "18px 18px 18px 4px",
              padding: "16px 20px", display: "flex", gap: 5, alignItems: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              border: "1px solid rgba(122,159,110,0.15)"
            }}>
              {[0,1,2].map(n => (
                <div key={n} className="dot" style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#7a9f6e"
                }}/>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fff3f0", border: "1px solid #f0b8b0",
            borderRadius: 12, padding: "12px 16px",
            fontSize: 14, color: "#a04040", textAlign: "center"
          }}>{error}</div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input Area */}
      <div style={{
        width: "100%", maxWidth: 680, padding: "0 20px",
        position: "sticky", bottom: 20
      }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "#fff", borderRadius: 24,
          padding: "10px 10px 10px 18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          border: "1px solid rgba(122,159,110,0.2)"
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKey}
            placeholder="Ask Sage anything…"
            rows={1}
            style={{
              flex: 1, border: "none", resize: "none", background: "transparent",
              fontSize: 15, color: "#2d3a2d", lineHeight: 1.5,
              fontFamily: "inherit", paddingTop: 4,
              maxHeight: 140, overflowY: "auto"
            }}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: "50%", border: "none",
              background: input.trim() && !loading ? "#5a7a5a" : "#c8dbc0",
              color: "#fff", cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}
          >
            {loading ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#aab8a0", marginTop: 8 }}>
          Sage knows you. Just talk.
        </div>
      </div>
    </div>
  );
}
