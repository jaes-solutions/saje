import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      const [invoicesRes, quotesRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("invoice_number, total_amount, currency, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("quotes")
          .select("quote_number, total_amount, currency, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const invoices =
        invoicesRes.data?.map((inv: any) => {
          const total = Number(inv.total_amount ?? 0);

          return {
            id: inv.invoice_number,
            type: "Invoice",
            total,
            currency: inv.currency || "INR",
            created_at: inv.created_at,
          };
        }) || [];

      const quotes =
        quotesRes.data?.map((q: any) => {
          const total = Number(q.total_amount ?? 0);

          return {
            id: q.quote_number,
            type: "Quote",
            total,
            currency: q.currency || "INR",
            created_at: q.created_at,
          };
        }) || [];

      const merged = [...invoices, ...quotes]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5);

      setRecentDocuments(merged);
    };

    fetchRecentDocuments();
  }, []);
  return (
    <section className="h-screen w-screen bg-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)]"></div>

      <Sidebar />

      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-20">
        <p className="text-sm text-gray-400">Welcome back</p>
      </header>

      <main className="absolute top-16 left-64 right-0 bottom-0 overflow-y-auto p-8">
        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">
          Dashboard
        </h2>
        <p className="text-gray-400 text-lg">
          Manage invoices, clients, billing and more.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 shrink-0">
          {/* Card 1 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.03] transition-all duration-300">
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Total Documents
            </h3>
            <p className="text-6xl font-extrabold mt-4 tracking-tight text-white">
              0
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.03] transition-all duration-300">
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Active Clients
            </h3>
            <p className="text-6xl font-extrabold mt-4 tracking-tight text-white">
              0
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.03] transition-all duration-300">
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Pending Payments
            </h3>
            <p className="text-6xl font-extrabold mt-4 tracking-tight text-white">
              0
            </p>
          </div>
        </div>

        {/* Secondary section */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-xl shadow-2xl shrink-0">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">
            Recent Activity
          </h3>
          <p className="text-gray-400">
            You haven’t added any invoices or clients yet. Once you start
            creating them, recent activity will appear here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/invoice")}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              Create Invoice
            </h4>
            <p className="text-gray-400 text-sm">
              Generate a new invoice for an existing or new client.
            </p>
          </div>

          <div
            onClick={() => navigate("/clients")}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              Add Client
            </h4>
            <p className="text-gray-400 text-sm">
              Store client details and manage billing history.
            </p>
          </div>

          <div
            onClick={() => navigate("/delivery")}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              Delivery Note
            </h4>
            <p className="text-gray-400 text-sm">
              Create and manage delivery notes.
            </p>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-100 mb-6">
            Recent Documents
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="border-b border-white/10 text-gray-300">
                <tr>
                  <th className="py-3">Document</th>
                  <th className="py-3">Document Type</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.length === 0 && (
                  <tr className="border-b border-white/5">
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No documents found
                    </td>
                  </tr>
                )}

                {recentDocuments.map((doc) => (
                  <tr
                    key={`${doc.type}-${doc.id}`}
                    className="border-b border-white/5"
                  >
                    <td className="py-3">
                      {doc.type === "Invoice" ? "INV" : "Q"}-{doc.id}
                    </td>
                    <td className="py-3">{doc.type}</td>
                    <td className="py-3">
                      {doc.currency} {doc.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-right space-x-4">
                      <button className="text-blue-400 hover:underline">
                        View
                      </button>
                      <button className="text-purple-400 hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <p className="text-sm text-gray-400">System Status</p>
            <p className="mt-2 text-lg font-semibold text-green-400">
              All systems operational
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <p className="text-sm text-gray-400">Last Backup</p>
            <p className="mt-2 text-lg font-semibold text-gray-200">Today</p>
          </div>
        </div>
      </main>
    </section>
  );
}

export default Dashboard;
