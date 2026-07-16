import React from "react";
import { 
  Files, 
  GitBranch, 
  UploadCloud, 
  Settings, 
  User, 
  LogOut, 
  ShieldCheck,
  Github,
  Globe,
  Database
} from "lucide-react";
import { motion } from "motion/react";

export type SidebarSection = "explorer" | "source_control" | "unpacker" | "settings" | "github" | "deployment" | "cloud";

interface ActivityBarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  user: { login: string; avatar_url: string; name?: string } | null;
  selectedRepo: any;
  selectedBranch: string;
  hasFiles: boolean;
  hasActiveFile: boolean;
  onLogout: () => void;
  accentColor: string;
  token?: string | null;
}

export default function ActivityBar({
  activeSection,
  onSectionChange,
  user,
  selectedRepo,
  selectedBranch,
  hasFiles,
  hasActiveFile,
  onLogout,
  accentColor,
  token
}: ActivityBarProps) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { 
      id: "explorer" as SidebarSection, 
      icon: Files, 
      label: "Explorer",
      badge: hasFiles ? undefined : "empty"
    },
    { 
      id: "source_control" as SidebarSection, 
      icon: GitBranch, 
      label: "Source Control",
      badge: selectedRepo ? "ready" : undefined
    },
    {
      id: "deployment" as SidebarSection,
      icon: Globe,
      label: "Deployment & Preview",
      badge: undefined
    },
    {
      id: "cloud" as SidebarSection,
      icon: Database,
      label: "Cloud Services & DB",
      badge: undefined
    }
  ];

  return (
    <div className="w-[48px] min-w-[48px] h-full bg-zinc-930 border-r border-zinc-900 flex flex-col justify-between items-center py-2 select-none z-50">
      
      {/* Top Utilities (Activity Icons) */}
      <div className="w-full flex flex-col items-center gap-1">

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="relative w-12 h-11 flex items-center justify-center group outline-none cursor-pointer"
              title={item.label}
            >
              {/* Active Left Indicator Line */}
              {isActive && (
                <div 
                  className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-md" 
                  style={{ backgroundColor: accentColor }}
                />
              )}

              <div 
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border shrink-0 ${
                  isActive 
                    ? "shadow-md border-transparent text-white" 
                    : "bg-zinc-950/20 border-zinc-900/60 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 hover:border-zinc-800"
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.2 : 1.8} />
              </div>

              {/* Badges/Indicators */}
              {item.badge && (
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                  item.badge === "active" 
                    ? "bg-[#375a7f]" 
                    : item.badge === "ready"
                    ? "bg-emerald-500"
                    : "bg-zinc-700"
                }`} />
              )}

              {/* Tooltip */}
              <div className="absolute left-14 px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity delay-200 z-50 whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile and Studio Settings */}
      <div className="w-full flex flex-col items-center gap-2 relative" ref={menuRef}>
        
        {/* User Profile */}
        {user ? (
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer relative group"
              title={`Profile: @${user.login}`}
            >
              <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-emerald-500/10" />
            </button>

            {showProfileMenu && (
              <div className="absolute bottom-12 left-10 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 z-50 animate-[fadeIn_0.15s_ease-out] font-sans">
                <div className="px-3 py-2 border-b border-zinc-850 mb-1">
                  <p className="text-[10px] text-zinc-500 font-mono">VS Code Session</p>
                  <p className="text-xs font-bold text-zinc-200 truncate font-mono">@{user.login}</p>
                </div>

                <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure GitHub Sync</span>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-left font-mono mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center text-zinc-650 cursor-default" title="Unauthenticated Session">
            <User className="w-4 h-4" />
          </div>
        )}

        {/* Studio Settings Trigger - Beneath the Profile Icon */}
        <button
          onClick={() => onSectionChange("settings")}
          className="relative w-12 h-11 flex items-center justify-center group outline-none cursor-pointer"
          title="Studio Settings"
        >
          {activeSection === "settings" && (
            <div 
              className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-md" 
              style={{ backgroundColor: accentColor }}
            />
          )}

          <div 
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border shrink-0 ${
              activeSection === "settings" 
                ? "shadow-md border-transparent text-white" 
                : "bg-zinc-950/20 border-zinc-900/60 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 hover:border-zinc-800"
            }`}
            style={activeSection === "settings" ? { backgroundColor: accentColor } : {}}
          >
            <Settings className="w-[20px] h-[20px]" strokeWidth={activeSection === "settings" ? 2.2 : 1.8} />
          </div>

          <div className="absolute left-14 px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity delay-200 z-50 whitespace-nowrap font-sans">
            Studio Settings
          </div>
        </button>

      </div>

    </div>
  );
}
