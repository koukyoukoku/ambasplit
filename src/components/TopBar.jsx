import IconBtn from "./Iconbtn";

export default function TopBar({
  activeNav, phase, fileName,
  currentTime, duration, zoomLevel, isLoading, isPlaying,
  onPlayPause, onStop, onZoom, onNew,
  projectSearch, setProjectSearch,
  settingsSaved, onSaveSettings,
}) {
  const fmtSecs = (s) => {
    const t = Math.max(0, Math.floor(s || 0));
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };

  return (
    <header style={{
      height: 56,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      background: "rgba(7,7,15,0.9)",
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#333", fontFamily: "'DM Mono', monospace" }}>
          {activeNav === "separate" ? "" : activeNav}
        </span>
        {activeNav === "separate" && phase === "done" && (
          <>
            <span style={{ color: "#5a5a63" }}>/</span>
            <span style={{ fontSize: 12, color: "#9e9e9e", fontFamily: "'DM Mono', monospace", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileName}
            </span>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        {activeNav === "separate" && phase === "done" && (
          <>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#444", minWidth: 90 }}>
              {fmtSecs(currentTime)}{duration > 0 ? ` / ${fmtSecs(duration)}` : ""}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <IconBtn onClick={() => onZoom("in")}  disabled={isLoading || zoomLevel === 128}>−</IconBtn>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333", minWidth: 30, textAlign: "center" }}>
                {zoomLevel >= 1024 ? `${zoomLevel / 1024}k` : zoomLevel}
              </span>
              <IconBtn onClick={() => onZoom("out")} disabled={isLoading || zoomLevel === 8192}>+</IconBtn>
            </div>

            <div style={{ width: 1, height: 16, background: "#1a1a2a" }} />

            <IconBtn onClick={onStop} disabled={isLoading}>⏹</IconBtn>

            <button onClick={onPlayPause} disabled={isLoading} style={{
              background: isPlaying ? "rgba(0,245,212,0.1)" : "rgba(0,245,212,0.06)",
              border: "1px solid rgba(0,245,212,0.3)",
              color: isLoading ? "#2a2a3a" : "#00f5d4",
              borderRadius: 7, padding: "6px 16px",
              fontSize: 12, fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {isLoading
                ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Loading</>
                : isPlaying ? "⏸  Pause" : "▶  Play All"
              }
            </button>

            <button onClick={onNew} style={{
              background: "transparent", border: "1px solid #797878",
              color: "#797878", borderRadius: 7, padding: "6px 12px",
              fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace",
            }}>+ New</button>
          </>
        )}
        {activeNav === "projects" && (
          <input
            className="s-input"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={e => setProjectSearch(e.target.value)}
            style={{ width: 220, padding: "6px 12px", fontSize: 12 }}
          />
        )}
        {activeNav === "settings" && (
          <button onClick={onSaveSettings} style={{
            background: settingsSaved ? "rgba(0,245,212,0.15)" : "rgba(0,245,212,0.07)",
            border: `1px solid ${settingsSaved ? "#00f5d4" : "rgba(0,245,212,0.25)"}`,
            color: "#00f5d4", borderRadius: 7, padding: "6px 16px",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
          }}>
            {settingsSaved ? "✓ Saved" : "Save Settings"}
          </button>
        )}
      </div>
    </header>
  );
}