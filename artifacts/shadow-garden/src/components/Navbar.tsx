import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import logoPath from "@assets/7b7ac791-6c04-4e4f-9e07-44131e4310bb_1778662052573.png";
import { Menu, X, User, LogOut, Home, Trophy, LayoutGrid, MessageCircle } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    setLocation("/");
    setDrawerOpen(false);
  };

  const links = [
    { href: "/",            label: "Home",        icon: Home },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/cards",       label: "Cards",       icon: LayoutGrid },
    { href: "/chat",        label: "Chat",        icon: MessageCircle },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/85 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-red-900/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src={logoPath} alt="Shadow Garden" className="h-10 w-auto object-contain cursor-pointer" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location === link.href ? "text-red-500 glow-text" : "text-white/65 hover:text-red-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLocation("/profile")}
                    className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-white/75 hover:text-red-400 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                    <span>{user.display_name}</span>
                  </button>
                  <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm text-white/70 hover:text-red-400 transition-colors font-medium">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="btn-primary px-5 py-2 text-sm rounded-full font-semibold text-white">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-white/75 z-50" onClick={() => setDrawerOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Left Sliding Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-[70] bg-[#0a0a0a] border-r border-white/[0.07] flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <Link href="/" onClick={() => setDrawerOpen(false)}>
            <img src={logoPath} alt="Shadow Garden" className="h-9 w-auto object-contain" />
          </Link>
          <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User section */}
        {user && (
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] cursor-pointer hover:bg-white/[0.03] transition-colors"
            onClick={() => { setLocation("/profile"); setDrawerOpen(false); }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900 to-red-700 overflow-hidden flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : user.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.display_name}</p>
              <p className="text-white/40 text-xs">View profile →</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-red-700/20 text-red-400 border border-red-800/30"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={18} className={active ? "text-red-400" : "text-white/40"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/[0.07] space-y-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-colors font-medium"
            >
              <LogOut size={18} />
              Log Out
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setDrawerOpen(false)}>
                <button className="w-full py-2.5 text-center text-white/70 border border-white/10 rounded-xl text-sm">
                  Login
                </button>
              </Link>
              <Link href="/register" onClick={() => setDrawerOpen(false)}>
                <button className="w-full py-2.5 text-center btn-primary rounded-xl font-semibold text-white text-sm">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
