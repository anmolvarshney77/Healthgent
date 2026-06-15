"use client";

import { useState, useEffect, useRef } from "react";
import TopBar from "@/components/TopBar";
import { Send, Bot, User, ChevronDown, Loader2, Sparkles } from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  mrn: string;
  department: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // **bold**
    .replace(/\*(.+?)\*/g, "$1")        // *italic*
    .replace(/`(.+?)`/g, "$1")          // `code`
    .replace(/#+\s+/g, "")              // # headings
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // [link](url)
    .replace(/^\s*[-*]\s+/gm, "• ")     // bullet lists
    .replace(/\|[-:| ]+\|/g, "")        // table separators
    .replace(/\|/g, " ")                // table pipes
    .replace(/---+/g, "—")              // horizontal rules
    .trim();
}

const SUGGESTED_QUESTIONS = [
  "What medications is this patient currently on?",
  "Summarize this patient's chief complaint and diagnosis.",
  "Are there any safety flags or alerts for this patient?",
  "What is the recommended diet plan for this patient?",
  "What does the plan section of the clinical note say?",
];

export default function AgentPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data: Patient[]) => {
        setPatients(data);
        if (data.length > 0) setSelectedPatientId(data[0].id);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatientId, sessionId, message: text.trim() }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.error ?? "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not reach the AI agent. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <TopBar title="AI Agent" subtitle="Ask questions about any patient using clinical context" />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar panel */}
        <aside className="w-72 border-r border-slate-100 bg-white flex flex-col p-4 gap-4 flex-shrink-0">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Select Patient</label>
            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setMessages([]);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {selectedPatient && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 space-y-1">
              <div><span className="font-medium text-slate-700">MRN:</span> {selectedPatient.mrn}</div>
              <div><span className="font-medium text-slate-700">Dept:</span> {selectedPatient.department}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Suggested Questions</label>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-100 hover:border-blue-200 rounded-xl px-3 py-2 transition-colors leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-xl p-3 text-xs" style={{ background: "#f5f3ff" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={12} style={{ color: "#7c3aed" }} />
              <span className="font-semibold" style={{ color: "#7c3aed" }}>Powered by Lyzr</span>
            </div>
            <p className="text-slate-500 leading-snug">Responses are grounded in the patient&apos;s clinical note.</p>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-16">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                  <Bot size={28} style={{ color: "#7c3aed" }} />
                </div>
                <div>
                  <p className="text-slate-700 font-semibold text-base">Ask anything about {selectedPatient?.fullName ?? "the selected patient"}</p>
                  <p className="text-slate-400 text-sm mt-1">Pick a suggested question or type your own below.</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#f5f3ff" }}>
                    <Bot size={16} style={{ color: "#7c3aed" }} />
                  </div>
                )}
                <div
                  className="max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm"
                  style={msg.role === "user"
                    ? { background: "#3b82f6", color: "#fff", borderBottomRightRadius: "6px" }
                    : { background: "#fff", color: "#1e293b", borderBottomLeftRadius: "6px" }}
                >
                  {msg.role === "assistant" ? stripMarkdown(msg.content) : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#3b82f6" }}>
                    <User size={16} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f5f3ff" }}>
                  <Bot size={16} style={{ color: "#7c3aed" }} />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm" style={{ borderBottomLeftRadius: "6px" }}>
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-end gap-3 px-4 py-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this patient… (Enter to send)"
                rows={1}
                className="flex-1 resize-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent leading-relaxed"
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
                style={{ background: "#3b82f6" }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Responses are based on synthetic demo data only and not medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
