import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out" });
  }, []);

  return (
    <div className="font-sans bg-black min-h-screen flex flex-col text-white selection:bg-blue-500/30 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]"></div>
      {/* Top Nav */}
      <header
        data-aos="fade-down"
        className="flex items-center justify-between px-8 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10"
      >
        <h2 className="text-2xl font-semibold tracking-wide text-gray-200">
          SAJE
        </h2>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-white/90 text-black font-medium rounded-full hover:bg-white transition shadow-lg"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center px-4 py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl"></div>

        <h1
          data-aos="fade-up"
          className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
        >
          The Smarter Way to <br /> Manage Invoices
        </h1>

        <p
          data-aos="fade-up"
          className="text-lg text-gray-400 max-w-xl mx-auto"
        >
          Built for modern businesses — automate billing, track payments, and
          scale effortlessly with one powerful platform.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <button
            data-aos="zoom-in"
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition shadow-xl"
          >
            Start Free
          </button>

          <button
            data-aos="zoom-in"
            className="px-8 py-4 border border-white/20 rounded-full text-lg hover:bg-white/10 transition"
          >
            Watch Demo
          </button>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="mt-16 flex justify-center"
        >
          <div className="w-[900px] h-[400px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Window Top Bar */}
            <div className="absolute top-0 left-0 w-full h-10 bg-white/10 flex items-center px-4 gap-2 border-b border-white/10">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="ml-4 text-xs text-gray-300">
                dashboard.saje.app
              </div>
            </div>

            {/* Sidebar */}
            <div className="absolute top-10 left-0 w-48 h-full bg-white/5 border-r border-white/10 p-4 space-y-4">
              <div className="h-3 bg-white/20 rounded w-20"></div>
              <div className="h-3 bg-white/10 rounded w-24"></div>
              <div className="h-3 bg-white/10 rounded w-16"></div>
              <div className="h-3 bg-white/10 rounded w-28"></div>
            </div>

            {/* Main Content */}
            <div className="absolute top-10 left-48 right-0 bottom-0 p-6">
              {/* Header */}
              <div className="h-5 w-40 bg-white/20 rounded mb-6"></div>

              {/* Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                  className="h-20 bg-white/10 rounded-lg"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                ></motion.div>
                <motion.div
                  className="h-20 bg-white/10 rounded-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                ></motion.div>
                <motion.div
                  className="h-20 bg-white/10 rounded-lg"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
                ></motion.div>
              </div>

              {/* Table */}
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-10 bg-white/5 rounded flex items-center justify-between px-4"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.2,
                    }}
                  >
                    <div className="h-3 w-24 bg-white/20 rounded"></div>
                    <div className="h-3 w-16 bg-white/10 rounded"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Smart Invoicing",
            desc: "Create branded invoices in seconds with auto calculations.",
          },
          {
            title: "Client Management",
            desc: "Centralized client database with full payment history.",
          },
          {
            title: "Automated Follow-ups",
            desc: "Reduce late payments with smart reminders.",
          },
          {
            title: "Analytics Dashboard",
            desc: "Track revenue, performance, and business growth.",
          },
          {
            title: "Secure Cloud Storage",
            desc: "Access your data anytime, anywhere securely.",
          },
          {
            title: "Custom Branding",
            desc: "Add your logo and personalize invoices.",
          },
        ].map((f, i) => (
          <div
            key={i}
            data-aos="fade-up"
            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-xl hover:bg-white/10 transition transform hover:-translate-y-2 hover:scale-[1.02] duration-300"
          >
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 text-center">
        <h2
          data-aos="fade-up"
          className="text-4xl font-bold mb-12 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          How It Works
        </h2>

        <div className="flex flex-wrap justify-center gap-10">
          <div
            data-aos="fade-up"
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 transition duration-300"
          >
            <span className="text-sm text-gray-400">Step 01</span>
            <h3 className="text-xl font-semibold mt-2 mb-2">Create Clients</h3>
            <p className="text-gray-400">
              Add your clients once and reuse them across invoices.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 transition duration-300"
          >
            <span className="text-sm text-gray-400">Step 02</span>
            <h3 className="text-xl font-semibold mt-2 mb-2">
              Generate Invoices
            </h3>
            <p className="text-gray-400">
              Create invoices in seconds with automated calculations.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 hover:-translate-y-2 transition duration-300"
          >
            <span className="text-sm text-gray-400">Step 03</span>
            <h3 className="text-xl font-semibold mt-2 mb-2">Get Paid Faster</h3>
            <p className="text-gray-400">
              Track payments and send reminders automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div data-aos="fade-up">
            <h3 className="text-5xl font-extrabold text-white animate-pulse">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                10K+
              </motion.span>
            </h3>
            <p className="text-gray-400 mt-2">Invoices Generated</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-5xl font-extrabold text-white animate-pulse">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                5K+
              </motion.span>
            </h3>
            <p className="text-gray-400 mt-2">Happy Clients</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-5xl font-extrabold text-white animate-pulse">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                99.9%
              </motion.span>
            </h3>
            <p className="text-gray-400 mt-2">Uptime Reliability</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 text-center max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-12">Loved by Professionals</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "This tool completely changed how I handle billing.",
            "Clean UI, fast workflow, and super reliable.",
            "Saved me hours every week. Highly recommend!",
          ].map((text, i) => (
            <div
              key={i}
              className="p-6 bg-white/5 border border-white/10 rounded-xl hover:scale-105 hover:bg-white/10 transition duration-300"
            >
              <p className="text-gray-300">“{text}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-12">Simple Pricing</h2>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 w-80 hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Starter</h3>
            <p className="text-4xl font-bold mb-4">Free</p>
            <p className="text-gray-400 mb-6">Basic features to get started</p>
            <button className="px-6 py-3 bg-white text-black rounded-full">
              Get Started
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-white/10 w-80 text-black scale-105 shadow-2xl hover:scale-110 transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-4">$9/mo</p>
            <p className="mb-6">Advanced features for growing businesses</p>
            <button className="px-6 py-3 bg-black text-white rounded-full">
              Upgrade
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        whileInView={{ scale: [0.98, 1] }}
        transition={{ duration: 0.6 }}
        className="px-6 py-28 text-center"
      >
        <h2
          data-aos="fade-up"
          className="text-5xl font-extrabold mb-6 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          Ready to simplify your billing?
        </h2>
        <p data-aos="fade-up" className="text-gray-400 max-w-xl mx-auto mb-10">
          Join thousands of professionals who trust My SaaS to manage invoices,
          payments, and clients effortlessly.
        </p>

        <button
          data-aos="zoom-in"
          onClick={() => navigate("/login")}
          className="px-12 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-[1.08] hover:shadow-white/20"
        >
          Start Free Today
        </button>
      </motion.section>

      {/* Interactive Parallax Section */}
      <section className="px-6 py-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Experience the Engine
          </h2>
          <p className="text-gray-400">
            Move your mouse — the system reacts in real time.
          </p>
        </div>

        <div
          className="max-w-4xl mx-auto h-[400px] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const moveX = (x - rect.width / 2) / 20;
            const moveY = (y - rect.height / 2) / 20;

            const el = e.currentTarget.querySelector(".parallax-inner") as HTMLElement;
            if (el) {
              el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget.querySelector(".parallax-inner") as HTMLElement;
            if (el) {
              el.style.transform = `translate(0px, 0px)`;
            }
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 blur-2xl"></div>

          {/* Moving Content */}
          <div className="parallax-inner transition-transform duration-200 ease-out w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">
                Real-Time Interaction
              </h3>
              <p className="text-gray-400 text-sm">
                Your dashboard responds instantly to every action.
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg animate-pulse"></div>
                <div className="w-16 h-16 bg-purple-500/20 rounded-lg animate-pulse delay-200"></div>
                <div className="w-16 h-16 bg-white/10 rounded-lg animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} SAJE. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
