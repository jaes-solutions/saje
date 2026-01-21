import Sidebar from "../components/Sidebar";

function Dashboard() {
  return (
    <section className="h-screen w-screen bg-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_60%)]"></div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 flex-shrink-0">
          {/* Card 1 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.03] transition-all duration-300">
            <h3 className="text-sm uppercase tracking-wide text-gray-400">
              Total Invoices
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
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-xl shadow-2xl flex-shrink-0">
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer">
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              Create Invoice
            </h4>
            <p className="text-gray-400 text-sm">
              Generate a new invoice for an existing or new client.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer">
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              Add Client
            </h4>
            <p className="text-gray-400 text-sm">
              Store client details and manage billing history.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition-all cursor-pointer">
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              View Reports
            </h4>
            <p className="text-gray-400 text-sm">
              Analyze revenue, payments, and outstanding balances.
            </p>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <h3 className="text-xl font-semibold text-gray-100 mb-6">
            Recent Invoices
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="border-b border-white/10 text-gray-300">
                <tr>
                  <th className="py-3">Invoice</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3">#INV-001</td>
                  <td className="py-3">—</td>
                  <td className="py-3">₹0</td>
                  <td className="py-3 text-yellow-400">Pending</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">#INV-002</td>
                  <td className="py-3">—</td>
                  <td className="py-3">₹0</td>
                  <td className="py-3 text-green-400">Paid</td>
                </tr>
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
            <p className="text-sm text-gray-400">Payment Gateway</p>
            <p className="mt-2 text-lg font-semibold text-green-400">
              Connected
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
