function Navbar() {
  return (
    <header className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      <h3 className="text-lg font-semibold text-gray-200 tracking-tight uppercase">
        Dashboard
      </h3>

      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition text-white text-sm font-medium rounded-md border border-white/20">
        Log out
      </button>
    </header>
  );
}

export default Navbar;
