function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-black border-r border-white/10 text-white p-6 flex flex-col z-30">
      <h2 className="text-xl font-semibold mb-10 tracking-wide uppercase text-gray-200">
        My SaaS
      </h2>

      <nav className="flex flex-col gap-6 text-gray-300">
        <a
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
          href="#"
        >
          Dashboard
        </a>

        <a
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
          href="/documents"
        >
          Documents
        </a>
        <a
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
          href="#"
        >
          Client Management
        </a>
        <a
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
          href="#"
        >
          Notifications
        </a>
        <a
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
          href="#"
        >
          Settings
        </a>
      </nav>
      <div className="mt-auto pt-6 flex items-center gap-4 border-t border-white/10">
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        <div>
          <p className="text-gray-200 font-medium">User Name</p>
          <p className="text-gray-500 text-xs">View Profile</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
