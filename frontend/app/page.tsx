import Link from "next/link";
import { FileText, Link2, Sparkles, ScanSearch, Check, ArrowRight, Zap, Clock, FileX } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50" style={{ backgroundColor: "#2c2c2c" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-400" size={22} />
            <span className="text-white font-bold text-lg tracking-tight">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-gray-300 hover:text-white text-sm transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: "#2c2c2c" }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} />
            AI-powered resume generation
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Your resume,{" "}
            <span className="text-blue-400">always up to date</span>
          </h1>
          <p className="text-gray-300 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Sync once from LinkedIn. Let AI keep your resume current. Download a pixel-perfect PDF or DOCX in seconds.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-lg text-base transition-colors"
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="text-gray-300 hover:text-white text-base transition-colors underline underline-offset-4"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-blue-500 uppercase tracking-widest mb-3">The problem</p>
          <h2 className="text-3xl font-bold text-center mb-12">Why most people have an outdated resume</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock size={28} className="text-red-400" />,
                title: "Manual updates are a pain",
                desc: "Every time you change jobs or add a skill, you have to reformat the entire document from scratch.",
              },
              {
                icon: <Zap size={28} className="text-orange-400" />,
                title: "Outdated the moment you update LinkedIn",
                desc: "Your LinkedIn and resume drift apart. Recruiters see inconsistencies. You look disorganized.",
              },
              {
                icon: <FileX size={28} className="text-purple-400" />,
                title: "Formatting is a nightmare",
                desc: "Word docs break on every machine. PDFs look different on every screen. You spend hours on layout.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-7 border border-gray-200 shadow-sm">
                <div className="mb-4">{card.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-blue-500 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need, nothing you don't</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Link2 size={32} className="text-blue-600" />,
                title: "LinkedIn Sync",
                desc: "Export your LinkedIn data ZIP and import it instantly. Your work history, education, and skills populate automatically.",
              },
              {
                icon: <Sparkles size={32} className="text-blue-500" />,
                title: "AI Updates",
                desc: "Just tell Claude what changed — \"I got promoted\" or \"I learned React\" — and your resume updates itself with strong, quantified bullet points.",
              },
              {
                icon: <ScanSearch size={32} className="text-blue-400" />,
                title: "ATS Scanner",
                desc: "Paste a job description and get a match score with suggested keywords to add. Stop getting filtered out before a human reads your resume.",
              },
            ].map((feat) => (
              <div key={feat.title} className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-xl">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-blue-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-center mb-4">Simple, honest pricing</h2>
          <p className="text-center text-gray-500 mb-12">No hidden fees. Cancel anytime.</p>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                highlight: false,
                features: [
                  "1 resume",
                  "LinkedIn import",
                  "PDF & DOCX export",
                  "5 AI updates/month",
                ],
                cta: "Get started",
                href: "/sign-up",
              },
              {
                name: "Pro",
                price: "$12",
                period: "per month",
                highlight: true,
                features: [
                  "Unlimited resumes",
                  "LinkedIn import",
                  "PDF & DOCX export",
                  "Unlimited AI updates",
                  "ATS Scanner",
                  "Priority support",
                ],
                cta: "Start Pro",
                href: "/sign-up",
              },
              {
                name: "Premium",
                price: "$24",
                period: "per month",
                highlight: false,
                features: [
                  "Everything in Pro",
                  "Cover letter generator",
                  "LinkedIn optimization",
                  "1-on-1 resume review",
                  "Custom resume themes",
                ],
                cta: "Start Premium",
                href: "/sign-up",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col gap-6 ${
                  plan.highlight
                    ? "bg-blue-500 text-white shadow-xl shadow-blue-200 scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>/{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check size={15} className={plan.highlight ? "text-blue-100" : "text-blue-500"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-500 hover:bg-blue-50"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-sm text-gray-400 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <FileText size={16} className="text-blue-400" />
          <span className="font-semibold text-gray-700">ResumeAI</span>
        </div>
        <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
