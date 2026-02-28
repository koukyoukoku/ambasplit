import { Tune, FolderCopy, Settings, MusicNote } from "@mui/icons-material";

const ICON_MAP = {
  separate: <Tune />,
  projects: <FolderCopy />,
  settings: <Settings />,
};

export default function Sidebar({ activeNav, setActiveNav, collapsed, setCollapsed }) {
  const NAV_ITEMS = [
    { label: "Separate", key: "separate" },
    { label: "Projects", key: "projects" },
    { label: "Settings", key: "settings" },
  ];

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      minHeight: "100vh",
      background: "#0a0a16",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0, left: 0,
      zIndex: 200,
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: collapsed ? "22px 0" : "22px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 10,
      }}>
        {collapsed ? (
          <img src="/logo.png" alt="logo" style={{ width: 30, height: 30, borderRadius: 4 }} />
        ) : (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
            Ambatu<span style={{ color: "#00f5d4" }}>split</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.key;
          return (
            <div
              key={item.key}
              className="nav-item"
              onClick={() => setActiveNav(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "11px 0" : "11px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer",
                background: isActive ? "rgba(0,245,212,0.06)" : "transparent",
                borderLeft: isActive ? "2px solid #00f5d4" : "2px solid transparent",
                color: isActive ? "#00f5d4" : "#555",
                userSelect: "none",
              }}
              title={collapsed ? item.label : ""}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: isActive ? 1 : 0.5, fontSize: 20 }}>
                {ICON_MAP[item.key]}
              </span>
              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}