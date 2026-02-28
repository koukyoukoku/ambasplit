import { useState, useEffect, useRef, useCallback } from "react";
import { Search as SearchIcon, PlayArrow, Add, Search, MusicNote } from "@mui/icons-material";
import { BASE_URL } from "../constants";

export default function SearchYt({ onSelectTrack }) {
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [hoveredId, setHoveredId]     = useState(null);
  const debounceRef                   = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/youtube/search?q=${encodeURIComponent(q)}&limit=12`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      setError("Search failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => doSearch(query), 420);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  return (
    <div style={{ animation: "slideUp 0.4s ease", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 600,
          letterSpacing: "-0.025em", marginBottom: 8,
          background: "linear-gradient(90deg, #00f5d4, #a29bfe)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Search & Separate
        </h1>
      </div>
      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: "#444", display: "flex", alignItems: "center", pointerEvents: "none",
        }}>
          <SearchIcon sx={{ fontSize: 20 }} />
        </span>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch(query)}
          placeholder="Search for a song, id, artist, or album…"
          style={{
            width: "100%", background: "#0e0e1c", border: "1px solid #1a1a2e",
            borderRadius: 12, padding: "13px 16px 13px 42px",
            fontSize: 15, color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif",
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(0,245,212,0.4)"}
          onBlur={e  => e.target.style.borderColor = "#1a1a2e"}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#444", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}
          >×</button>
        )}
      </div>
      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(255,71,87,0.07)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: 8, color: "#ff6b6b", fontSize: 12, fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}
      {loading && (
        <>
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(90deg,#0e0e1c 25%,#151525 50%,#0e0e1c 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ height: 12, background: "#151525", borderRadius: 4, marginBottom: 6, width: "80%" }} />
                  <div style={{ height: 10, background: "#111120", borderRadius: 4, width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {!loading && results.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.07em", marginBottom: 14 }}>
            {results.length} RESULTS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {results.map(item => {
              const isHover = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: 12, overflow: "hidden",
                    background: isHover ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isHover ? "rgba(0,245,212,0.18)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0a0a14", overflow: "hidden" }}>
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.2s", transform: isHover ? "scale(1.04)" : "scale(1)" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 28 }}><MusicNote sx={{ fontSize: 28 }} /></div>
                    }

                    {item.duration && (
                      <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.78)", color: "#ddd", fontSize: 10, fontFamily: "'DM Mono', monospace", padding: "2px 5px", borderRadius: 4 }}>
                        {item.duration}
                      </span>
                    )}

                    {isHover && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <ActionCircle
                          icon={<PlayArrow sx={{ fontSize: 18 }} />}
                          label="Preview"
                          onClick={() => window.open(`https://youtube.com/watch?v=${item.id}`, "_blank")}
                        />
                        <ActionCircle
                          icon={<Add sx={{ fontSize: 18 }} />}
                          label="Separate"
                          accent
                          onClick={() => onSelectTrack?.({ id: item.id, title: item.title, channel: item.channel, thumbnail: item.thumbnail })}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#d0d0d8", lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.title}
                    </div>
                    {item.channel && (
                      <div style={{ fontSize: 11, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.channel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!loading && !error && results.length === 0 && query.trim() && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#2a2a3a" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}><Search sx={{ fontSize: 40 }} /></div>
          <div style={{ fontSize: 13 }}>No results for "{query}"</div>
        </div>
      )}
      {!query.trim() && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}><Search sx={{ fontSize: 48 }} /></div>
          <p style={{ color: "#2a2a3a", fontSize: 13 }}>Type a song, id, or artist name to get started</p>
        </div>
      )}
    </div>
  );
}

function ActionCircle({ icon, label, accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={label}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        background: accent ? (hov ? "#00f5d4" : "rgba(0,245,212,0.85)") : (hov ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)"),
        border: "none", color: accent ? "#07070f" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.12s",
        transform: hov ? "scale(1.1)" : "scale(1)",
      }}
    >{icon}</button>
  );
}