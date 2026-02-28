import { useState } from "react";
import { FileUpload } from "@mui/icons-material";

export default function Upload({ onFile, jobError }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div style={{ animation: "slideUp 0.4s ease", maxWidth: 620, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: "clamp(26px, 4vw, 44px)",
          fontWeight: 600,
          lineHeight: 1.15,
          marginBottom: 12,
          letterSpacing: "-0.025em",
          background: "linear-gradient(90deg, #00f5d4, #a29bfe)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Let's split your track
        </h1>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>
          Powered by Demucs AI Model.
        </p>
        {jobError && (
          <div style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "rgba(255,71,87,0.07)",
            border: "1px solid rgba(255,71,87,0.2)",
            borderRadius: 8,
            color: "#ff6b6b",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
          }}>
            ⚠ {jobError}
          </div>
        )}
      </div>

      <div
        className="drop-zone"
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); onFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById("file-in").click()}
        style={{
          border: `2px dashed ${isDragging ? "rgba(0,245,212,0.6)" : "#151525"}`,
          borderRadius: 16,
          padding: "52px 40px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "rgba(0,245,212,0.02)" : "rgba(255,255,255,0.01)",
          marginBottom: 28,
        }}
      >
        <input
          id="file-in"
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={e => onFile(e.target.files[0])}
        />
        <span className="dz-icon" style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>
          <FileUpload sx={{ fontSize: 70 }} />
        </span>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
          Drop your audio file here
        </p>
        <p style={{ color: "#3a3a4e", fontSize: 13, marginBottom: 20 }}>
          WAV · MP3 · FLAC · M4A
        </p>
        <button style={{
          background: "rgba(0,245,212,0.07)",
          border: "1px solid rgba(0,245,212,0.2)",
          color: "#00f5d4",
          borderRadius: 8,
          padding: "9px 22px",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}>
          Browse Files
        </button>
      </div>
    </div>
  );
}