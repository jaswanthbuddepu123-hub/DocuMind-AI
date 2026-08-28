import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Brain, Shield, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DocuMind AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium bg-white text-slate-950 px-4 py-2 rounded-full hover:bg-slate-200 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center mt-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>DocuMind 2.0 is now live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Extract Data with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Superhuman Intelligence
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop doing manual data entry. Upload your invoices, receipts, and contracts. 
            Our advanced AI pipeline analyzes, validates, and extracts every key field instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group flex items-center gap-2 bg-indigo-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-indigo-600 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Floating App Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative z-10 perspective-1000">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
            <div className="h-6 flex items-center px-4 gap-2 border-b border-white/5 bg-slate-900/80 rounded-t-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 aspect-video bg-gradient-to-b from-slate-900 to-slate-950 rounded-b-xl flex flex-col items-center justify-center border-t border-white/5">
                <Brain className="w-16 h-16 text-indigo-500/50 mb-4" />
                <p className="text-slate-500 font-mono text-sm">Dashboard Analytics UI Placeholder</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Lightning Fast"
              description="Powered by Gemini 2.5 Flash, documents are analyzed and returned in milliseconds."
            />
            <FeatureCard 
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              title="Contextual Understanding"
              description="The AI doesn't just OCR; it understands line items, subtotals, and vendor relationships."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title="Enterprise Secure"
              description="Your data is completely isolated via Row Level Security. We never train on your private documents."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500">
        <p>© 2026 DocuMind AI. Built for the Hackathon.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const SparklesIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
)

export default Landing;
