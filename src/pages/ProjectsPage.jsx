import { MusicNote } from "@mui/icons-material";

export default function ProjectsPage({ projects, onDeleteProject, onOpenProject, search, onNewProject }) {
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: "slideUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.08em" }}>
            ALL PROJECTS
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>Your Separated Stems</h2>
        </div>
        <button
          onClick={onNewProject}
          style={{ background: "linear-gradient(135deg, #00f5d4, #a29bfe)", border: "none", color: "#07070f", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          + New Separation
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Projects", val: projects.length},
          { label: "Stems Created",  val: projects.length * 4},
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.07em" }}>
              {s.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "#00f5d4", lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          {["File", "Date", "Duration", "Model", "Size", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#2a2a3a", fontSize: 13 }}>
            No projects found.
          </div>
        )}

        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="project-row"
            style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px",
              padding: "12px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
              alignItems: "center", background: "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                <MusicNote />
              </div>
              <span style={{ fontSize: 13, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace" }}>{p.date}</span>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace" }}>{p.duration}</span>
            <span style={{ fontSize: 11, color: "#00f5d4", fontFamily: "'DM Mono', monospace", background: "rgba(0,245,212,0.07)", padding: "2px 7px", borderRadius: 4, width: "fit-content" }}>
              {p.model}
            </span>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace" }}>{p.size}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onOpenProject?.(p)} style={{ background: "transparent", border: "1px solid #1a1a2e", color: "#aaa", borderRadius: 5, padding: "3px 9px", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Open</button>
              <button
                onClick={() => onDeleteProject?.(p.id)}
                style={{ background: "transparent", border: "1px solid rgba(255,71,87,0.15)", color: "#ff4757", borderRadius: 5, padding: "3px 9px", fontSize: 11, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}