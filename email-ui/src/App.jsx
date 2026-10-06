import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TONES = ["professional", "friendly", "firm", "apologetic", "concise"];
const LENGTHS = ["short", "medium", "detailed"];
const LANGS = ["English", "Hindi", "Marathi"];
const TABS = ["Short", "Medium", "Detailed"];

function Chips({ label, value, options, onChange }) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            aria-pressed={o === value}
            onClick={() => onChange(o)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
              o === value
                ? "border-ink bg-ink text-white"
                : "border-line bg-white hover:border-cobalt"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("English");
  const [drafts, setDrafts] = useState([]);
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setDrafts([]);
    try {
      const res = await fetch(`${API}/api/email/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailContent: email, tone, length, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDrafts(data);
      setActive(Math.min(LENGTHS.indexOf(length), data.length - 1));
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "Can't reach the server. Is the backend running?"
          : e.message,
      );
    }
    setLoading(false);
  }

  function edit(text) {
    setDrafts(drafts.map((d, i) => (i === active ? text : d)));
  }

  async function copy() {
    await navigator.clipboard.writeText(drafts[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const words = drafts[active]?.trim().split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pb-2 pt-10">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Quill Reply
        </h1>
        <p className="mt-2 text-lg text-soft">
          Paste an email. Get three replies you can edit and send.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-7 px-6 py-6 lg:grid-cols-[5fr_6fr]">
        {/* Composer */}
        <section aria-label="Email to reply to">
          <label htmlFor="email" className="mb-2 block font-semibold">
            Email you received
          </label>
          <textarea
            id="email"
            rows={11}
            maxLength={5000}
            placeholder="Hi, can we move our meeting to Friday afternoon?"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full resize-y rounded-[10px] border border-line bg-white p-3.5 text-base"
          />
          <div className="mb-4 mt-1 text-right text-xs text-soft">
            {email.length} / 5000
          </div>

          <Chips label="Tone" value={tone} options={TONES} onChange={setTone} />
          <Chips
            label="Length"
            value={length}
            options={LENGTHS}
            onChange={setLength}
          />
          <Chips
            label="Language"
            value={language}
            options={LANGS}
            onChange={setLanguage}
          />

          <button
            onClick={generate}
            disabled={loading || !email.trim()}
            className="mt-2 w-full cursor-pointer rounded-[10px] bg-cobalt py-3.5 text-base font-semibold text-white hover:bg-[#1f3fc4] disabled:cursor-not-allowed disabled:bg-[#aab5e8]"
          >
            {loading ? "Writing replies" : "Write replies"}
          </button>
          {error && (
            <p role="alert" className="mt-3 font-medium text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* Letter */}
        <section
          aria-live="polite"
          aria-label="Reply drafts"
          className="relative min-h-[420px] overflow-hidden rounded-[10px] border border-line bg-white px-7 pb-5 pt-8 shadow-[0_18px_40px_-28px_rgba(20,33,61,0.45)]"
        >
          <div className="stripe absolute inset-x-0 top-0 h-2" />

          {loading && (
            <div className="grid gap-3.5 pt-4" aria-label="Loading">
              {[92, 100, 78, 96, 60].map((w, i) => (
                <span
                  key={i}
                  style={{ width: `${w}%` }}
                  className="h-3.5 animate-pulse rounded-md bg-slate-200"
                />
              ))}
            </div>
          )}

          {!loading && drafts.length === 0 && (
            <div className="py-16 text-center text-soft">
              <p className="mb-1.5 font-serif text-2xl italic text-ink">
                Your replies will appear here.
              </p>
              <p>
                Paste an email on the left, choose a tone, and select Write
                replies.
              </p>
            </div>
          )}

          {!loading && drafts.length > 0 && (
            <>
              <div
                role="tablist"
                className="mb-4 flex gap-1 border-b border-line"
              >
                {drafts.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => setActive(i)}
                    className={`-mb-px cursor-pointer border-b-2 px-3.5 py-2 font-medium ${
                      i === active
                        ? "border-cobalt text-ink"
                        : "border-transparent text-soft"
                    }`}
                  >
                    {TABS[i] ?? `Draft ${i + 1}`}
                  </button>
                ))}
              </div>

              <textarea
                value={drafts[active]}
                onChange={(e) => edit(e.target.value)}
                aria-label="Reply draft, editable"
                className="min-h-[280px] w-full max-w-[62ch] resize-y bg-transparent font-serif text-xl leading-relaxed focus:outline-none focus-visible:outline-none"
              />

              <div className="mt-3 flex items-center justify-between text-sm text-soft">
                <span>{words} words</span>
                <button
                  onClick={copy}
                  className="cursor-pointer rounded-lg bg-ink px-4 py-2 font-semibold text-white"
                >
                  {copied ? "Copied" : "Copy reply"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 pt-2 text-sm text-soft">
        Replies are generated by Google Gemini. Emails are not stored by this
        app.
      </footer>
    </>
  );
}
