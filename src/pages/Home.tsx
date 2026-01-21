import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-out" });
  }, []);

  return (
    <div className="font-sans bg-black min-h-screen flex flex-col text-white selection:bg-blue-500/30 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]"></div>
      {/* Top Nav */}
      <header
        data-aos="fade-down"
        className="flex items-center justify-between px-8 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10"
      >
        <h2 className="text-2xl font-semibold tracking-wide uppercase text-gray-200">My SaaS</h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-white/90 text-black font-medium rounded-full hover:bg-white transition shadow-lg"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="text-center px-4 py-24">
        <h1
          data-aos="fade-up"
          className="text-7xl font-extrabold mb-8 leading-[1.05] bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
        >
          Manage Billing <br /> With Confidence
        </h1>

        <p
          data-aos="fade-up"
          className="text-lg text-gray-400 max-w-2xl mx-auto"
        >
          Automate your invoices, track clients effortlessly, and simplify your
          entire workflow — all from a beautifully designed dashboard.
        </p>

        <button
          data-aos="zoom-in"
          onClick={() => navigate("/dashboard")}
          className="mt-12 px-10 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-[1.03]"
        >
          Get Started
        </button>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20 flex flex-wrap gap-8 justify-center">
        <div
          data-aos="fade-right"
          className="w-80 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
        >
          <h3 className="text-xl font-semibold mb-3 text-gray-100">Smart Invoicing</h3>
          <p className="text-gray-300">
            Generate clean, professional invoices instantly.
          </p>
        </div>

        <div
          data-aos="fade-up"
          className="w-80 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
        >
          <h3 className="text-xl font-semibold mb-3 text-gray-100">Client Tracking</h3>
          <p className="text-gray-300">
            Organize your clients and track their billing history effortlessly.
          </p>
        </div>

        <div
          data-aos="fade-left"
          className="w-80 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
        >
          <h3 className="text-xl font-semibold mb-3 text-gray-100">Auto Reminders</h3>
          <p className="text-gray-300">
            Let the system follow up on late payments automatically.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 text-center">
        <h2
          data-aos="fade-up"
          className="text-4xl font-bold mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          How It Works
        </h2>

        <div className="flex flex-wrap justify-center gap-10">
          <div
            data-aos="fade-up"
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
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
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <span className="text-sm text-gray-400">Step 02</span>
            <h3 className="text-xl font-semibold mt-2 mb-2">Generate Invoices</h3>
            <p className="text-gray-400">
              Create invoices in seconds with automated calculations.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="w-72 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
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
            <h3 className="text-5xl font-extrabold text-white">10K+</h3>
            <p className="text-gray-400 mt-2">Invoices Generated</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-5xl font-extrabold text-white">5K+</h3>
            <p className="text-gray-400 mt-2">Happy Clients</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-5xl font-extrabold text-white">99.9%</h3>
            <p className="text-gray-400 mt-2">Uptime Reliability</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-28 text-center">
        <h2
          data-aos="fade-up"
          className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          Ready to simplify your billing?
        </h2>
        <p
          data-aos="fade-up"
          className="text-gray-400 max-w-xl mx-auto mb-10"
        >
          Join thousands of professionals who trust My SaaS to manage invoices,
          payments, and clients effortlessly.
        </p>

        <button
          data-aos="zoom-in"
          onClick={() => navigate("/dashboard")}
          className="px-12 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-[1.05]"
        >
          Start Free Today
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} My SaaS. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
