import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b0f19] text-white min-h-screen overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-24">
        <Motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-7xl font-bold leading-tight"
        >
          Turn long thoughts <br />
          <span className="text-blue-500">into clear ideas.</span>
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-gray-300 max-w-xl"
        >
          Paste any text. Choose summary length.  
          Get clarity instantly — powered by real AI.
        </Motion.p>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex gap-4"
        >
          <button
            onClick={() => navigate("/app")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium"
          >
            Try Live Demo
          </button>
          <a
            href="https://github.com/AumMule"
            target="_blank"
            className="px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-400 transition"
          >
            View GitHub
          </a>
        </Motion.div>

        {/* Floating background blur */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </section>

      {/* ================= DEMO ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <Motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Input */}
          <div className="bg-[#121826] border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Original Text (243 words)</p>
            <p className="text-gray-300 leading-relaxed">
              In today’s fast-paced digital world, people consume massive
              amounts of information daily. Articles, documentation, research,
              and notes often become overwhelming, making it difficult to
              extract the key ideas efficiently without losing context...
            </p>
          </div>

          {/* Output */}
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0f172a] border border-blue-600/40 rounded-xl p-6 shadow-lg"
          >
            <p className="text-sm text-blue-400 mb-2">
              AI Summary (62 words)
            </p>
            <p className="text-gray-200 leading-relaxed">
              People consume too much information daily, making it hard to
              extract key ideas quickly. This tool helps reduce long content
              into concise summaries without losing meaning, saving time and
              improving clarity.
            </p>
          </Motion.div>
        </Motion.div>
      </section>

      {/* ================= WHY ================= */}
      <section className="max-w-5xl mx-auto px-6 pb-32 text-center">
        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-semibold"
        >
          We read too much. <br />
          We understand too little.
        </Motion.p>

        <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
          This summarizer is built for students, developers, and writers who want
          clarity without sacrificing meaning.
        </p>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            ["📏 Adjustable Length", "Short, medium, or long summaries"],
            ["🌙 Dark Mode", "Distraction-free reading"],
            ["⚡ Fast AI", "facebook/bart-large-cnn"],
            ["📋 Copy Ready", "One-click copy"],
          ].map(([title, desc], i) => (
            <Motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#121826] border border-gray-700 rounded-xl p-5"
            >
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* ================= TECH STACK ================= */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-semibold mb-6">Built like a real product</h2>
        <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 font-mono text-sm text-gray-300 space-y-2">
          <p>Frontend → React + Tailwind</p>
          <p>Backend → Express API</p>
          <p>Model → facebook/bart-large-cnn</p>
          <p>UX → Word counts, modes, loading states</p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="text-center pb-24">
        <h2 className="text-4xl font-bold mb-4">
          Clarity shouldn’t be complicated.
        </h2>
        <p className="text-gray-400 mb-8">
          Try it. Break it. Improve it.
        </p>
        <button
          onClick={() => navigate("/app")}
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
        >
          Launch Summarizer →
        </button>
      </section>
    </div>
  );
}
