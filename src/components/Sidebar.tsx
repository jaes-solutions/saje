import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

function Sidebar() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Google user data comes in user_metadata
        const metadata = user.user_metadata;

        setUserName(
          metadata?.full_name ||
            metadata?.name ||
            user.email?.split("@")[0] ||
            "User",
        );

        setUserEmail(user.email || "");
        const avatarUrl =
          metadata?.avatar_url ||
          metadata?.picture ||
          user.identities?.[0]?.identity_data?.avatar_url ||
          user.identities?.[0]?.identity_data?.picture ||
          "";

        console.log("User Metadata:", metadata);
        console.log("Avatar URL:", avatarUrl);

        setAvatar(avatarUrl);
      }
    };

    getUser();
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-black border-r border-white/10 text-white p-6 flex flex-col z-30">
      <h2 className="text-xl font-semibold mb-10 tracking-wide uppercase text-gray-200">
        SAJE
      </h2>

      <nav className="flex flex-col gap-6 text-gray-300">
        <Link
          to="/dashboard"
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
        >
          Dashboard
        </Link>

        <Link
          to="/documents"
          className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition"
        >
          Documents
        </Link>

        <span className="text-sm uppercase tracking-wide text-gray-400">
          Client Management
        </span>
        <span className="text-sm uppercase tracking-wide text-gray-400">
          Notifications
        </span>
        <span className="text-sm uppercase tracking-wide text-gray-400">
          Settings
        </span>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="text-left">
            <p className="text-gray-200 font-medium">{userName}</p>
            <p className="text-gray-500 text-xs truncate max-w-[140px]">
              {userEmail}
            </p>
          </div>
        </button>

        {open && (
          <div className="mt-3 bg-black border border-white/10 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{userName}</p>
                <p className="text-gray-400 text-sm">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
